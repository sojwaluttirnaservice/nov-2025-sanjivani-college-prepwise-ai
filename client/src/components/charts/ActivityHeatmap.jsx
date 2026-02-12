import React, { useMemo, useState } from 'react';
import {
    eachDayOfInterval,
    format,
    endOfMonth,
    parseISO,
    isValid,
    getDay
} from 'date-fns';

const ActivityHeatmap = ({ data = {} }) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [hoveredCell, setHoveredCell] = useState(null);

    // Calculate available years from data
    const availableYears = useMemo(() => {
        const years = new Set([currentYear]);
        Object.keys(data).forEach(dateStr => {
            const date = parseISO(dateStr);
            if (isValid(date)) {
                years.add(date.getFullYear());
            }
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [data, currentYear]);

    // Group days by month for the selected year
    const monthsData = useMemo(() => {
        const months = [];

        for (let month = 0; month < 12; month++) {
            const firstDayOfMonth = new Date(selectedYear, month, 1);
            const lastDayOfMonth = endOfMonth(firstDayOfMonth);

            const daysInMonth = eachDayOfInterval({
                start: firstDayOfMonth,
                end: lastDayOfMonth
            });

            // Calculate empty slots at the start of the month to align days correctly
            const startOffset = getDay(firstDayOfMonth);
            const prefixEmptyDays = Array(startOffset).fill(null);

            months.push({
                name: format(firstDayOfMonth, 'MMM'),
                days: [...prefixEmptyDays, ...daysInMonth]
            });
        }
        return months;
    }, [selectedYear]);

    const getIntensityClass = (count) => {
        if (!count) return 'bg-slate-100';
        if (count === 1) return 'bg-indigo-200';
        if (count <= 3) return 'bg-indigo-400';
        if (count <= 5) return 'bg-indigo-600';
        return 'bg-indigo-800';
    };

    const handleMouseEnter = (e, day, count) => {
        const rect = e.target.getBoundingClientRect();
        setHoveredCell({
            x: rect.left + rect.width / 2,
            y: rect.top,
            date: format(day, 'EEEE, MMM do, yyyy'),
            count
        });
    };

    return (
        <div className="flex flex-col gap-4 w-full cursor-default relative">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">
                        Yearly Activity
                    </h4>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="text-xs font-medium text-slate-600 border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-400 ml-auto leading-none">
                    <span>Less</span>
                    <div className="w-2.5 h-2.5 bg-slate-100 rounded-sm"></div>
                    <div className="w-2.5 h-2.5 bg-indigo-200 rounded-sm"></div>
                    <div className="w-2.5 h-2.5 bg-indigo-400 rounded-sm"></div>
                    <div className="w-2.5 h-2.5 bg-indigo-600 rounded-sm"></div>
                    <div className="w-2.5 h-2.5 bg-indigo-800 rounded-sm"></div>
                    <span>More</span>
                </div>
            </div>

            {/* Heatmap Grid - Horizontal Scroll */}
            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide relative z-0">
                {/* Day Labels (Sticky Left) */}
                <div className="flex flex-col justify-end gap-1 text-[9px] text-slate-300 font-medium pb-0.5 sticky left-0 bg-white z-10 pr-2">
                    <span className="h-3 flex items-center">Mon</span>
                    <span className="h-3"></span>
                    <span className="h-3 flex items-center">Wed</span>
                    <span className="h-3"></span>
                    <span className="h-3 flex items-center">Fri</span>
                    <span className="h-3"></span>
                </div>

                {/* Months */}
                {monthsData.map((month, mIndex) => (
                    <div key={mIndex} className="flex flex-col gap-2 min-w-max">
                        <h5 className="text-[10px] font-semibold text-slate-500 text-center uppercase tracking-wider">
                            {month.name}
                        </h5>

                        {/* 7-row grid for the month */}
                        <div className="grid grid-rows-7 grid-flow-col gap-1">
                            {month.days.map((day, dIndex) => {
                                if (!day) {
                                    // Empty slot filler
                                    return <div key={`empty-${dIndex}`} className="w-3 h-3" />;
                                }

                                const dateStr = format(day, 'yyyy-MM-dd');
                                const count = data[dateStr] || 0;

                                return (
                                    <div
                                        key={dateStr}
                                        onMouseEnter={(e) => handleMouseEnter(e, day, count)}
                                        onMouseLeave={() => setHoveredCell(null)}
                                        className={`
                                            w-3 h-3 rounded-sm transition-colors
                                            ${getIntensityClass(count)}
                                        `}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Custom Tooltip Portal/Overlay */}
            {hoveredCell && (
                <div
                    className="fixed z-50 bg-slate-800 text-white text-[10px] py-1 px-2 rounded-md shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-6px] whitespace-nowrap"
                    style={{
                        left: hoveredCell.x,
                        top: hoveredCell.y
                    }}
                >
                    <div className="font-semibold">{hoveredCell.date}</div>
                    <div className="text-slate-300">{hoveredCell.count} activities</div>
                    {/* Tiny arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
            )}
        </div>
    );
};

export default ActivityHeatmap;
