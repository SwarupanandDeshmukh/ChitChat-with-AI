import socket from 'socket.io-client'

let socketInstance = null;

const initializeSocket = (projectID) =>{
    socketInstance = socket(import.meta.env.VITE_BACKEND_URL,{
        auth:{
            token:localStorage.getItem('token')
        },
        query:{
            projectID
        }
    })
}

const recieveMessage = (eventName,cb) =>{
    socketInstance.on(eventName,cb)
}

const sendMessage = (eventName,data) =>{
    socketInstance.emit(eventName,data);
}


export {initializeSocket,recieveMessage,sendMessage};