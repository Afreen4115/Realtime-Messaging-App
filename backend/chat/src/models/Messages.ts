import mongoose,{Document, Schema} from "mongoose";

export interface IMessage extends Document {
    chatId: Schema.Types.ObjectId;
    sender:string,
    text?:string;
    image?:{
        url: string;
        publicId: string;
    };
    messageType: 'text' | 'image';
    seen: boolean;
    seenAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema=new Schema<IMessage>({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
    },
    sender:{
        type:String,
        required: true,
    },
    text:String,
    image:{
        url: String,
        publicId: String,
    },
    messageType: {
        type: String,
        enum: ['text', 'image'],
        default: 'text',
    },
    seen: {
        type: Boolean,
        default: false,
    },
    seenAt:{
        type: Date,
        default: null,
    }
    

    
},{
    timestamps: true,
});


export const Messages= mongoose.model<IMessage>('Messages', messageSchema);