/**
 * DockerManager
 * Responsible for interacting with the Docker daemon.
 * Handles container creation, execution, and cleanup using dockerode.
 */

import Docker from 'dockerode';

// Initialize Dockerode (connects to local docker socket by default)
const docker = new Docker();

/**
 * Ensures a Docker image is pulled locally.
 * @param {string} image - The image to pull.
 * @returns {Promise<void>}
 */
const EnsureImageExists = async (image) => {
    try {
        const images = await docker.listImages();
        const exists = images.some(img => img.RepoTags && img.RepoTags.includes(image));
        
        if (!exists) {
            console.log(`[DockerManager] Image ${image} not found locally. Pulling...`);
            await new Promise((resolve, reject) => {
                docker.pull(image, (err, stream) => {
                    if (err) return reject(err);
                    docker.modem.followProgress(stream, onFinished);
                    
                    function onFinished(err, output) {
                        if (err) return reject(err);
                        resolve(output);
                    }
                });
            });
            console.log(`[DockerManager] Successfully pulled image ${image}`);
        }
    } catch (error) {
        throw new Error(`Failed to pull image ${image}: ${error.message}`);
    }
};

/**
 * Creates a new Docker container for execution.
 * @param {Object} params - The container parameters.
 * @param {string} params.image - The Docker image to use.
 * @param {string} params.workspacePath - The absolute path to the local code workspace.
 * @returns {Promise<string>} The ID of the created container.
 */
const CreateContainer = async ({ image, workspacePath }) => {
    try {
        await EnsureImageExists(image);
        console.log(`[DockerManager] Creating container using image: ${image}`);
        
        const container = await docker.createContainer({
            Image: image,
            Tty: true, // Keep the container alive and allocate a pseudo-TTY
            Cmd: ['/bin/sh', '-c', 'tail -f /dev/null'], // Keep-alive command
            WorkingDir: '/workspace', // Set working directory
            HostConfig: {
                Binds: [`${workspacePath}:/workspace`] // Mount the workspace
            }
        });

        return container.id;
    } catch (error) {
        throw new Error(`Failed to create Docker container: ${error.message}`);
    }
};

/**
 * Starts a created Docker container.
 * @param {string} containerId - The ID of the container to start.
 * @returns {Promise<void>}
 */
const StartContainer = async (containerId) => {
    try {
        console.log(`[DockerManager] Starting container: ${containerId}`);
        const container = docker.getContainer(containerId);
        await container.start();
    } catch (error) {
        throw new Error(`Failed to start Docker container: ${error.message}`);
    }
};

/**
 * Executes a command inside a running container.
 * @param {string} containerId - The ID of the container.
 * @param {Array<string>} command - The command array to execute.
 * @returns {Promise<Object>} Execution result stream or status.
 */
const ExecuteCommand = async (containerId, command) => {
    try {
        console.log(`[DockerManager] Executing command in ${containerId}: ${command.join(' ')}`);
        const container = docker.getContainer(containerId);

        const exec = await container.exec({
            Cmd: command,
            AttachStdout: true,
            AttachStderr: true
        });

        const stream = await exec.start();

        return new Promise((resolve, reject) => {
            let output = '';
            let errorOutput = '';

            // Dockerode streams multiplex stdout and stderr
            docker.modem.demuxStream(stream, {
                write: (data) => { output += data.toString(); }
            }, {
                write: (data) => { errorOutput += data.toString(); }
            });

            stream.on('end', async () => {
                const inspectData = await exec.inspect();
                resolve({
                    success: inspectData.ExitCode === 0,
                    exitCode: inspectData.ExitCode,
                    output: output.trim(),
                    error: errorOutput.trim()
                });
            });

            stream.on('error', (err) => {
                reject(err);
            });
        });
    } catch (error) {
        throw new Error(`Failed to execute command in container: ${error.message}`);
    }
};

/**
 * Executes a command interactively inside a running container.
 * @param {string} containerId - The ID of the container.
 * @param {Array<string>} command - The command array to execute.
 * @returns {Promise<Object>} An object containing the exec instance and the duplex stream.
 */
const ExecuteInteractiveCommand = async (containerId, command) => {
    try {
        console.log(`[DockerManager] Executing interactive command in ${containerId}: ${command.join(' ')}`);
        const container = docker.getContainer(containerId);

        const exec = await container.exec({
            Cmd: command,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true // Enables proper terminal behavior (e.g., Python REPL, bash)
        });

        // Start exec and hijack the stream for full duplex communication
        const stream = await exec.start({ hijack: true, stdin: true });

        return { exec, stream };
    } catch (error) {
        throw new Error(`Failed to start interactive execution: ${error.message}`);
    }
};

/**
 * Stops and removes a Docker container.
 * @param {string} containerId - The ID of the container to clean up.
 * @returns {Promise<void>}
 */
const CleanupContainer = async (containerId) => {
    try {
        console.log(`[DockerManager] Cleaning up container: ${containerId}`);
        const container = docker.getContainer(containerId);
        
        // Inspect container to check if it's running before stopping
        const data = await container.inspect();
        if (data.State.Running) {
            await container.stop();
        }
        // Remove the container forcibly to ensure complete cleanup
        await container.remove({ force: true });
    } catch (error) {
        // Safe fail: Just log the error if container is already gone
        console.error(`[DockerManager] Error cleaning up container ${containerId}:`, error.message);
    }
};

export { CreateContainer, StartContainer, ExecuteCommand, ExecuteInteractiveCommand, CleanupContainer };
