"use client";
import React, { createContext ,ReactNode, use, useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import toast, {Toaster} from 'react-hot-toast'

export const user_service="http://13.203.203.194:5000"
export const chat_service="http://13.203.203.194:5002"

export interface User{
    _id:string,
    name:string,
    email:string
}

export interface Chat{
    _id:string,
    users:string[],
    latestMessage:{
        text:string,
        sender:string
    },      
    createdAt:Date,
    updatedAt:Date,
    unseenCount?:number
}

export interface Chats{
    _id:string,
    user:User,
    chat:Chat,
}

interface AppContextType{
    user:User | null;
    loading:boolean,
    isAuth:boolean,
    setUser:React.Dispatch<React.SetStateAction<User | null>>;
    setIsAuth:React.Dispatch<React.SetStateAction<boolean>>;
    logoutUser: () => Promise<void>;
    fetchUser: () => Promise<void>;
    fetchChats: () => Promise<void>;
    chats: Chats[] | null;
    fetchUsers: () => Promise<void>;
    users: User[] | null;
    setChats: React.Dispatch<React.SetStateAction<Chats[] | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [isAuth, setIsAuth] = React.useState<boolean>(false);

    async function fetchUser(){
        try {
            const token=Cookies.get("token");
            const {data}= await axios.get(`${user_service}/api/v1/me`,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            setUser(data.user);
            setIsAuth(true);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    async function logoutUser(){
        Cookies.remove("token");
        setUser(null);
        setIsAuth(false);
        toast.success("Logged out successfully");
    }

    const [chats, setChats] = React.useState<Chats[] | null>(null);

    async function fetchChats() {
        const token = Cookies.get("token");
        try {
            const {data} = await axios.get(`${chat_service}/api/v1/chat/all`, {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            setChats(data.chats);
        } catch (error) {
            console.error("Error fetching chats:", error);
            toast.error("Failed to fetch chats");
        }
    }
    const [users,setUsers]=useState<User[] | null>(null);

    async function fetchUsers() {
        const token = Cookies.get("token");
        try {
            const {data} = await axios.get(`${user_service}/api/v1/user/all`, {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            setUsers(data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users");
        }
    }   
    //called for every page referesh
   useEffect(() => {
    const initializeApp = async () => {
    await fetchUser(); // ensures user is loaded and token is valid

    if (Cookies.get("token")) {
      await fetchChats();
      await fetchUsers();
    }
  };

  initializeApp();
}, []);


    return (
        <AppContext.Provider value={{ user, loading, isAuth, setUser, setIsAuth,fetchChats, fetchUser, logoutUser, chats, setChats, fetchUsers, users }}>
            {children}
            <Toaster/>
        </AppContext.Provider>
    );
};


export const useAppContext = (): AppContextType => {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};