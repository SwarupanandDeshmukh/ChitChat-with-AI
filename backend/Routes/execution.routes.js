import { Router } from "express";
import { body } from "express-validator";
import { RunExecutionController, TerminateExecutionController } from "../Controllers/execution.controller.js";
import authUser from "../Middleware/AuthMiddleware.js";

const ExecutionRouter = Router();

ExecutionRouter.post('/run',
    authUser,
    body('roomId').isString().withMessage("Room ID is required"),
    body('userId').isString().withMessage("User ID is required"),
    body('language').isString().withMessage("Language is required"),
    body('sourceCode').isString().withMessage("Source code is required"),
    RunExecutionController
);

ExecutionRouter.post('/terminate',
    authUser,
    body('sessionId').isString().withMessage("Session ID is required"),
    TerminateExecutionController
);

export default ExecutionRouter;
