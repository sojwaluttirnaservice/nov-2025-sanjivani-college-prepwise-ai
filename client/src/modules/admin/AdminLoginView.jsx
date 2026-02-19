import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { setCredentials, selectCurrentUser } from '../../redux/slices/authSlice';
import { authService } from '../../services/authService';
import { extractErrorMessage } from '../../utils/errorHandler';

const loginSchema = yup.object().shape({
    email: yup.string().email('Enter a valid email').required('Email is required').max(100, "Email cannot be more than 100 characters").min(5, "Email cannot be less than 5 characters"),
    password: yup.string().required('Password is required').min(5, 'Password too short').max(100, "Password cannot be more than 100 characters"),
});

const AdminLoginView = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const user = useSelector(selectCurrentUser);

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            navigate('/admin', { replace: true });
        }
    }, [user, navigate]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema),
    });

    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: (data) => {
            if (data.user.role !== 'ADMIN') {
                setErrorMsg('Access denied. This portal is for administrators only.');
                return;
            }
            dispatch(setCredentials(data));
            navigate('/admin');
        },
        onError: (error) => {
            setErrorMsg(extractErrorMessage(error, 'Invalid credentials. Please try again.'));
        },
    });

    const onSubmit = (data) => {
        setErrorMsg('');
        loginMutation.mutate(data);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-inter bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950"
        >
            {/* Animated background blobs */}
            <div
                className="absolute -top-[100px] -left-[100px] w-[400px] h-[400px] rounded-full pointer-events-none bg-indigo-500/25 blur-[80px] animate-pulse"
            />
            <div
                className="absolute -bottom-[80px] -right-[80px] w-[350px] h-[350px] rounded-full pointer-events-none bg-violet-500/20 blur-[80px] animate-pulse delay-700"
            />
            <div
                className="absolute top-1/2 left-[60%] w-[300px] h-[300px] rounded-full pointer-events-none bg-blue-500/15 blur-[80px] animate-pulse delay-1000"
            />

            <div className="w-full max-w-[440px] relative z-10 animate-[fadeIn_0.5s_ease-out]">
                {/* Logo / Brand */}
                <div className="flex items-center justify-center gap-3.5 mb-7">
                    <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center shadow-[0_8px_32px_rgba(99,102,241,0.4)] bg-linear-to-br from-indigo-500 to-violet-500">
                        <ShieldCheck className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-white text-[22px] font-bold m-0 tracking-[-0.3px]">PrepWise AI</h1>
                        <p className="text-white/45 text-xs font-medium m-0 tracking-[0.5px] uppercase">Admin Control Panel</p>
                    </div>
                </div>

                {/* Card */}
                <div className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-3xl p-9 shadow-[0_25px_50px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]">
                    <div className="mb-7">
                        <h2 className="text-white text-[22px] font-bold m-0 mb-1.5 tracking-[-0.3px]">Administrator Sign In</h2>
                        <p className="text-white/45 text-[13px] m-0 font-normal">Restricted access — authorized personnel only</p>
                    </div>

                    {errorMsg && (
                        <div className="flex items-center gap-2.5 bg-red-500/12 border border-red-500/30 rounded-lg p-3 text-red-300 text-[13px] mb-5 leading-[1.4]">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        {/* Email */}
                        <div className="flex flex-col gap-2">
                            <label className="text-white/70 text-[13px] font-medium tracking-[0.2px]">Admin Email</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 flex items-center pointer-events-none">
                                    <Mail className="w-4 h-4" />
                                </span>
                                <input
                                    {...register('email')}
                                    type="email"
                                    id="admin-email"
                                    autoComplete="off"
                                    placeholder="admin@college.edu.in"
                                    className={`w-full bg-white/6 border rounded-xl py-[13px] px-[14px] pl-[42px] text-white text-sm outline-none transition-all duration-200 font-inter focus:border-indigo-500 focus:bg-white/10 placeholder:text-white/20 ${errors.email ? 'border-red-500' : 'border-white/12'}`}
                                />
                            </div>
                            {errors.email && <p className="text-red-400 text-xs m-0 font-normal">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-2">
                            <label className="text-white/70 text-[13px] font-medium tracking-[0.2px]">Password</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 flex items-center pointer-events-none">
                                    <Lock className="w-4 h-4" />
                                </span>
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    id="admin-password"
                                    autoComplete="off"
                                    placeholder="••••••••"
                                    className={`w-full bg-white/6 border rounded-xl py-[13px] px-[14px] pl-[42px] pr-[48px] text-white text-sm outline-none transition-all duration-200 font-inter focus:border-indigo-500 focus:bg-white/10 placeholder:text-white/20 ${errors.password ? 'border-red-500' : 'border-white/12'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-white/40 flex items-center p-1 hover:text-white transition-colors outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-xs m-0 font-normal">{errors.password.message}</p>}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full bg-linear-to-br from-indigo-500 to-violet-500 border-none rounded-xl p-3.5 text-white text-sm font-semibold cursor-pointer transition-all shadow-lg shadow-indigo-500/40 tracking-[0.2px] mt-1 font-inter hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loginMutation.isPending ? (
                                <span className="flex items-center justify-center gap-2.5">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Authenticating...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <LogIn className="w-4 h-4" />
                                    Sign In to Admin Panel
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-7">
                        <div className="flex items-center gap-2.5 mb-4">
                            <span className="flex-1 h-px bg-white/10" />
                            <span className="text-white/30 text-[11px] font-medium whitespace-nowrap tracking-[0.3px]">College PrepWise AI</span>
                            <span className="flex-1 h-px bg-white/10" />
                        </div>
                        <p className="text-center text-white/35 text-[13px] m-0">
                            Student? &nbsp;
                            <a href="/auth/login" className="text-indigo-400 no-underline font-medium hover:text-indigo-300 transition-colors">Go to Student Login →</a>
                        </p>
                    </div>
                </div>

                {/* Security badge */}
                <div className="flex items-center justify-center gap-1.5 mt-5 text-white/25 text-[11px] font-medium tracking-[0.3px]">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Secured with JWT Authentication</span>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AdminLoginView;
