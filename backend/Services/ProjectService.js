import mongoose from "mongoose";
import Project from "../models/ProjectModel.js";

const CreateProject = async ({Project_name,userID}) =>{
    if(!Project_name)
        throw new Error("Project name is required")
    if(!userID)
        throw new Error("userID is required");

    try{
        const project = await Project.create({
            Project_name:Project_name,
            users:[userID]
        });

     return project;
    }
    catch(error)
    {
        if(error.code === 11000)
        {
            throw new Error("Project name already exists");
        }
    }
}


const GetAllProject = async ({userID}) =>{
    if(!userID)
    {
        throw new Error("User ID is required");
    }

    const AllProject = await Project.find({
        users:userID
    });

    return AllProject;
}


const AddUserToProject = async ({ProjectID,users,userID}) =>{
    if(!ProjectID)
        throw new Error("Project ID is required");

    if(!users)
        throw new Error("Users array is required");

    if(!userID)
        throw new Error("User ID is required");

    if(!mongoose.Types.ObjectId.isValid(ProjectID))
        throw new Error("Invalid Project ID");

    if(!mongoose.Types.ObjectId.isValid(userID))
        throw new Error("Invalid User ID");

    const loggedUserProject = await Project.findOne({
        _id:ProjectID,
        users : userID
    });

    if(!loggedUserProject)
        throw new Error("User is not logged IN to add other users");

    const updatedProject = await Project.findOneAndUpdate({
        _id:ProjectID
    },{
        $addToSet:{
            users:{
                $each:users
            }
        }
    },
    {
        new:true
    }
);

return updatedProject;

}

const GetProjectById = async ({ProjectID}) =>{
    if(!ProjectID)
    {
        throw new Error("Project ID is required");
    }

    if(!mongoose.Types.ObjectId.isValid(ProjectID))
    {
        throw new Error("Invalid Project ID");
    }

    const ProjectById = await Project.find({
        _id:ProjectID
    }).populate('users');

    return ProjectById;
}

const updateFileTree = async ({ProjectID,fileTree})=>{

    if(!ProjectID)
    {
        throw new Error("Project ID is required");
    }

    if(!fileTree)
    {
        throw new Error("File tree is required");
    }

    const project = await Project.findOneAndUpdate({
        _id:ProjectID,
    },
        {
            fileTree
        },
        {
            new:true
        }
    );

    return project;
}

export {CreateProject,GetAllProject,AddUserToProject,GetProjectById,updateFileTree};