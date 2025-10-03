import { Router } from "express";
import GetResultController from "../Controllers/AIController.js";
const AIRouter = Router();

AIRouter.get('/getResult',GetResultController);

export default AIRouter;