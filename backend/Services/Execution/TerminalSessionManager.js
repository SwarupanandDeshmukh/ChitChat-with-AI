/**
 * TerminalSessionManager
 * Responsible for managing interactive execution sessions.
 * Maps users/rooms to their active container terminal streams.
 */

const activeSessions = new Map();

/**
 * Creates a new terminal session.
 * @param {Object} sessionData
 */
const CreateSession = ({ sessionId, userId, roomId, containerId }) => {
    if (activeSessions.has(sessionId)) {
        throw new Error(`Session ${sessionId} already exists.`);
    }

    const session = {
        sessionId,
        userId,
        roomId,
        containerId,
        exec: null,
        stream: null,
        status: 'created',
        createdAt: new Date(),
        lastActivity: new Date()
    };

    activeSessions.set(sessionId, session);
    console.log(`[TerminalSessionManager] Session created: ${sessionId} for container: ${containerId}`);
    
    return session;
};

/**
 * Retrieves an active terminal session.
 */
const GetSession = (sessionId) => {
    return activeSessions.get(sessionId) || null;
};

/**
 * Updates an active terminal session.
 */
const UpdateSession = (sessionId, updates) => {
    const session = activeSessions.get(sessionId);
    if (session) {
        Object.assign(session, updates, { lastActivity: new Date() });
        activeSessions.set(sessionId, session);
        return session;
    }
    return null;
};

/**
 * Ends a terminal session and cleans up its stream.
 */
const EndSession = (sessionId) => {
    const session = activeSessions.get(sessionId);
    if (!session) {
        return false;
    }
    
    // Close the Docker stream safely
    if (session.stream) {
        try {
            session.stream.end();
            session.stream.destroy();
        } catch (error) {
            console.error(`[TerminalSessionManager] Error closing stream for session ${sessionId}:`, error.message);
        }
    }
    
    activeSessions.delete(sessionId);
    console.log(`[TerminalSessionManager] Session ended: ${sessionId}`);
    
    return true;
};

/**
 * Checks if a session exists.
 */
const HasSession = (sessionId) => {
    return activeSessions.has(sessionId);
};

export default { CreateSession, GetSession, UpdateSession, EndSession, HasSession };
export { CreateSession, GetSession, UpdateSession, EndSession, HasSession };
