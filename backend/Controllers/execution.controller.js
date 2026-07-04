import { validationResult } from "express-validator";
import { ExecuteCode, TerminateExecution } from "../Services/Execution/ExecutionService.js";

const RunExecutionController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }

    try {
        const { roomId, userId, language, sourceCode } = req.body;
        
        const result = await ExecuteCode({ roomId, userId, language, sourceCode });
        
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const TerminateExecutionController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }

    try {
        const { sessionId } = req.body;
        
        await TerminateExecution(sessionId);
        
        return res.status(200).json({ message: "Execution terminated successfully." });
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

export { RunExecutionController, TerminateExecutionController };
