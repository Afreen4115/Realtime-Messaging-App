import mongoose from "mongoose";

const connectDb=async()=>{
    const url= process.env.MONGO_URL;
    if(!url) throw new Error("MongoDB URL is not defined");

    try {
        await mongoose.connect(url,{
            dbName:"ChatAppMicroserviceApp"
        })
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error); 
        process.exit(1); // Exit the process with failure
    }
}


export default connectDb;