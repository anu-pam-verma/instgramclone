import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import getDataUri from '../utils/datauri.js';
import cloudinary from '../utils/cloudinary.js';
import { Post } from '../models/post.model.js';
export const register = async (req,res)=>{
    try {
        // console.log(req.body);
         const {userName,email,password} = req.body;
         if(!userName || !email || !password)
         {
            return res.status(401).json({
                message:"Somethings is misssing please check",
                success:false
            })
         }

         const user = await User.findOne({email});
         if(user)
         {
            return res.status(401).json({message:"email already registerd",success:false});
         }
         const existusername = await User.findOne({userName});
         if(existusername)
         {
           return res.status(400).json({message:"User Name already exits",status:400})
        }
        
        
         
         const hashedPassword = await bcrypt.hash(password,10);
         await User.create({
            userName,
            email,
            password:hashedPassword
         })
          return res.status(201).json({message:"Account created successfully",success:true});


    } catch (error) {
        console.log("Register error:"+error);
    }
}

export const login = async (req,res)=>{
    try {
        const {email,password} = req.body;
          if(!email || !password)
         {
            return res.status(401).json({
                message:"Somethings is misssing please check",
                success:false
            })
         }
         let user = await User.findOne({email});
         if(!user){
             return res.status(401).json({
                message:"Incorrect email and passsword1",
                success:false
            })
         }
           
         const isPasswordMatch = await bcrypt.compare(password,user.password);
         if(!isPasswordMatch)
         {
             return res.status(401).json({
                message:"Incorrect email and passsword2",
                success:false
            })
         }
       const token = await jwt.sign({userId:user._id},process.env.SECRET_KEY,{expiresIn:'1d'});
               
        const populatePosts = await Promise.all(
            user.posts.map(async(postId)=>{
                const post = await Post.findById(postId);
                if(post.author.equals(user._id)) return post;
                return null;
            })
        ) 

         user = {
            _id:user._id,
            userName:user.userName,
            email:user.email,
            profile:user.profile,
            bio:user.bio,
            followers:user.followers,
            following:user.following, 
            posts:populatePosts,
            bookmark:user.bookmark

         }

       return res.cookie('token',token,{httpOnly:true,sameSite:'strict',maxAge: 1*24*60*60*1000}).json({
        message:`Welcome back ${user.userName}`,
        success:true,
        user
       })
       

    } catch (error) {
        console.log("login"+error);
    }
}

export const logout = async(req,res)=>{
try {
    return res.cookie("token","",{maxAge:0}).json({
        message:"Logout",
        success:true
    });
} catch (error) {
    console.log("Error logout:"+error)
}
}

export const getprofile = async(req,res)=>{
  try {
       const userId = req.params.id;
      let user = await User.findById(userId).select("-password");
      if(user)
      {
        return res.status(200).json({
            message:"get profile successfully",
            success:true,
            user
        })
      } 
  } catch (error) {
     console.log("get profile error:"+error);    
  }
}

export const editprofile = async(req,res)=>{
     try {
      const userId = req.id;
      console.log(userId);
      console.log(req.body);
      const {bio,gender} = req.body;
      const profile = req.file;
      let cloudResponse; 
      if(profile)
      {
        const fileUri = getDataUri(profile);
        cloudResponse = await cloudinary.uploader.upload(fileUri);
      }
      const user = await User.findById(userId).select("-password");
      if(!user)
      {
        return res.status(401).json({message:"user not found",status:false});
      }
      if(bio) user.bio = bio;
      if(gender) user.gender = gender;
      if(profile) user.profile = cloudResponse.secure_url;
      await user.save();
      return res.status(200).json({message:"Profile update successfully",status:true,user});


  } catch (error) {
     console.log("get profile error:"+error);    
  }
}


export const getSuggestedUser = async(req,res)=>{
    try {
        const suggestedUser = await User.find({_id:{$ne:req.id}}).select("-password");
        if(!suggestedUser)
        {
            return res.status(401).json({message:"do not any user",status:false});
        }
         return res.status(200).json({users:suggestedUser,status:true});

    } catch (error) {
        console.log("get suggested user error:"+error)
    }
}


export const folllowOrUnfollow = async(req,res)=>{
    try {
       const followFrom = req.id;
       const followTo = req.params.id;
       if(followFrom === followTo)
       {
        return res.status(401).json({message:'both are same'})
       }
       const user = await User.findById(followFrom);
       const target =await User.findById(followTo);
        if(!user || !target)
        {
          return res.status(401).json({message:'user not found',status:false});
        }
        const isFollowing = user.following.includes(followTo);
        if(isFollowing)
        {
            //unfollow
            await Promise.all([
                User.updateOne({_id:followFrom},{$pull:{following:followTo}}),
                User.updateOne({_id:followTo},{$pull:{followers:followFrom}})
            ])
            return res.status(200).json({message:"unfollow successfuly",status:200})
        }
        else{
           await Promise.all([
                User.updateOne({_id:followFrom},{$push:{following:followTo}}),
                User.updateOne({_id:followTo},{$push:{followers:followFrom}})
            ])
          return res.status(200).json({message:"follow successfuly",status:200})

        }

    } catch (error) {
        console.log("folllowOrUnfollow:"+error)
    }
}