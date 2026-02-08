import React from 'react';

const ActivityHeatmap = ({ data = {} }) => {
    // Generate last 365 days or just 30 days for simplicity
    // Let's do a 4 week grid for now to fit mobile

    const getIntensityClass = (count) => {
        if (!count) return 'bg-slate-100';
        if (count === 1) return 'bg-indigo-200';
        if (count <= 3) return 'bg-indigo-400';
        return 'bg-indigo-600';
    };

    // Generate grid for last 4 weeks (28 days)
    const days = Array.from({ length: 28 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (27 - i));
        const dateStr = d.toISOString().split('T')[0];
        const count = data[dateStr] || 0;

        return {
            date: dateStr,
            count,
            dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
            isToday: i === 27
        };
    });

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end mb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Last 30 Days Activity
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span>Less</span>
                    <div className="w-2 h-2 bg-slate-100 rounded-sm"></div>
                    <div className="w-2 h-2 bg-indigo-200 rounded-sm"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-sm"></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-sm"></div>
                    <span>More</span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 w-full">
                {days.map((day) => (
                    <div
                        key={day.date}
                        className={`
                aspect-square rounded-md flex items-center justify-center relative group cursor-pointer transition-colors
                ${getIntensityClass(day.count)}
                ${day.isToday ? 'ring-2 ring-indigo-300 ring-offset-1' : ''}
            `}
                    >
                        <span className="text-[9px] font-medium text-slate-100 opacity-0 group-hover:opacity-100 absolute -bottom-5 bg-slate-900 px-1.5 py-0.5 rounded whitespace-nowrap z-10 transition-opacity">
                            {day.date}: {day.count}
                        </span>
                    </div>
                ))}
            </div>
            <div className="flex justify-between px-1 mt-1 text-[10px] font-medium text-slate-400">
                <span>4 weeks ago</span>
                <span>Today</span>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
