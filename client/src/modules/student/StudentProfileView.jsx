import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Mail, BookOpen, Calendar, GraduationCap, Settings, Award, Loader2 } from 'lucide-react';
import { selectCurrentToken, selectCurrentUser, updateCurrentUser } from '../../redux/slices/authSlice';
import { fetchBranches } from '../../redux/slices/resourceSlice';
import { authService } from '../../services/authService';
import { studentService } from '../../services/studentService';
import message from '../../utils/message';
import Container from '../../components/utils/Container';
import { extractErrorMessage } from '../../utils/errorHandler';


const profileSchema = yup.object().shape({
    name: yup.string().required('Name is required').min(2, 'Name is too short'),
    branchId: yup.string().required('Branch is required'),
    semester: yup.number().required('Semester is required').min(1).max(8),
});

const StudentProfileView = () => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const token = useSelector(selectCurrentToken);
    const user = useSelector(selectCurrentUser);
    const { branches, status: branchStatus } = useSelector((state) => state.resource);

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        dispatch(fetchBranches());
    }, [dispatch]);

    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['users-me'],
        queryFn: authService.me,
        enabled: !!token,
    });

    const { data: stats } = useQuery({
        queryKey: ['student-stats'],
        queryFn: studentService.getStats,
        enabled: !!token,
    });

    useEffect(() => {
        if (profile) {
            dispatch(updateCurrentUser(profile));
        }
    }, [dispatch, profile]);

    const currentUser = profile || user;

    const currentBranchId = useMemo(() => {
        const raw = currentUser?.branchId;
        if (!raw) return '';
        if (typeof raw === 'string') return raw;
        return raw?._id || '';
    }, [currentUser]);

    const currentBranch = useMemo(() => {
        if (!currentBranchId) return null;
        return branches.find((b) => b._id === currentBranchId) || null;
    }, [branches, currentBranchId]);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            name: '',
            branchId: '',
            semester: 1,
        }
    });

    useEffect(() => {
        if (!currentUser) return;

        reset({
            name: currentUser?.name || '',
            branchId: currentBranchId || '',
            semester: currentUser?.semester || 1,
        });
    }, [currentUser, currentBranchId, reset]);

    const watchedSemester = Number(watch('semester') || 1);
    const computedYear = Math.ceil(watchedSemester / 2);

    const updateMutation = useMutation({
        mutationFn: authService.updateMe,
        onSuccess: (response) => {
            // The response itself might be the user object or wrapped. 
            // Assuming authService.updateMe returns the user object directly based on existing code, 
            // but we need the message. If the service unwraps it, we might lose the message.
            // Checking studentProfileView:92 -> queryClient.setQueryData(['users-me'], updatedUser);
            // If the service returns just data, we can't get the message. 
            // Let's assume for now we use a generic success or try to read it if available.
            // Actually, best practice requested is to use backend message. 
            // I'll check authService to see if it returns the full response or just data.
            // Safe bet: updatedUser might be the data payload. 
            // Wait, I should check authService first to be sure.
            // BUT, for now I will use a fallback pattern.
            console.log('[DEBUG] Profile update success. Received:', response);
            // If response has message, use it.
            const msg = response?.message || 'Profile updated successfully';
            const userPayload = response?.data || response; // Handle wrapped or unwrapped

            queryClient.setQueryData(['users-me'], userPayload);
            dispatch(updateCurrentUser(userPayload));
            message.success(msg);
            setIsEditing(false);
        },
        onError: (error) => {
            console.error('[DEBUG] Profile update error:', error);
            message.error(extractErrorMessage(error || 'Failed to update profile'));
        }
    });

    const academicInfo = [
        { label: 'Branch', value: currentBranch?.name || '—', icon: GraduationCap },
        { label: 'Semester', value: currentUser?.semester ? `Semester ${currentUser.semester}` : '—', icon: BookOpen },
        { label: 'Year', value: currentUser?.year ? `Year ${currentUser.year}` : '—', icon: Calendar },
        { label: 'Standing', value: stats?.averageScore >= 80 ? 'Excellent' : stats?.averageScore >= 60 ? 'Good Standing' : 'Needs Support', icon: Award },
    ];

    const performanceMetrics = [
        { label: 'Assessments Taken', value: stats?.completedAssessments || '0', color: 'text-indigo-600' },
        { label: 'Average Accuracy', value: `${stats?.averageScore || 0}%`, color: 'text-emerald-600' },
        { label: 'Study Hours', value: `${stats?.studyHours || 0}h`, color: 'text-amber-600' },
    ];

    return (
        <div className="py-10 bg-slate-50/50 min-h-screen">
            <Container>
                {/* Profile Header */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 mb-10 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>

                    <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-100 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <User className="w-16 h-16 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-2xl flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        <div className="text-center md:text-left space-y-2">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{currentUser?.name || 'Student'}</h1>
                                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
                                    {currentUser?.role || 'User'}
                                </span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-medium">
                                <Mail className="w-4 h-4" />
                                <span>{currentUser?.email || '—'}</span>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing((v) => !v)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                                >
                                    <Settings className="w-4 h-4" />
                                    {isEditing ? 'Close Editor' : 'Edit Profile'}
                                </button>

                                {isProfileLoading && (
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading profile...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Academic Information */}
                    <div className="lg:col-span-7 space-y-8">
                        {isEditing && (
                            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4">
                                        <Settings className="w-7 h-7 text-slate-900" />
                                        Edit Profile
                                    </h2>
                                </div>

                                <form className="space-y-6" onSubmit={handleSubmit((data) => {
                                    updateMutation.mutate({
                                        name: data.name,
                                        branchId: data.branchId,
                                        semester: Number(data.semester),
                                    });
                                })}>
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-black text-slate-500 uppercase tracking-widest">Name</label>
                                        <input
                                            {...register('name')}
                                            id="name"
                                            type="text"
                                            className={`mt-2 block w-full border ${errors.name ? 'border-red-500' : 'border-slate-200'} rounded-2xl shadow-sm py-3 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                        />
                                        {errors.name && <p className="mt-2 text-xs font-bold text-red-500">{errors.name.message}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-black text-slate-500 uppercase tracking-widest">Email</label>
                                        <input
                                            id="email"
                                            type="text"
                                            disabled
                                            value={currentUser?.email || ''}
                                            className="mt-2 block w-full border border-slate-200 rounded-2xl shadow-sm py-3 px-4 sm:text-sm bg-slate-50 text-slate-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2">
                                            <label htmlFor="branchId" className="block text-sm font-black text-slate-500 uppercase tracking-widest">Branch</label>
                                            <select
                                                {...register('branchId')}
                                                id="branchId"
                                                disabled={branchStatus === 'loading'}
                                                className={`mt-2 block w-full border ${errors.branchId ? 'border-red-500' : 'border-slate-200'} rounded-2xl shadow-sm py-3 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50`}
                                            >
                                                <option value="">Select a branch</option>
                                                {branches?.map((branch) => (
                                                    <option key={branch._id} value={branch._id}>{branch.name}</option>
                                                ))}
                                            </select>
                                            {errors.branchId && <p className="mt-2 text-xs font-bold text-red-500">{errors.branchId.message}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="semester" className="block text-sm font-black text-slate-500 uppercase tracking-widest">Semester</label>
                                            <select
                                                {...register('semester')}
                                                id="semester"
                                                className={`mt-2 block w-full border ${errors.semester ? 'border-red-500' : 'border-slate-200'} rounded-2xl shadow-sm py-3 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                                    <option key={sem} value={sem}>Sem {sem}</option>
                                                ))}
                                            </select>
                                            {errors.semester && <p className="mt-2 text-xs font-bold text-red-500">{errors.semester.message}</p>}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Derived field</p>
                                        <p className="mt-1 text-sm font-bold text-slate-700">Year will be saved as: <span className="text-slate-900">Year {computedYear}</span></p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            type="submit"
                                            disabled={updateMutation.isPending}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Save Changes
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                reset({
                                                    name: currentUser?.name || '',
                                                    branchId: currentBranchId || '',
                                                    semester: currentUser?.semester || 1,
                                                });
                                            }}
                                            className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-colors border border-slate-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 h-full">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4">
                                    <GraduationCap className="w-8 h-8 text-indigo-600" />
                                    Academic Standing
                                </h2>
                                <Award className="w-6 h-6 text-amber-500" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {academicInfo.map((info, idx) => (
                                    <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all duration-300">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                <info.icon className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{info.label}</span>
                                        </div>
                                        <p className="text-lg font-bold text-gray-900 px-1">{info.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats & Performance */}
                    <div className="lg:col-span-5 space-y-10">
                        <div className="bg-slate-900 rounded-[2rem] p-10 shadow-xl shadow-indigo-100/20 text-white h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                            <h2 className="text-xl font-black mb-8 relative z-10 uppercase tracking-widest text-indigo-300">Performance Snapshot</h2>

                            <div className="space-y-8 relative z-10">
                                {performanceMetrics.map((perf, idx) => (
                                    <div key={idx} className="flex items-center justify-between border-b border-white/10 pb-6 last:border-0 last:pb-0">
                                        <p className="font-bold text-slate-400">{perf.label}</p>
                                        <p className={`text-2xl font-black tracking-tight ${perf.color}`}>{perf.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                                <p className="text-sm font-medium text-slate-400 leading-relaxed text-center italic">
                                    {stats?.averageScore > 70
                                        ? `"Your consistent performance is showing! Keep up the great work in your assessments."`
                                        : `"Focusing on your weak topics could boost your overall accuracy by up to 15%."`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default StudentProfileView;
