import generateResult from "../Services/AIService.js";

const GetResultController = async (req,res) =>{
    try{
        const {prompt} = req.query;

        const result = await generateResult(prompt);
        return res.status(200).send(result);
    }
    catch(error)
    {
        return res.status(400).send(error);
    }
};

export default GetResultController;