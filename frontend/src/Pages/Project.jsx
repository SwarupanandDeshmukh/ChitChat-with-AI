import React, { useState,useContext} from 'react'
import { useLocation } from 'react-router-dom'
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { UserIcon, UserPlusIcon, UsersIcon } from '@heroicons/react/24/solid';
import { useEffect,useRef } from 'react';
import axiosInstance from '../config/axios';
import { initializeSocket,sendMessage,recieveMessage } from '../config/socket';
import ReactMarkdown from 'react-markdown';
import getWebInstance from '../config/WebContainer.js';
import { UserContext } from '../context/user.context';



const Project = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUsersID,setSelectedUsersID] = useState([]);
  const location = useLocation();

  const {user} = useContext(UserContext);

  const [users,getUsers] = useState([]); //all Users that have signed in

  const [project,setProject] = useState([]);

  const [message,setMessage] = useState('');

  const [Webcontainer,setWebcontainer] = useState(null);

  const MessageBox = useRef(null)

  const [messages,setMessages] = useState([]);

  const [runProcess,setRunProcess] = useState(null);

  const [isLoading,setisLoading] = useState(false);

  const [iframeurl,setiframeurl] = useState(null);

  const [fileTree,setfileTree] = useState({
    
  });

  const [currentFile,setCurrentFile] = useState(null);
  const [OpenFile,setOpenFile] = useState([]);


  useEffect(()=>{
    
    axiosInstance.post('/project/ProjectById',{
      ProjectID:location.state._id
    })
    .then((res) =>{
      setProject(res.data.projectById[0])
      console.log(res.data.projectById[0])

      //setfileTree(res.data.projectById[0].fileTree);
    })
    .catch((err)=>{
      console.log(err);
    })

    

    axiosInstance.get('/users/getUsers')
    .then((res)=>{
      getUsers(res.data.allUser);
    })
    .catch((err)=>{
      console.log(err);
    })


    if(!project._id)
      return;

    initializeSocket(project._id);

    recieveMessage('project-message',data=>{

      if(data.sender === 'AI')
      {
         const messageAI = JSON.parse(data.message);
          if(messageAI.fileTree)
          {
              setfileTree(messageAI.fileTree)
               Webcontainer?.mount(messageAI.fileTree)
          }
            console.log(JSON.parse(data.message));  
      }

      setMessages(prev => [
      ...prev,
      {
        ...data,
        type: data.sender === 'AI' ? 'ai' : 'incoming'
      }
    ]);
    });

    if(!Webcontainer)
    {
      getWebInstance().then(container=>{
        setWebcontainer(container);
        console.log(container)
        console.log("web container created");
      })
    }



  },[project._id])

  const handleUserSelect = (userID) =>{
    setSelectedUsersID(prev=> 
      prev.includes(userID) ?
      prev.filter(id=> id !== userID) :
      [...prev,userID]
    );
  };

  const addUserToProject = () =>{
    axiosInstance.put('/project/addUser',{
      ProjectID:location.state._id,
      users:users
    })
    .then((res) =>{
      console.log(res.data);
    })
    .catch((err) =>{
      console.log(err);
    })

    setShowAddUserModal(false);
  }

  const send = () =>{

        console.log(user);

        console.log(message);
        sendMessage('project-message',{
          message,
          sender:user.email
        });

       setMessages(prev => [...prev, { message, sender: user.email, type: 'outgoing' }]);

        setMessage('');
  }



function updateFT(ft){
  axiosInstance.put('/project/updateFTree',
    {
      ProjectID:location.state._id,
      fileTree:ft
    }
  ).then((res)=>{
    console.log(res)
  })
  .catch((err)=>{
    console.log(err);
  })
}


