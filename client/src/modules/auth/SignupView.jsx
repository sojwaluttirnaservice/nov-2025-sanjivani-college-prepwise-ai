import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import message from '../../utils/message';
import { authService } from '../../services/authService';
import { fetchBranches } from '../../redux/slices/resourceSlice';
import clientConfig from '../../config/clientConfig';
import { extractErrorMessage } from '../../utils/errorHandler';

const signupSchema = yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    branch: yup.string().required('Branch selection is required'),
    semester: yup.number().required('Semester is required').min(1).max(8),
    email: yup.string()
        .required('Email is required'),
    password: yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
});

const SignupView = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { branches, status: branchStatus } = useSelector((state) => state.resource);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(signupSchema),
        defaultValues: {
            semester: 1
        }
    });

    useEffect(() => {
        dispatch(fetchBranches());
    }, [dispatch]);

    const signupMutation = useMutation({
        mutationFn: authService.register,
        onSuccess: (data) => {
            message.success(data.message || 'Registration successful! Please sign in.');
            navigate('/auth/login');
        },
        onError: (error) => {
            message.error(extractErrorMessage(error, 'Registration failed'));
        }
    });

    const onSubmit = (data) => {
        // Construct payload matching User schema
        const payload = {
            name: `${data.firstName} ${data.lastName}`.trim(),
            email: data.email,
            password: data.password,
            branchId: data.branch,
            semester: Number(data.semester),
            year: Math.ceil(Number(data.semester) / 2)
        };

        signupMutation.mutate(payload);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Join {clientConfig.APP_NAME} and start your exam preparation
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                            {...register('firstName')}
                            type="text"
                            id="firstName"
                            className={`mt-1 block w-full border ${errors.firstName ? 'border-red-500' : 'border-slate-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                        {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                            {...register('lastName')}
                            type="text"
                            id="lastName"
                            className={`mt-1 block w-full border ${errors.lastName ? 'border-red-500' : 'border-slate-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                        {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
                    </div>
                </div>

                <div>
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Branch</label>
                    <select
                        {...register('branch')}
                        id="branch"
                        disabled={branchStatus === 'loading'}
                        className={`mt-1 block w-full border ${errors.branch ? 'border-red-500' : 'border-slate-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100`}
                    >
                        <option value="">Select a branch</option>
                        {branches?.map(branch => (
                            <option key={branch._id} value={branch._id}>{branch.name}</option>
                        ))}
                    </select>
                    {errors.branch && <p className="mt-1 text-xs text-red-500">{errors.branch.message}</p>}
                    {branchStatus === 'failed' && <p className="mt-1 text-xs text-red-500">Failed to load branches.</p>}
                </div>

                <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Current Semester</label>
                    <select
                        {...register('semester')}
                        id="semester"
                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="email" title="email" className="block text-sm font-medium text-gray-700">Email address</label>
                    <input
                        {...register('email')}
                        type="email"
                        id="email"
                        className={`mt-1 block w-full border ${errors.email ? 'border-red-500' : 'border-slate-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        placeholder="student@college.edu.in"
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

                <button
                    disabled={signupMutation.isPending}
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {signupMutation.isPending ? 'Creating account...' : 'Register'}
                </button>
            </form>

            <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                    Already have an account? {' '}
                    <Link to="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupView;

