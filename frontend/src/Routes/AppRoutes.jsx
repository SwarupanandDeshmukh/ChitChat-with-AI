import React from 'react'
import {BrowserRouter,Route,Routes} from 'react-router-dom';
import Home from '../Pages/Home.jsx';
import Login from '../Pages/Login.jsx';
import Register from '../Pages/Register.jsx';
import Project from '../Pages/Project.jsx';
import UserAuth from '../auth/UserAuth.jsx';

const AppRoutes = () => {
  return (
    <BrowserRouter>
    <Routes>

        <Route path='/' element={<UserAuth><Home/></UserAuth>}/>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/project' element={<UserAuth><Project /></UserAuth>} />

    </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes;