import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import User from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";

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
    const post = await Post.findById(postId);
    if(!post) return res.status(404).json({message:"Post not found",status:false}); 
    
    // like post logic
    await post.updateOne({$addToSet:{likes:likeFrom}});
    await post.save();
    return res.status(200).json({message:"Post liked successfully",status:true});   
         

} catch (error) {
    console.log(error);
}
}

export const disLikePost = async (req,res) => {
try {
    const likeFrom = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if(!post) return res.status(404).json({message:"Post not found",status:false}); 
    
    // like post logic
    await post.updateOne({$pull:{likes:likeFrom}});
    await post.save();
    return res.status(200).json({message:"Post Unlike successfully",status:true});   
         

} catch (error) {
    console.log(error);
}
}

export const addcomment = async (req,res) => {
try {
    const likeFrom = req.id;
    const postId = req.params.id;
    const {text} = req.body;
    const post = await Post.findById(postId);
    if(!text) return res.status(404).json({message:"comment text not found",status:false}); 
    const comment = await Comment.create({
              text,
              author:likeFrom,
               post:postId
    }).populate({
        paht:'author',
        select:'userName,profile'
    });
     post.comments.push(comment._id);
     post.save();

    return res.status(200).json({message:"Add comment successfully",comment,status:true});   
        
} catch (error) {
    console.log(error);
}
}

export const getCommentOfPost= async (req,res)=>{
    try {
        const postId = req.params.id;
        const comments = await Comment.find({post:postId}).populate('author','userName,profile');
        if(!comments) return res.status(404).json({message:"comment not found",status:false}); 
        return res.status(200).json({
            message:'Get comments successfully',
            status:true,
            comments:comments
        })
    } catch (error) {
        console.log(error);
    }
}

export const deletePost = async(req,res)=>{
  try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:"post not found",status:false}); 
        if(post.author.toString() !== authorId) return res.status(400).json({message:'Unauthroize user',status:false});
        await Post.findByIdAndDelete(postId);
       
        //remove post id form user 
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id=>id.toString() !== postId);
        await user.save();

        // remove comments
        let comment  = await Comment.deleteMany({post:postId});
        return res.status(200).json({
            message:"post delete",
            status:true
        })

  } catch (error) {
     console.log(error);
  }
}


export const bookMarkPost = async(req,res)=>{
  try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:"post not found",status:false}); 
         const user =  await User.findById(authorId);
        if(user.bookmarks.includes(post._id))
        {
            await user.updateOne({$pull:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:"unsaved",message:"post remove form markpost",status:true}); 
        }
        else {
            await user.updateOne({$addToSet:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:"saved",message:"post add form markpost",status:true}); 
        }


  } catch (error) {
     console.log(error);
  }
}

