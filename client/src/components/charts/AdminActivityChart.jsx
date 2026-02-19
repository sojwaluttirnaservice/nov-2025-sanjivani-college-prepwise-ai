import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { format, parseISO } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl">
                <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-black text-indigo-600">
                    Activity: {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

const AdminActivityChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-400 font-medium">No activity data available yet</p>
            </div>
        );
    }

    // Process data to ensure dates are sorted and formatted if needed
    // Assuming data is { date: 'YYYY-MM-DD', count: number }
    const chartData = data.map(item => ({
        ...item,
        displayDate: format(parseISO(item.date), 'MMM dd')
    }));

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="displayDate"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        dy={10}
                        minTickGap={20}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar
                        dataKey="count"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#6366f1" />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AdminActivityChart;
