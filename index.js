import express, { urlencoded } from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config({});

import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/messaage.route.js";


const app = express();
const PORT = process.env.PORT || 3000;

app.get("/",(req,res)=>{
    return res.status(200).json({ 
        message:"i`am coming form backend",
        success:true
    })
}) 
//middleware call
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended:true}));
const corsOption={
    origin:'http://localhost:5173',
    credentials:true
} 
app.use(cors(corsOption));

app.use("/api/v1/user",userRoute);
app.use("/api/v1/post",postRoute);
app.use("/api/v1/message",messageRoute);

app.listen(PORT,()=>{
    connectDB();
    console.log(`Server listen at port ${PORT}`);
}) 