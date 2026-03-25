import mongoose from "mongoose";

const  connectDB = async ()=>{
    try{
        // console.log("sadf");
        // console.log();
        const url = process.env.MONGOOSE_URL?.trim();
        await mongoose.connect(url);
       console.log("mongoose db connected");
    }catch(error) 
    {
     console.log("Error:"+error);
    }  
}
export default connectDB; 