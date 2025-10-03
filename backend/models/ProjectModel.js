import mongoose from "mongoose"


const ProjectSchema = new mongoose.Schema({
    Project_name:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },

    users:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        }
    ],

    fileTree:{
        type:Object,
        default:{}
    }
});

const Project = new mongoose.model("project",ProjectSchema);

export default Project;