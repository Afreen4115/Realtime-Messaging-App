"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect } from "react"
import { io, Socket } from "socket.io-client"
import { useState } from "react"
import { chat_service, useAppContext } from "./AppContext"

interface SocketContextType{
    socket:Socket | null;
    onlineUsers:string[];
}

const SocketContext=createContext<SocketContextType>({
    socket:null,
    onlineUsers:[],
})

interface ProviderProps{
    children:ReactNode
}

export const SocketProvider =({children}:ProviderProps)=>{
    const [socket,setSocket]=useState<Socket | null>(null);
    const {user}= useAppContext();
    const [onlineUsers,setOnlineUsers] = useState<string[]>([]);

    console.log("online users",onlineUsers)
    useEffect(()=>{
        if(!user?._id) return;
        const newSocket = io(chat_service,{
            query:{
                userId:user._id
            }
        });

        setSocket(newSocket)

        newSocket.on("getOnlineUser",(users:string[])=>{
            setOnlineUsers(users);
        })

        return ()=>{
            newSocket.disconnect();
        }

    },[user?._id])

    return <SocketContext.Provider value={{socket,onlineUsers}}>{children}</SocketContext.Provider>
};

export const SocketData=()=>useContext(SocketContext);