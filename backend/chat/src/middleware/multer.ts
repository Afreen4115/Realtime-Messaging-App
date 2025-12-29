import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const cloudStorage=new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "chat-images",
        allowed_formats: ["jpg", "png","gif", "jpeg", "webp"],
        transformation: [{ width: 800, height: 600, crop: "limit" },{ quality: "auto" }],
    }as any
});


export const upload=multer({
    storage: cloudStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, //   5 MB limit
    fileFilter:(req,file,cb)=>{
        if(file.mimetype.startsWith("image/")){
            cb(null,true);
        }else{
            cb(new Error("Only image files are allowed!"));
        }
    }
});