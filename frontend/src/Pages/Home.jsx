import React from 'react'
import { UserContext } from '../context/user.context'
import { useContext,useState } from 'react'
import { PlusIcon,UserGroupIcon } from '@heroicons/react/24/solid';
import axiosInstance from '../config/axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {

  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects,setProjects] = useState([]);
  const navigate = useNavigate();

  function createProject(e)
  {
    e.preventDefault();
    axiosInstance.post('/project/create',{
      Project_name:projectName
    }).then((res) =>{
      console.log(projectName)
      console.log(res.data.project)
      setShowModal(false);
    })
    .catch((error) =>{
      console.log(error);
    });
  }

 function getProjects(e)
 {
    axiosInstance.get('/project/allProject')
    .then((res)=>{
      console.log(res.data);
      setProjects(res.data.AllProject);
    }).catch((err)=>{
      console.log(err);
    });
 };

 useEffect(() =>{
  getProjects();
 },[]);

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex items-start gap-8">
      <button
        className="flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition m-4"
        onClick={() => setShowModal(true)}
      >
        <PlusIcon className="h-8 w-8" />
        <span className='text-lg'>New Project</span>
      </button>
    
   <div className='flex-1 mt-4'>
  <div className='grid gap-4'>
    {projects.length == 0 ? 
      (<div className='text-md text-blue-200'>No projects found</div>)
      :
      (
        projects.map((project) =>
          (
            <div
              key={project._id}
              className='bg-gray-800 hover:bg-slate-700 text-white rounded-lg p-4 shadow max-w-xs w-full'
              onClick={() => {
                navigate('/project',{state:project})
              }}
            >
              <span className='font-semibold text-xl'>{project.Project_name}</span>
              <div className='flex items-center gap-1 mt-2 text-blue-300 text-md'>
                <UserGroupIcon className="h-5 w-5" /> Participants: {project.users.length}
                </div>
            </div>
          ))
      )
    }
  </div>
</div>
      

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-bold text-white mb-4 text-center">Create New Project</h2>
            <form
              onSubmit={createProject}
            >
              <input
                className="w-full px-4 py-2 rounded bg-gray-700 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="Project Name"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home