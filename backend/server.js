import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import http from 'http';
import connectDB from './db/db.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Project from './models/ProjectModel.js';
import generateResult from './Services/AIService.js';



const port = process.env.PORT;

connectDB();


const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:"*"
    }
});

io.use(async (socket,next)=>{
    try{
            const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];

            const projectID = socket.handshake.query.projectID;

            if(!projectID)
                return next(new Error('Project ID is required'))

            if(!mongoose.Types.ObjectId.isValid(projectID))
                return next(new Error('Project ID is not valid'));

            socket.project = await Project.findById(projectID)

            if(!token)
                return next(new Error("Authentication Error"));

            const decode = jwt.verify(token,process.env.JWT_SECRET);

            if(!decode)
                return next(new Error("Authentication Error"));
            socket.user = decode;
            next();
    }
    catch(error)
    {
        next(error);
    }
});

io.on('connection', socket => {

    console.log("User connected via socket");

    const roomID = socket.handshake.query.projectID;

    if (!roomID) {
    console.log('No project ID provided');
    return;
  }
    socket.join(roomID);

    socket.on('project-message',async data=>{

        const message = data.message;

        const aiMessage = message.includes("@ai");

        socket.broadcast.to(roomID).emit('project-message',data)

        console.log(data);

        if(aiMessage)
        {

            const prompt = message.replace('@ai','');

            const result = await generateResult(prompt);


            io.to(roomID).emit('project-message',{
                message:result,
                sender:'AI'
            });

            return;
        }

        
    })

  socket.on('event', data => { /* … */ });
  socket.on('disconnect', () => {
    console.log('user Disconnected');
    socket.leave(roomID);
  });
});

server.listen(port, ()=>{
    console.log(`The server is running at ${port}`)
})
