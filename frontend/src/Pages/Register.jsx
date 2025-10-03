import axiosInstance from '../config/axios'
import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import { useContext } from 'react'

const Register = () => {

  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  const {setUser} = useContext(UserContext);

  const navigate = useNavigate();

  function submitHandler(e)
  {
    e.preventDefault();

    axiosInstance.post('/users/register',{
      email,
      password
    }).then((res) =>{
      navigate('/');
      localStorage.setItem('token',res.data.token);
      setUser(res.data.user);
      console.log(res.data);
    })
    .catch((error) =>{
      console.log(error.response.data);
    })
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Register
        </h2>
        <form className="space-y-5" onSubmit={submitHandler}>
          <div>
            <label className="block text-gray-300 mb-1" htmlFor="email">
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              id="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1" htmlFor="password">
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              id="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
          >
            Sign up
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-gray-400">
            Already have an account ?&nbsp;
            <a
              href="/login"
              className="text-blue-400 hover:underline"
            >
              Login
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}

export default Register