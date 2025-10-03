import express from 'express';
import morgan from 'morgan';
import UserRouter from './Routes/UserRoute.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import ProjectRouter from './Routes/ProjectRoute.js';
import AIRouter from './Routes/AIRoute.js';

const app = express();


app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use('/users',UserRouter)
app.use('/project',ProjectRouter)
app.use('/ai',AIRouter);
app.use(cookieParser());


app.get("/",(req,res) => {
    res.send('Hello world');
});

export default app;

