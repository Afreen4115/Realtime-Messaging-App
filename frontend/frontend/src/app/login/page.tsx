"use client"
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { redirect, useRouter } from 'next/navigation';
import React from 'react'
import axios from 'axios';
import { useAppContext, user_service } from '@/context/AppContext';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';

//logining infsaadsada
//navya branch 
//merging to main here

//navya to  main

const LoginPage = () => {
    const [email, setEmail] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(false);
    const router = useRouter();

    const { isAuth, loading: userLoading } = useAppContext();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(`${user_service}/api/v1/login`, { email });
            toast.success(data.message);
            router.push(`/verify?email=${email}`);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "An error occurred");
            } else {
                toast.error("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }

    }

    if (userLoading) {
        return <Loading />
    }
    if (isAuth) {
        redirect('/chat')
    }
    return (
        <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
            <div className='max-w-lg w-full'>
                <div className='bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8'>
                    <div className='text-center mb-8'>
                        <div className='mx-auto w-22 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6' >
                            <Mail size={40} className='text-white' />
                        </div>
                        <h1 className='text-4xl font-bold text-white mb-3'>
                            Welcome to Chat App
                        </h1>
                        <p className='text-gray-400 text-lg'>Enter your email address to continue your journey</p>
                    </div>
                    <form className='space-y-6' onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor='email' className='block text-sm font-medium text-gray-300 mb-2'>
                                Email Address
                            </label>
                            <input
                                type='email'
                                id='email'
                                className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                                placeholder='Enter your email address'
                                required
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                disabled={loading}
                            />
                        </div>
                        <button className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
                            {loading ? (
                                <div className='flex items-center gap-2 justify-center'>
                                    <Loader2 className='w-5 h-5 animate-spin' />
                                    <span>Sending Otp to your email...</span>
                                </div>
                            ) : (
                                <div className='flex items-center gap-2 justify-center'>
                                    <span>Send Verification Code</span>
                                    <ArrowRight className='w-5 h-5' />
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;