function ConvertString(InputMessage){

  const message = JSON.parse(InputMessage)
  return message.text;
  
}
  return (
    <div>
      <main className='h-screen w-screen flex'>
                  {isLoading && (
             <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="flex flex-row gap-2 mb-4">
      <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce"></div>
      <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
      <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.5s]"></div>
    </div>
    <h1 className="text-white text-lg font-semibold">Starting server...</h1>
  </div>
          )}
        <section className='left relative h-full min-w-[400px] bg-slate-900 flex flex-col'>
          <header className='z-10 w-full flex justify-between p-3 bg-slate-700 items-center absolute top-0'>
            <button onClick={() => setShowAddUserModal(true)}>
              <UserPlusIcon className='h-6 w-6 text-blue-300' />
            </button>
            <button className='px-2' onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
              <UsersIcon className='h-6 w-6 text-blue-300' />
            </button>
          </header>

          <div className='conversation-area flex flex-col flex-1 h-full pt-14 pb-14 relative'>
            <div ref={MessageBox}
            className="messageBox flex-grow flex flex-col p-3 gap-2 overflow-auto max-h-full">
              {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`max-w-52 text-white flex flex-col p-2 rounded-md ${
                      msg.type === 'outgoing'
                        ? 'ml-auto bg-blue-500'
                        : msg.type === 'ai'
                        ? 'bg-purple-900'
                        : 'bg-gray-700'
                    }`}
                  >
                    <span className="text-sm opacity-50">{msg.sender}</span>
                    
                    {msg.type === 'ai' ? (
                      <div className='text-md max-w-full overflow-x-auto whitespace-pre-wrap break-words'>
                        <ReactMarkdown>{ConvertString(msg.message)}</ReactMarkdown>
                       </div>
                      
                    ) : (
                      <span className="text-lg whitespace-pre-wrap">{msg.message}</span>
                    )}
                  </div>
                ))}
              
            </div>
            <div className="InputEntry flex mt-auto p-2 bg-slate-800 w-full absolute bottom-0">
              <input
                type='text'
                placeholder='Enter message...'
                value={message}
                onChange={(e)=> setMessage(e.target.value)}
                className='px-2 py-2 outline-none border-none flex-1 bg-slate-700 text-white rounded'
              />
              <button>
              <PaperAirplaneIcon className='h-6 w-6 text-blue-300 ml-2' onClick={send}/>
              </button>
            </div>
          </div>

          <div className={`sidePanel absolute bg-slate-800 h-full w-full top-0 z-50
            transition-all ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <header className='w-full flex justify-between items-center p-3 bg-slate-700'>
              <h1 className='text-lg text-blue-300 font-semibold'>Project Members</h1>
              <button className='px-2' onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
                <XMarkIcon className='h-6 w-6 text-blue-300' />
              </button>
            </header>

            <div className='Users flex flex-col gap-3 p-3'>
              {project.users && project.users.length > 0 ? (
                project.users.map(user =>(
                    <div className="flex items-center gap-3 bg-slate-700 p-3 rounded hover:bg-slate-600">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-blue-200 font-bold text-lg">
                          <UserIcon className='h-4 w-4' />
                      </div>
                          <span className="text-white font-semibold">{user.email}</span>
                    </div>
                ))
              ):(
                 <span className="text-blue-200">No users found</span>
              )}
              
            </div>
          </div>

          {showAddUserModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">All Users</h2>
                    <button onClick={() => setShowAddUserModal(false)}>
                      <XMarkIcon className="h-6 w-6 text-blue-300" />
                    </button>
                  </div>
                  {/* Make users list scrollable and modal fixed height */}
                  <div className="flex flex-col gap-4 mb-6 overflow-y-auto max-h-72">
                    {users.map(user => (
                      <div key={user._id} className={`flex items-center cursor-pointer transition-all ${selectedUsersID.includes(user._id) ? 'border-2 border-green-700' : ""} gap-3 bg-slate-700 p-3 rounded`} 
                        onClick={()=>handleUserSelect(user._id)}>
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-blue-200 font-bold text-lg">
                          <UserIcon className='h-4 w-4' />
                        </div>
                        <span className="text-white font-medium">{user.email}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded transition"
                    onClick={addUserToProject}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
        </section>

        <section className='right flex flex-grow h-full w-full '>
            <div className="fileExplorer bg-slate-800 max-w-64 min-w-52">
              <div className='fileTree flex flex-col gap-1' >
               {
                Object.keys(fileTree).map((file,i)=>
                (
                   <div className='TreeElement flex px-4 py-2 bg-slate-600 cursor-pointer hover:bg-slate-500'
                    onClick={
                      ()=>{
                        setCurrentFile(file),
                        setOpenFile(prev => Array.from(new Set([...prev, file])));
                      }
                    }
                   >
                    <span className='text-lg font-semibold text-white'>{file}</span>
                </div>
                ))
               }
              </div>
            </div>

              <div className="flex flex-col w-full h-screen bg-slate-700">
                {currentFile && (
                  <div className="codeEditor flex flex-col gap-2 flex-1 w-full">
                    <div className="top flex py-2 px-2 justify-between w-full items-center">
                      <div className='files flex py-2 px-2'>
                      {
                        OpenFile.map((file,i)=>(
                          <div key={i} className="flex items-center gap-3 bg-slate-600 px-3 py-2 rounded mr-2">
                        <span className="text-white font-semibold text-lg">{file}</span>
                        <XMarkIcon
                          className="h-4 w-4 text-blue-200 cursor-pointer"
                          onClick={
                            ()=>{
                              setOpenFile(prev => {
                                  const updated = prev.filter(f => f !== file);
                                  
                                  // If current file is being closed, pick another one from updated list
                                  if (currentFile === file) {
                                    setCurrentFile(updated.length > 0 ? updated[0] : null);
                                  }

                                  return updated;
                                });
                            }
                          }
                        />
                      </div>
                        ))
                      }
                    </div>
                    <div className=''>
                      <button className='text-white bg-green-500 p-2 rounded-sm'
                      onClick={async () => {
                            if (!Webcontainer) {
                              console.error("Webcontainer not initialized yet.");
                              return;
                            }

                            try {

                              setisLoading(true);
                              await Webcontainer.mount(fileTree); // you must await this

                              const installprocess = await Webcontainer?.spawn('npm',['install']);
                              installprocess.output.pipeTo(new WritableStream({
                                write(chunk)
                                {
                                  console.log(chunk)
                                }
                              }))

                              await installprocess.exit;

                              if(runProcess)
                              {
                                runProcess.kill();
                              }

                              let tempProcess = await Webcontainer?.spawn('npm',['start']);
                              tempProcess.output.pipeTo(new WritableStream({
                                write(chunk)
                                {
                                  console.log(chunk)
                                }
                              }))

                              setRunProcess(tempProcess);

                              Webcontainer.on('server-ready',(port,url)=>{
                                console.log(port,url);
                                setiframeurl(url);
                                setisLoading(false)
                              });


                            } catch (err) {
                              console.error("Error while listing files:", err);
                            }
                          }}
                      >
                        run
                      </button>
                    </div>
                    </div>

                    <div className="bottom flex-1 w-full px-4 pb-4 gap-2 flex">
  {fileTree[currentFile] && (
    <textarea
      value={fileTree[currentFile].file.contents}
      onChange={(e) => {
  
        const ft = {...fileTree,
          [currentFile]:{
            file:{
              contents:e.target.value
            }
          }
        }

        setfileTree(ft);
      updateFT(ft)
}}
      className="w-1/2 text-white h-full bg-slate-900 resize-none outline-none"
    />
  )}

  {iframeurl && Webcontainer && (
    <div className='h-full flex flex-col w-1/2 bg-white'>
      <div className='address-bar '>
        <input type='text' value = {iframeurl} 
        onChange={(e)=>setiframeurl(e.target.value)} className='w-full p-2 bg-blue-200'/>
      </div>
      <iframe src={iframeurl} className="w-1/2 h-full rounded-md" />
    </div>
  )}
</div>       
                   
                  </div>
                )}
              </div>
        </section>

      </main>
    </div>
  )
}

export default Project