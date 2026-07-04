/**
 * LanguageManager
 * Responsible for managing programming language configurations.
 * Provides metadata needed by the ExecutionService.
 */

const LANGUAGE_CONFIG = {
    javascript: {
        extension: 'js',
        image: 'node:18-alpine',
        runCommand: ['node', 'main.js']
    },
    python: {
        extension: 'py',
        image: 'python:3.9-alpine',
        runCommand: ['python', 'main.py']
    },
    cpp: {
        extension: 'cpp',
        image: 'gcc:latest',
        compileCommand: ['g++', 'main.cpp', '-o', 'main'],
        runCommand: ['./main']
    }
};

/**
 * Gets the configuration for a given programming language.
 * @param {string} language - The programming language name.
 * @returns {Object} Language configuration object.
 */
const GetLanguageConfig = (language) => {
    const config = LANGUAGE_CONFIG[language.toLowerCase()];
    if (!config) {
        throw new Error(`Language '${language}' is not supported.`);
    }
    return config;
};

/**
 * Checks if a language is supported.
 * @param {string} language - The programming language name.
 * @returns {boolean} True if supported, false otherwise.
 */
const IsLanguageSupported = (language) => {
    return !!LANGUAGE_CONFIG[language.toLowerCase()];
};

export { GetLanguageConfig, IsLanguageSupported, LANGUAGE_CONFIG };
