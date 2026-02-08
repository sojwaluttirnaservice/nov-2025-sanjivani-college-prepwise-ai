import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl">
                <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-black text-indigo-600">
                    Score: {payload[0].value}%
                </p>
            </div>
        );
    }
    return null;
};

const PerformanceChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-400 font-medium">No performance data available yet</p>
            </div>
        );
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        dy={10}
                        minTickGap={30}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                    />
                    {/* Reference line for passing grade */}
                    <ReferenceLine y={60} stroke="#cbd5e1" strokeDasharray="3 3" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PerformanceChart;
