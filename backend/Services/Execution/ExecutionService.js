/**
 * ExecutionService
 * The main coordinator for the Code Execution module.
 * Orchestrates the flow between LanguageManager, DockerManager, and TerminalSessionManager.
 */

import { GetLanguageConfig } from './LanguageManager.js';
import { CreateContainer, StartContainer, ExecuteCommand, ExecuteInteractiveCommand, CleanupContainer } from './DockerManager.js';
import { CreateSession, GetSession, UpdateSession, EndSession } from './TerminalSessionManager.js';
import fs from 'fs/promises';
import path from 'path';

// Placeholder path for temporary execution workspaces
const WORKSPACE_BASE = '/tmp/code_execution';

/**
 * Creates a temporary workspace for code execution.
 * @param {string} sessionId - Unique session ID.
 * @param {string} sourceCode - The code to execute.
 * @param {string} extension - The file extension for the language.
 * @returns {Promise<string>} The path to the created workspace.
 */
const PrepareWorkspace = async (sessionId, sourceCode, extension) => {
    const workspacePath = path.join(WORKSPACE_BASE, sessionId);
    
    try {
        // 1 & 2. Create directory recursively if it doesn't exist
        await fs.mkdir(workspacePath, { recursive: true });
        
        // 3 & 4. Save the editor source code as main.{extension}
        const filePath = path.join(workspacePath, `main.${extension}`);
        await fs.writeFile(filePath, sourceCode, 'utf8');
        
        console.log(`[ExecutionService] Workspace prepared at ${workspacePath}`);
        
        // 5. Return the absolute workspace path
        return workspacePath;
    } catch (error) {
        throw new Error(`Failed to prepare workspace: ${error.message}`);
    }
};

/**
 * Cleans up the temporary workspace.
 * @param {string} workspacePath - The path to the workspace.
 * @returns {Promise<void>}
 */
const CleanupWorkspace = async (workspacePath) => {
    try {
        // Delete the complete workspace recursively
        await fs.rm(workspacePath, { recursive: true, force: true });
        console.log(`[ExecutionService] Workspace cleaned up at ${workspacePath}`);
    } catch (error) {
        console.error(`[ExecutionService] Failed to cleanup workspace at ${workspacePath}:`, error.message);
    }
};

/**
 * Handles the full code execution request lifecycle.
 * @param {Object} params
 * @param {string} params.userId - ID of the user requesting execution.
 * @param {string} params.roomId - ID of the room (for collaborative sessions).
 * @param {string} params.language - The chosen programming language.
 * @param {string} params.sourceCode - The raw source code from the editor.
 * @returns {Promise<Object>} The execution result or status.
 */
const ExecuteCode = async ({ userId, roomId, language, sourceCode }) => {
    const sessionId = `${roomId}_${userId}`;
    let workspacePath = null;
    let containerId = null;

    try {
        console.log(`[ExecutionService] Starting execution for user ${userId} in room ${roomId}`);

        // 0. Force cleanup previous dangling session if it exists to prevent overlap
        if (GetSession(sessionId)) {
            console.log(`[ExecutionService] Found dangling session ${sessionId}, terminating immediately...`);
            await TerminateExecution(sessionId).catch(e => console.error(e));
        }

        // 1. Validate language and get config
        const langConfig = GetLanguageConfig(language);

        // 2. Prepare workspace and write source code
        workspacePath = await PrepareWorkspace(sessionId, sourceCode, langConfig.extension);

        // 3. Create and start Docker container
        containerId = await CreateContainer({
            image: langConfig.image,
            workspacePath: workspacePath
        });
        
        await StartContainer(containerId);

        // 4. Create Terminal Session for user interaction (tracked for cleanup)
        CreateSession({ sessionId, userId, roomId, containerId });

        // Lazy import io to avoid circular dependency
        const { io } = await import('../../server.js');
        const userRoom = userId.toString();

        io.to(userRoom).emit('execution:start', { sessionId });

        // 5. Optional: Compile step
        if (langConfig.compileCommand) {
            console.log(`[ExecutionService] Compiling ${language} code...`);
            const compileResult = await ExecuteCommand(containerId, langConfig.compileCommand);
            
            if (!compileResult.success) {
                console.log(`[ExecutionService] Compilation failed for session ${sessionId}`);
                
                io.to(userRoom).emit('execution:error', { 
                    sessionId, 
                    message: "Compilation failed.", 
                    error: compileResult.error || compileResult.output 
                });

                // Cleanup resources on compilation failure
                await CleanupContainer(containerId);
                EndSession(sessionId);
                await CleanupWorkspace(workspacePath);
                
                return {
                    status: "error",
                    errorType: "compilation",
                    message: "Compilation failed.",
                    error: compileResult.error || compileResult.output
                };
            }
            
            io.to(userRoom).emit('execution:compiled', { sessionId });
        }

        // 6. Start the program interactively
        console.log(`[ExecutionService] Running program interactively...`);
        const { exec, stream } = await ExecuteInteractiveCommand(containerId, langConfig.runCommand);

        UpdateSession(sessionId, { exec, stream, status: 'running' });

        // Pipe Docker output to Socket.IO
        stream.on('data', (chunk) => {
            // chunk is a Buffer containing stdout/stderr due to Tty: true
            io.to(userRoom).emit('terminal:output', { 
                sessionId, 
                output: chunk.toString('utf8') 
            });
        });

        stream.on('end', async () => {
            console.log(`[ExecutionService] Stream ended for session ${sessionId}`);
            io.to(userRoom).emit('execution:finished', { sessionId });
            
            // End session instantly to free the lock
            EndSession(sessionId);
            await CleanupContainer(containerId);
            await CleanupWorkspace(workspacePath);
        });

        stream.on('error', async (err) => {
            console.error(`[ExecutionService] Stream error for session ${sessionId}:`, err);
            io.to(userRoom).emit('execution:error', { sessionId, message: err.message });
            
            // End session instantly to free the lock
            EndSession(sessionId);
            await CleanupContainer(containerId);
            await CleanupWorkspace(workspacePath);
        });

        // 7. Return execution session information immediately (background stream active)
        return {
            status: "success",
            message: "Interactive execution started.",
            sessionId: sessionId
        };

    } catch (error) {
        console.error(`[ExecutionService] Execution failed:`, error.message);
        
        // Ensure cleanup happens on failure
        if (containerId) {
            await CleanupContainer(containerId);
            EndSession(sessionId);
        }
        if (workspacePath) {
            await CleanupWorkspace(workspacePath);
        }

        throw new Error(`Execution Failed: ${error.message}`);
    }
};

/**
 * Terminates an active execution session.
 * @param {string} sessionId - The session ID to terminate.
 * @returns {Promise<void>}
 */
const TerminateExecution = async (sessionId) => {
    const session = GetSession(sessionId);
    
    if (session) {
        // Free session lock immediately
        EndSession(sessionId);
        
        await CleanupContainer(session.containerId);
        
        // Also cleanup workspace based on sessionId
        const workspacePath = path.join(WORKSPACE_BASE, sessionId);
        await CleanupWorkspace(workspacePath);
        
        console.log(`[ExecutionService] Execution terminated for session: ${sessionId}`);
    } else {
        console.log(`[ExecutionService] Session ${sessionId} not found for termination.`);
    }
};

export { ExecuteCode, TerminateExecution };
