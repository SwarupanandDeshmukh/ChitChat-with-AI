import User from "../models/UserModel.js";
import { validationResult } from "express-validator";
import {AddUserToProject, CreateProject,GetAllProject,GetProjectById,updateFileTree} from "../Services/ProjectService.js";

const CreateProjectController = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({error:errors.array()});
    }


    try{
        const {Project_name} = req.body;

        const LoggedUser = await User.findOne({email:req.user.email})
        const userID = LoggedUser._id;

        const project = await CreateProject({Project_name,userID});

        return res.status(200).json({project});
    }
    catch(error)
    {
        res.status(400).send(error.message);
    }

};


const GetAllProjectController = async (req,res) =>{
    try{
        const loggedinUser = await User.findOne({email:req.user.email});
        const AllProject = await GetAllProject({userID:loggedinUser._id})
        
        return res.status(200).json({AllProject});
    }
    catch(error)
    {
        return res.status(400).json({error:error.message});
    }
}


const AddUserToProjectController = async (req,res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({error:errors.array()});
    }

    try{
        const {ProjectID,users} = req.body;
        const loggedinUser = await User.findOne({email:req.user.email});
        const updatedProject = await AddUserToProject({
            ProjectID,
            users,
            userID:loggedinUser._id
        });

        return res.status(200).json({updatedProject})

    }
    catch(error)
    {
        return res.status(400).json({error:error.message})
    }
}

const GetProjectByIdController = async (req,res) => {
        try{
            const {ProjectID} = req.body;

            const projectById = await GetProjectById({ProjectID})

            return res.status(200).json({projectById})
        }
        catch(error)
        {
            return res.status(400).json({error:error.message});
        }
}

const updateFileTreeController = async (req,res) =>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({error:errors.array()})
    }

    try{

        const {ProjectID,fileTree} = req.body;

        const project = await updateFileTree({
            ProjectID,
            fileTree
        });

        return res.status(200).json({project});

    }
    catch(err)
    {
        return res.status(400).send(err);
    }
}

export {CreateProjectController,GetAllProjectController,AddUserToProjectController,GetProjectByIdController,updateFileTreeController};