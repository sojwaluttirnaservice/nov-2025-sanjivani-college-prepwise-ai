import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';

const StudentListView = () => {
    const navigate = useNavigate();

    // Consolidated State
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '',
        branch: '',
        year: '',
    });

    // Debounce search term to avoid API hammering
    const debouncedSearch = useDebounce(filters.search, 500);

    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['students', filters.page, filters.limit, debouncedSearch, filters.branch, filters.year],
        queryFn: () => adminService.getStudents({
            page: filters.page,
            limit: filters.limit,
            search: debouncedSearch,
            branch: filters.branch,
            year: filters.year
        }),
        keepPreviousData: true,
        refetchInterval: 30000, // Poll every 30s
    });

    // Fetch Branches Dynamically
    const { data: branchesData } = useQuery({
        queryKey: ['branches'],
        queryFn: adminService.getBranches,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const branches = branchesData?.branches || [];

    const students = data?.users || [];
    const pagination = data?.pagination || {};

    // Handlers
    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
    };

    const handleFilterChange = (key) => (e) => {
        setFilters(prev => ({ ...prev, [key]: e.target.value, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const clearFilters = () => {
        setFilters({
            page: 1,
            limit: 10,
            search: '',
            branch: '',
            year: '',
        });
    };

    const hasActiveFilters = filters.search || filters.branch || filters.year;

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Student Management</h1>
                    <p className="text-slate-500 mt-1">Manage and monitor student performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        className={`p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all ${isFetching ? 'animate-spin' : ''}`}
                        title="Refresh Data"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
                        Total Students: {pagination.total || 0}
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search students by name or email..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                    {filters.search && (
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, search: '', page: 1 }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="flex gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 items-center">
                    <select
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[160px] cursor-pointer hover:border-indigo-300 transition-colors"
                        value={filters.branch}
                        onChange={handleFilterChange('branch')}
                    >
                        <option value="">All Branches</option>
                        {branches.map((branch) => (
                            <option key={branch._id} value={branch._id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[110px]"
                        value={filters.year}
                        onChange={handleFilterChange('year')}
                    >
                        <option value="">All Years</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                    </select>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-red-500 hover:text-red-700 font-medium whitespace-nowrap px-2"
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100vh-250px)]">
                <div className="overflow-x-auto overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
                            <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <th className="px-6 py-4 whitespace-nowrap">Student</th>
                                <th className="px-6 py-4 whitespace-nowrap">Branch</th>
                                <th className="px-6 py-4 whitespace-nowrap">Year / Sem</th>
                                <th className="px-6 py-4 whitespace-nowrap">Joined</th>
                                <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-slate-200 rounded-lg ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : isError ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-red-500">
                                        Failed to load students. Please try again.
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                            <Search className="text-slate-400" size={20} />
                                        </div>
                                        <p className="font-medium">No students found</p>
                                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student._id} className="hover:bg-indigo-50/50 transition-all duration-200 group border-b border-slate-50 last:border-0 hover:shadow-sm">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm uppercase">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{student.name}</p>
                                                    <p className="text-xs text-slate-500">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {student.branchId?.name || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            Year {student.year} • Sem {student.semester}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                                            {new Date(student.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/admin/students/${student._id}`)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading && !isError && pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <div className="text-sm text-slate-500">
                            Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-medium">{Math.min(filters.page * filters.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> students
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
                                disabled={filters.page === 1}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg">
                                Page {filters.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => handlePageChange(Math.min(pagination.pages, filters.page + 1))}
                                disabled={filters.page === pagination.pages}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentListView;
