import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import User from "../models/user.model.js";
export const addNewPost =async (req,res)=>{
    try {
        const {caption} = req.body;
        const image = req.file;
        const authorId =  req.id;
        if(!image) return res.status(400).json({message:"image not found",status:false});
        const optimizedImageBuffer = await sharp(image.buffer)
        .resize({width:800,height:800,fit:'inside'})
        .toFormat('jpeg',{quality:80})
        .toBuffer();
        // buffer to dataUri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post =  await Post.create({
            caption:caption,
            image:cloudResponse.secure_url,
            author:authorId
        });

        const user = await User.findById(authorId);
        if(user){
            user.posts.push(post._id);
            await user.save();
        }
        await post.populate({path:'author', select:"-password"});
        return res.status(200).json({
            message:'Post created successfully',
            post,
            status:true
        })
        

    } catch (error) {
        console.log(error);
    }
}


export const getAllPost = async(req,res)=>{
    try {
        const posts =  await Post.find().sort({createdAt:-1})
        .populate({path:'author',select:'userName,profile'})
        .populate({
            path:'comments',
            sort:{createdAt:'-1'},
            populate:{
                path:'author',
                select:'userName,profile'
            }
        });
        return res.status(200).json({message:"Get All Posts",posts,status:true}); 
    } catch (error) {
        console.log(error)
    }
}

export const getUserPost = async(req,res)=>{
    try {
        const authorId = req.id;
        const posts =  await Post.find({author:authorId}).sort({createdAt:-1})
        .populate({path:'author',select:'userName,profile'})
        .populate({
            path:'comments',
            sort:{createdAt:'-1'},
            populate:{
                path:'author',
                select:'userName,profile'
            }
        });
        return res.status(200).json({message:"Get User All Posts",posts,status:true}); 
    } catch (error) {
        console.log(error)
    }
}

export const likePost = async (req,res) => {
try {
    const likeFrom = req.id;
    const postId = req.params.id;
   

} catch (error) {
    console.log(error);
}
}