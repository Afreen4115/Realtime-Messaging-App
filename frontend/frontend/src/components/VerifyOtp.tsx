"use client";
import { ArrowRight, Loader2, Lock } from 'lucide-react'
import React, { useRef } from 'react'
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ArrowLeft } from 'lucide-react';
import { useAppContext, user_service } from '@/context/AppContext';
import Loading from './Loading';
import toast from 'react-hot-toast';

const VerifyOtp = () => {
    const {isAuth,setIsAuth,setUser,loading:userLoading,fetchChats,fetchUsers}=useAppContext();

    const [loading, setLoading] = React.useState<boolean>(false);
    const [otp, setOtp] = React.useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = React.useState<string>("");
    const [resendLoading, setResendLoading] = React.useState<boolean>(false);
    const [timer, setTimer] = React.useState<number>(60);

    const inputRefs = useRef<Array<HTMLInputElement>>([]);

    const router = useRouter();

    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    React.useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleInputChange = (index: number, value: string) => {
        if (value.length > 1) return; // Prevent entering more than one character
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError("");
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLElement>): void => {
        if (e.key === "Backspace" && !otp[index]) {
            inputRefs.current[index - 1]?.focus();
        }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLElement>): void => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text");
        const digits = pasteData.replace(/\D/g, "").slice(0, 6);
        if (digits.length == 6) {
            const newOtp = digits.split("");
            setOtp(newOtp);
            inputRefs.current[5]?.focus();
        }
    }
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length != 6) {
            setError("Please Enter all 6 digits");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const { data } = await axios.post(`${user_service}/api/v1/verify`, {
                email,
                otp: otpString,
            })
            toast.success(data.message);
            Cookies.set("token", data.token, {
                expires: 15,
                secure: false,
                path: "/"
            });
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
            setUser(data.user);
            setIsAuth(true);
            fetchChats();
            fetchUsers();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Something went wrong");
            } else {
                setError("Something went wrong");
            }
        } finally {
            setLoading(false);

        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setError("");
        try {
            const { data } = await axios.post(`${user_service}/api/v1/login`, {
                email,
            });
            toast.success(data.message);
            setTimer(60);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Something went wrong");
            } else {
                setError("Something went wrong");
            }

        } finally {
            setResendLoading(false);
        }
    }

    if(userLoading){
        return <Loading/>
    }

    if(isAuth){
        redirect('/chat')
    }
    return (
        <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
            <div className='max-w-lg w-full'>
                <div className='bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8'>
                    <div className='text-center mb-8 relative'>
                        <button className='absolute top-4 left-0 p-2 text-gray-400 hover:text-gray-300'
                        onClick={()=>router.push('/login')}>
                            <ArrowLeft className='w-6 h-6' />
                        </button>
                        <div className='mx-auto w-22 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6' >
                            <Lock size={40} className='text-white' />
                        </div>
                        <h1 className='text-4xl font-bold text-white mb-3'>
                            Veify Your Email
                        </h1>
                        <p className='text-gray-400 text-lg'>We have sent 6-digit to</p>
                        <p className='text-blue-400 font-medium'>{email}</p>
                    </div>
                    <form className='space-y-6' onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor='email' className='block text-sm font-medium text-gray-300 mb-4 text-center'>
                                Enter your 6 digit otp here
                            </label>
                            <div className='flex items-center justify-center in-checked: space-x-3'>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        type='text'
                                        maxLength={1}
                                        className='w-12 h-12 text-center text-xl bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        value={digit}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        ref={(ele: HTMLInputElement) => {
                                            inputRefs.current[index] = ele
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        {error && <div className='bg-red-900 border-red-700 rounded-lg p-3'>
                            <p className='text-red-300 text-sm text-center'>{error}</p></div>}
                        <button className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
                            {loading ? (
                                <div className='flex items-center gap-2 justify-center'>
                                    <Loader2 className='w-5 h-5 animate-spin' />
                                    <span>Verifying...</span>
                                </div>
                            ) : (
                                <div className='flex items-center gap-2 justify-center'>
                                    <span>Verify</span>
                                    <ArrowRight className='w-5 h-5' />
                                </div>
                            )}
                        </button>
                    </form>
                    <div className='mt-6 text-center'>
                        <p className='text-gray-400 text-sm mb-4'>Didn`t receive the code?</p>
                        {timer > 0 ? (
                            <p className='text-gray-400 text-sm mb-4'>{`Resend code in ${timer} seconds`}</p>
                        ) : (
                            <button className='text-blue-400 hover:text-blue-300 font-medium text-sm disabled:opacity:50' disabled={resendLoading}
                                onClick={handleResend}>
                                {resendLoading ? "Sending..." : "Resend Code"}
                            </button>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default VerifyOtp;