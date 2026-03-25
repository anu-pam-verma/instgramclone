import jwt from 'jsonwebtoken';

export const isAuthentication= async(req,res,next)=>{
    try{
       const token = req.cookies.token;
       if(!token)
       {
        return res.status(401).json({message:"Token not found",status:false})
       }
       const decode = jwt.verify(token,process.env.SECRET_KEY);
       if(!decode)
       {
                return res.status(401).json({message:"Token not verify found",status:false})
       }
       req.id = decode.userId;
       next();
    } catch(error){console.log("isAuthentication page:"+error)}
}