import { isObjectIdOrHexString } from "mongoose";
import { getReceiverSocketId } from "../config/socket.js";
import TryCatch from "../config/TryCatch.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { Chat } from "../models/Chat.js";
import { Messages } from "../models/Messages.js";
import axios from "axios";
import { io } from "../config/socket.js";


export const createNewChat = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { otherUserId } = req.body;
    if (!otherUserId) {
        return res.status(400).json({ message: "Other user ID is required" });
    }

    const exsistingChat = await Chat.findOne({
        users: { $all: [userId, otherUserId], $size: 2 }
    })

    if (exsistingChat) {
        return res.json({
            message: "Chat already exists",
            chatId: exsistingChat._id
        })
    }

    const newChat = await Chat.create({
        users: [userId, otherUserId],
    })

    return res.status(201).json({
        message: "Chat created successfully",
        chatId: newChat._id
    });
})

export const getAllChats = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
    }

    const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });//latest chats at top

    const chatWithUserData = await Promise.all(
        chats.map(async (chat) => {
            const otherUserId = chat.users.find(id => id !== userId);
            const unseenCount = await Messages.countDocuments({
                chatId: chat._id,
                seen: false,
                sender: { $ne: userId }
            })
            try {
                const { data } = await axios.get(
                    `${process.env.USER_SERVICE_URL}/api/v1/user/${otherUserId}`,
                    {
                        headers: {
                            Authorization: req.headers.authorization,
                        },
                    }
                );

                return {
                    user: data,
                    chat: {
                        ...chat.toObject(),
                        latestMessage: chat.latestMessage || null,
                        unseenCount
                    }
                }

            } catch (error) {
                console.error("Error fetching user data:", error);
                return {
                    user: {
                        _id: otherUserId,
                        name: "Unknown User",

                    },
                    chat: {
                        ...chat.toObject(),
                        latestMessage: chat.latestMessage || null,
                        unseenCount
                    }
                }
            }
        })


    );
    return res.status(200).json({
        message: "Chats fetched successfully",
        chats: chatWithUserData
    });

});


export const sendMessage=TryCatch(async(req:AuthenticatedRequest,res)=>{
    const senderId = req.user?._id;
    const {chatId,text}=req.body;
    const imageFile=req.file;
    if(!senderId){
        return res.status(400).json({ message: "Sender ID not found" });
    }
    if(!chatId){
        return res.status(400).json({ message: "Chat ID is required" });
    }
    if(!text && !imageFile){
        return res.status(400).json({ message: "Message text or image is required" });
    }

    const chat = await Chat.findById(chatId);
    if(!chat){
        return res.status(404).json({ message: "Chat not found" });
    }
    const isUserInChat = chat.users.includes(senderId);

    if(!isUserInChat){
        return res.status(403).json({ message: "You are not a participant in this chat" });
    }
    const otherUserId = chat.users.find(id => id !== senderId);

    if(!otherUserId){
        return res.status(400).json({ message: "Other user ID not found in chat" });
    }

    //socket setup

    const receiverSocketId=getReceiverSocketId(otherUserId.toString());
    let isReceiverInChatRoom = false;

    if(receiverSocketId){
        const receiverSocket=io.sockets.sockets.get(receiverSocketId)
        if(receiverSocket && receiverSocket.rooms.has(chatId)){
            isReceiverInChatRoom=true;
        }
    }

    let messageData:any={
        chatId:chatId,
        sender:senderId,
        seen:isReceiverInChatRoom,
        seenAt:isReceiverInChatRoom?new Date():undefined,

    }

    if(imageFile){
        messageData.image={
            url: imageFile.path,
            publicId: imageFile.filename
        }
        messageData.messageType = "image";
        messageData.text=text || "";
    }else{
        messageData.text = text;
        messageData.messageType = "text";
    }

    const message = new Messages(messageData);
    const savedMessage = await message.save();
    const latestMessage = imageFile?"📷 Image":text;

    await Chat.findByIdAndUpdate(chatId,{
        latestMessage:{
            text:latestMessage,
            sender:senderId,
        },
        updatedAt: new Date()
    },{ new: true})

    //emit message to socket
    io.to(chatId).emit("newMessage",savedMessage)

    if(receiverSocketId){
        io.to(receiverSocketId).emit("newMessage",savedMessage)
    }

    const senderSocketId=getReceiverSocketId(senderId.toString());

    if(senderSocketId){
        io.to(senderSocketId).emit("newMessage",savedMessage)
    }

    if(isReceiverInChatRoom && senderSocketId){
        io.to(senderSocketId).emit("messagesSeen",{
            chatId:chatId,
            seenBy:otherUserId,
            messageIds:[savedMessage._id]
        })
    }

    res.status(201).json({
        message: savedMessage,
        sender:senderId
    });
});


export const getMessagesByChat=TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const {chatId}=req.params;
    if(!chatId){
        return res.status(400).json({ message: "Chat ID is required" });
    }

    if(!userId){
        return res.status(401).json({ message: "Unauthorized" });
    }

    const chat = await Chat.findById(chatId);
    if(!chat){
        return res.status(404).json({ message: "Chat not found" });
    }

     const isUserInChat = chat.users.includes(userId);

    if(!isUserInChat){
        return res.status(403).json({ message: "You are not a participant in this chat" });
    }

    const messagesToMarkAsSeen = await Messages.find({
        chatId: chatId,
        seen: false,
        sender: { $ne: userId }
    });

    await Messages.updateMany({
        chatId: chatId,
        seen: false,
        sender: { $ne: userId }
    },{
        seen: true,
        seenAt: new Date()
    })


    const messages = await Messages.find({ chatId: chatId })
        .sort({ createdAt: 1 }) ;// Sort by creation date ascending

    const otherUserId = chat.users.find(id => id !== userId);
    try {
        const { data } = await axios.get(`${process.env.USER_SERVICE_URL}/api/v1/user/${otherUserId}`,
            {
                headers: {
                    Authorization: req.headers.authorization,
                },
            }
        );
        if(!otherUserId){
            return res.status(404).json({ message: "No other user id" });
        }

        //socket work

         if(messagesToMarkAsSeen.length>0){
            const otherUserSocketId=getReceiverSocketId(otherUserId.toString());
            if(otherUserSocketId){
                io.to(otherUserSocketId).emit("messagesSeen",{
                    chatId:chatId,
                    seenBy:userId,
                    messageIds:messagesToMarkAsSeen.map((msg)=>msg._id)
                })
            }
         }


        res.status(200).json({
            messages,
            user:data
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.json({
            messages,
            user: {
                _id: otherUserId,
                name: "Unknown User",
            }
        })
        
    }
});