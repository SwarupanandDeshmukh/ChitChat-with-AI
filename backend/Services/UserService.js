import User from '../models/UserModel.js'

const createUser = async ({email , password}) => {

    if(!email || !password)
        throw new Error('User email and password required');

    const hashedPassword = await User.hashPassword(password);

    const user = await User.create({
        email : email,
        password : hashedPassword,
    })

    return user;
}

const GetAllUsers = async({userID}) =>{
    if(!userID)
        throw new error("User ID is required");

    const allUser = await User.find({
        _id :{$ne:userID}
    });

    return allUser;
}

export {createUser,GetAllUsers};