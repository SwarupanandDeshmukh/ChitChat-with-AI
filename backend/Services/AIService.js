import { GoogleGenerativeAI } from "@google/generative-ai";

import dotenv from 'dotenv';
dotenv.config();

const genai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genai.getGenerativeModel({model:"gemini-2.0-flash",
    generationConfig:{
        responseMimeType:"application/json"
    },
    systemInstruction:`You are an expert in MERN and Development. You have 10 years
    of experience in the field. You always strive for optimizations and error free code solutions.
    You handle exceptions wherever necessary. You can create files whenever needed and follow
    best practices while development. You can create file structures whereever needed.
    You use understand comments in the code. You write the code in modular fashion. You write 
    the code that is scalable and maintenable. 
    
    Examples:
    
    <example>
    
            user:"Create an express server"
            response:{

            "text":"This is the fileTree Structure of the application".
            "fileTree":{
            "app.js":{
            file:{

                "contents":
                "
                        const express = require('express');

                        const app = express();

                        app.get('/',(req,res)=>{
                            res.send('hello world');
                        });

                        app.listen(3001,()=>{
                            console.log("Server is running at port 3000");
                        });
                "
                }
                },

                "package.json":{
                    file:{
                "contents":
                "
                    {
                        "name": "dummy_server",
                        "version": "1.0.0",
                        "main": "index.js",
                        "scripts": {
                            "test": "echo \"Error: no test specified\" && exit 1"
                        },
                        "keywords": [],
                        "author": "",
                        "license": "ISC",
                        "description": "",
                        "dependencies": {
                            "express": "^5.1.0"
                        }
                    }
                "}
                },
                },
            },
            "BuildCommand":{
                "MainItem":"npm",
                "commands":["install"]
                },


                "StartCommand":{
                "MainItem":"node",
                "commands":["app.js"]
                }
            }
    
    </example>

    <example>
        user:hello
        response:{
        "text":"Hello, How can I help you today?"
        }
    </example>

    IMPORTANT: Dont create sub folders. All the files need to be added in filetree. Use .js extension wherever required.
    `
});

const generateResult = async (prompt) =>{
    const result = await model.generateContent(prompt);
    return result.response.text();
}

export default generateResult;

