import jwt from 'jsonwebtoken';
import client from '../Services/RedisService.js';

const authUser = async (req,res,next) =>{

      let token = null;

        // Check cookies
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // Check Authorization header
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
    if(!token)
    {
        return res.status(400).send("Unauthorized user");
    }

    const blacklisted = await client.get(token);

    if(blacklisted)
    {
        res.cookie(token,'');
        return res.status(405).json({error:"Unauthorized user"});
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.user = decoded;
    next();
}

export default authUser;