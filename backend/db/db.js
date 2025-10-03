import mongoose from 'mongoose';


function connectDB() {

    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log(' Connected to DB'))
        .catch(err => {
            console.error(' MongoDB connection failed:', err);
            process.exit(1);
        });
}

export default connectDB;
