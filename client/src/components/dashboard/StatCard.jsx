import React from 'react';

const StatCard = ({ title, value, unit, icon: Icon, trend, color = "indigo" }) => {
    const colorClasses = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
    };

    return (
        <div className={`
        relative overflow-hidden
        p-5 rounded-2xl bg-white border border-slate-100 shadow-sm
        hover:shadow-md transition-shadow
    `}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>

            <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
                    {unit && <span className="text-sm font-bold text-slate-400">{unit}</span>}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
