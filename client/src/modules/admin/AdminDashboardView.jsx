import React from 'react';
import { Users, ClipboardCheck, TrendingUp, AlertCircle } from 'lucide-react';

const AdminDashboardView = () => {
    const stats = [
        { label: 'Total Students', value: '1,240', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Tests Attempted', value: '45,600', icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Avg Study Time', value: '3.5h', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Issues', value: '2', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
                <p className="text-gray-600">Monitor system activity and student performance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
                        <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activities */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900">Recent Student Activity</h2>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Student</th>
                                    <th className="px-6 py-3 font-semibold">Action</th>
                                    <th className="px-6 py-3 font-semibold">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {[
                                    { name: 'Sojwal G.', action: 'Attempted OS Test', time: '5 mins ago' },
                                    { name: 'Rahul S.', action: 'Registered', time: '12 mins ago' },
                                    { name: 'Priya K.', action: 'Searched DBMS Unit 2', time: '20 mins ago' },
                                    { name: 'Amit P.', action: 'Completed Unit 1 Assessment', time: '45 mins ago' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{row.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{row.action}</td>
                                        <td className="px-6 py-4 text-gray-400">{row.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Popular Subjects */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900">Most Searched Subjects</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {[
                            { name: 'Operating Systems', count: 450, color: 'bg-indigo-600' },
                            { name: 'Database Management', count: 320, color: 'bg-emerald-600' },
                            { name: 'Software Engineering', count: 280, color: 'bg-blue-600' },
                            { name: 'Theory of Computation', count: 210, color: 'bg-amber-600' },
                        ].map((sub, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-700">{sub.name}</span>
                                    <span className="text-gray-500">{sub.count} searches</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className={`${sub.color} h-2 rounded-full`} style={{ width: `${(sub.count / 450) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardView;
