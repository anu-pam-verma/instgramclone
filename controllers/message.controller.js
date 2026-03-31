import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

export const sendMessage = async(req,res)=>{
    try {
        const senderId =  req.id;
        const reciverId =  req.params.id;
        const {message} = req.body;

        let conversation = await Conversation.findOne({
            participants:{$all:[senderId,reciverId]}
        });
        //stablish the coversation not started yet
        if(!conversation)
        {
            conversation = await Conversation.create({
                participants:[senderId,reciverId]
            })
        }
        const newMessage = await Message.create({
            senderId,
            reciverId,
            message
        })
        if(newMessage) conversation.messages.push(newMessage._id);
        await Promise.all[conversation.save(),newMessage.save()];

        //implement socket.io for real time data transfer 
    } catch (error) {
        console.log(error);
    }
}


export const getMessage = async(req,res)=>{
    try {
        const senderId =  req.id;
        const reciverId =  req.params.id;
    
        let conversation = await Conversation.find({
            participants:{$all:[senderId,reciverId]}
        });
         if(!conversation) return res.status(400).json({message:[],success:true});
         return res.status(200).json({success:true,message:conversation?.message});

        
    } catch (error) {
        console.log(error);
    }
} 