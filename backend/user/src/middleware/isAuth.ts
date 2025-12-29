import { IUser } from "../models/User.js";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?: IUser
}

export const isAuth=async(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>=>{
try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Please login - Unauthorized' });
        return
    }

    const token=authHeader.split(' ')[1];

    const decodedToken=jwt.verify(token,process.env.JWT_SECRET as string) as JwtPayload;

    if(!decodedToken || !decodedToken.user) {
        res.status(401).json({ message: 'Invalid token - Unauthorized' });
        return;
    }

    req.user=decodedToken.user;

    next();
} catch (error) {
    res.status(401).json({ message: 'Please login - jwt error' });
    return;
}
}