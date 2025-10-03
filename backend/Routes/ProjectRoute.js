import { Router } from "express";
import {body} from "express-validator"
import {CreateProjectController,GetAllProjectController,AddUserToProjectController,GetProjectByIdController,updateFileTreeController} from "../Controllers/ProjectController.js";
import authUser from "../Middleware/AuthMiddleware.js";


const ProjectRouter = Router();

ProjectRouter.post('/create',
    authUser,
    body('Project_name').isString().withMessage("Project name is required"),
    CreateProjectController
);

ProjectRouter.get('/allProject',
    authUser,
    GetAllProjectController
);

ProjectRouter.put('/addUser',
    authUser,
    body('ProjectID').isString().withMessage("Project ID should be valid"),
    body('users').isArray({min:1}).withMessage("Users should be array of strings"),
    AddUserToProjectController
);

ProjectRouter.post('/ProjectById',
    authUser,
    GetProjectByIdController
);

ProjectRouter.put('/updateFTree',
    authUser,
    body('ProjectID').isString().withMessage("Project ID should be valid"),
    body('fileTree').isObject().withMessage("File should be valid"),
    updateFileTreeController
)

export default ProjectRouter;