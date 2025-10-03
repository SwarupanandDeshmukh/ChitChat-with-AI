import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import { useState,useContext } from 'react';


const UserAuth = ({children}) => {

    const [loading,isLoading] = useState(true);

    const {user} = useContext(UserContext);

    const token = localStorage.getItem('token');

    const navigate = useNavigate();

    useEffect(() =>{
        if(user)
        {
            const timer = setTimeout(()=> isLoading(false),1500);
            return ()=>clearTimeout(timer);
        }

       if(!user || !token)
       {
            navigate('/login');
       }

    },[])


    if(loading)
    {
        return (
            <div className='min-h-screen bg-gray-900 p-4 flex items-center justify-center'>
                
                    <div class="flex flex-row gap-2">
                    <div class="w-4 h-4 rounded-full bg-blue-700 animate-bounce"></div>
                    <div class="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
                    <div class="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.5s]"></div>
                    </div>
            </div>
        )
    }
  return (
    <>
        {children}
    </>
    
  )
}

export default UserAuth