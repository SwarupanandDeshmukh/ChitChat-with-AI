import geminiProvider from './GeminiProvider.js';

class AIService {
    async processPrompt(rawPrompt) {
        if (!rawPrompt || typeof rawPrompt !== 'string') {
            throw new Error('Prompt must be a valid string');
        }

        const prompt = rawPrompt.trim();

        if (prompt.length === 0) {
            throw new Error('Prompt cannot be empty');
        }

        try {
            const response = await geminiProvider.generateResponse(prompt);
            return response;
        } catch (error) {
            console.error('AI Service Error:', error);
            throw error;
        }
    }
}

export default new AIService();
