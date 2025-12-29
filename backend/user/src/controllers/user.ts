import generateToken from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbimq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from '../index.js';
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { User } from "../models/User.js";

export const loginUser = TryCatch(async (req, res) => {
    const { email } = req.body;

    const rateLimitKey = `otp:ratelimit:${email}`;
    const ratelimit = await redisClient.get(rateLimitKey);
    if (ratelimit) {
        return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp, {
        EX: 900, // OTP expires in 15 minutes
    }); // Store

    await redisClient.set(rateLimitKey, 'rate-limit', {
        EX: 60 // Rate limit key expires in 1 minute after 1minute he can enter otp again
    }); // Store rate limit key for 1 minute

    const message = {
        from: 'afreen@support.com',
        to: email,
        subject: 'Your OTP Code',
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #4CAF50;">Your OTP Code</h2>
            <p>Hello,</p>
            <p>Your OTP code is:</p>
            <div style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #000;">${otp}</div>
            <p>This code is valid for <strong>15 minutes</strong>.</p>
            <p>If you did not request this, please ignore this message.</p>
            <hr />
            <p style="font-size: 12px; color: #888;">Thank you,<br/>Your App Team</p>
        </div>
    `
    };

    await publishToQueue('send-otp', message);

    res.status(200).json({
        message: 'OTP sent successfully. Please check your email.'
    });


});


export const verifyUser = TryCatch(async (req, res) => {
    const { email, otp: enteredOtp } = req.body;

    if (!email || !enteredOtp) {
        return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);

    if (!storedOtp) {
        return res.status(400).json({ message: 'OTP has expired or is invalid.' });
    }

    if (storedOtp !== enteredOtp) {
        return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    await redisClient.del(otpKey);
    await redisClient.del(`otp:ratelimit:${email}`);

    let user = await User.findOne({ email });

    if (!user) {
        const name = email.slice(0, email.indexOf('@'));
        user = await User.create({ name, email });
    }

    const token = generateToken(user);

    return res.status(200).json({
        message: 'User verified successfully.',
        user,
        token,
    });
});


export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    res.json({user});
})


export const updateName=TryCatch(async (req: AuthenticatedRequest, res) => {
    const user=await User.findById(req.user?._id);
    if(!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    user.name=req.body.name;
    await user.save();

    const token=generateToken(user);
    res.status(200).json({
        message: 'Name updated successfully',
        user,
        token
    });
})


export const getAllUsers=TryCatch(async (req: AuthenticatedRequest, res) => {

    const users=await User.find();

    res.status(200).json({
        
        users
    });
});

export const getAUser=TryCatch(async (req, res) => {
    const user=await User.findById(req.params.id);
    res.status(200).json({
        user});

});
