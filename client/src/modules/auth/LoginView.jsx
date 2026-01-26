import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../../redux/slices/authSlice';
import { authService } from '../../services/authService';
import clientConfig from '../../config/clientConfig';
import message from '../../utils/message';
import { extractErrorMessage } from '../../utils/errorHandler';

const loginSchema = yup.object().shape({
    email: yup.string()
        .required('Email or username is required'),
    password: yup.string().required('Password is required').min(5, 'Password too short'),
});

const LoginView = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema)
    });

    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: (data) => {
            dispatch(setCredentials(data));
            message.success(data.message || `Welcome back, ${data.user.name}!`);
            if (data.user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/student/stats');
            }
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'Login failed');
        }
    });

    const onSubmit = (data) => {
        loginMutation.mutate(data);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Sign in to your account</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Use your college credentials to access {clientConfig.APP_NAME}
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                    <input
                        {...register('email')}
                        type="text"
                        id="email"
                        className={`mt-1 block w-full border ${errors.email ? 'border-red-500' : 'border-slate-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        placeholder="student@sanjivani.edu.in"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                    <label htmlFor="password" title="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        {...register('password')}
                        type="password"
                        id="password"
                        className={`mt-1 block w-full border ${errors.password ? 'border-red-500' : 'border-slate-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
                    </div>
                </div>

                <button
                    disabled={loginMutation.isPending}
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                    Don't have an account? {' '}
                    <Link to="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">Register here</Link>
                </p>
            </div>

            {clientConfig.PROJECT_ENV == "DEV" && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg mt-6">
                    <p className="text-xs text-amber-800 font-medium mb-1">Dev Mode Bypass Active:</p>
                    <p className="text-[10px] text-amber-700">Type 'admin' or 'student' in email to auto-login.</p>
                </div>
            )}
        </div>
    );
};

export default LoginView;
