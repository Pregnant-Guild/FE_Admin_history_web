"use client";

import { useState, useRef, useEffect, useMemo } from "react";

interface CustomDateRangePickerProps {
    onFilterChange: (
        startDate: string,
        endDate: string,
        startTime: string,
        endTime: string
    ) => void;
}

const DAYS_OF_WEEK = ["Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "CN"];
const MONTHS = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];

const getStartOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const formatDateToString = (date: Date | null) => {
    if (!date) return "";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
};

export default function CustomDateRangePicker({ onFilterChange }: CustomDateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [currentMonthDate, setCurrentMonthDate] = useState(getStartOfDay(new Date()));

    // LOGIC MỚI: Tách biệt rõ ràng state Từ ngày và Đến ngày
    const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
    const [endTimestamp, setEndTimestamp] = useState<number | null>(null);

    // History dùng để theo dõi thứ tự click, phục vụ "Cửa sổ trượt" giữ 2 ngày gần nhất
    const [history, setHistory] = useState<number[]>([]);

    const [startTime, setStartTime] = useState<string>("00:00");
    const [endTime, setEndTime] = useState<string>("23:59");

    const startDate = startTimestamp ? new Date(startTimestamp) : null;
    const endDate = endTimestamp ? new Date(endTimestamp) : null;

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Update parent
    useEffect(() => {
        const sDate = startDate ? formatDateToString(startDate) : "";
        const eDate = endDate ? formatDateToString(endDate) : "";
        const sTime = startDate ? startTime : "";
        const eTime = endDate ? endTime : "";
        onFilterChange(sDate, eDate, sTime, eTime);
    }, [startTimestamp, endTimestamp, startTime, endTime]);

    const { daysInMonth, emptyDays } = useMemo(() => {
        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        let firstDayIndex = new Date(year, month, 1).getDay() - 1;
        if (firstDayIndex < 0) firstDayIndex = 6;
        return { daysInMonth: days, emptyDays: firstDayIndex };
    }, [currentMonthDate]);

    const handleDayClick = (day: number) => {
        const clickedTime = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), day).getTime();

        if (clickedTime === startTimestamp) {
            setStartTimestamp(null);
            setHistory(prev => prev.filter(t => t !== clickedTime));
            return;
        }
        if (clickedTime === endTimestamp) {
            setEndTimestamp(null);
            setHistory(prev => prev.filter(t => t !== clickedTime));
            return;
        }

        let newStart = startTimestamp;
        let newEnd = endTimestamp;
        let newHistory = [...history];

        if (newStart && newEnd) {
            const oldest = newHistory[0];
            if (oldest === newStart) newStart = null;
            else if (oldest === newEnd) newEnd = null;
            newHistory.shift();
        }

        if (!newStart && !newEnd) {
            newEnd = clickedTime;
        }
        else if (!newStart && newEnd) {
            if (clickedTime < newEnd) {
                newStart = clickedTime;
            } else {
                newStart = newEnd;
                newEnd = clickedTime;
            }
        }
        else if (newStart && !newEnd) {
            if (clickedTime > newStart) {
                newEnd = clickedTime;
            } else {
                newEnd = newStart;
                newStart = clickedTime;
            }
        }

        newHistory.push(clickedTime);
        setStartTimestamp(newStart);
        setEndTimestamp(newEnd);
        setHistory(newHistory);
    };

    const handleManualDateChange = (val: string, target: 'start' | 'end') => {
        const newTime = val ? new Date(val).getTime() : null;

        if (target === 'start') {
            const oldTime = startTimestamp;
            setStartTimestamp(newTime);
            setHistory(prev => {
                let h = prev;
                if (oldTime) h = h.filter(t => t !== oldTime);
                if (newTime) h = [...h, newTime];
                return h.slice(-2);
            });
        } else {
            const oldTime = endTimestamp;
            setEndTimestamp(newTime);
            setHistory(prev => {
                let h = prev;
                if (oldTime) h = h.filter(t => t !== oldTime);
                if (newTime) h = [...h, newTime];
                return h.slice(-2);
            });
        }
    };

    const nextMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
    const nextYear = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear() + 1, currentMonthDate.getMonth(), 1));
    const prevYear = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear() - 1, currentMonthDate.getMonth(), 1));

    const renderDateBox = (date: Date | null) => {
        if (!date) return "mm/dd/yyyy";
        const d = date.getDate().toString().padStart(2, "0");
        const m = (date.getMonth() + 1).toString().padStart(2, "0");
        const y = date.getFullYear();
        return `${m}/${d}/${y}`;
    };

    const isSelected = (day: number) => {
        const d = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), day).getTime();
        return d === startTimestamp || d === endTimestamp;
    };

    const isInRange = (day: number) => {
        const d = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), day).getTime();
        if (startTimestamp && endTimestamp && d > startTimestamp && d < endTimestamp) return true;
        return false;
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all outline-none text-gray-700 dark:text-gray-200"
            >
                <span>
                    {(!startDate && !endDate)
                        ? "mm/dd/yyyy - mm/dd/yyyy"
                        : `${renderDateBox(startDate)} - ${renderDateBox(endDate)}`
                    }
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-12 left-0 z-50 w-[320px] p-4 bg-[#22272e] border border-gray-700 rounded-xl shadow-2xl text-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold mx-auto">Ngày</span>
                        <button onClick={() => setIsOpen(false)} className="absolute right-4 text-gray-400 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center justify-between mb-4 text-sm">
                        <div className="flex gap-2">
                            <button onClick={prevYear} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">«</button>
                            <button onClick={prevMonth} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">‹</button>
                        </div>
                        <span className="font-medium">
                            {MONTHS[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                        </span>
                        <div className="flex gap-2">
                            <button onClick={nextMonth} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">›</button>
                            <button onClick={nextYear} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">»</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-y-2 mb-6 text-center text-sm">
                        {DAYS_OF_WEEK.map(day => (
                            <div key={day} className="font-medium text-gray-400">{day}</div>
                        ))}

                        {Array.from({ length: emptyDays }).map((_, i) => (
                            <div key={`empty-${i}`} className="text-gray-600"></div>
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const selected = isSelected(day);
                            const inRange = isInRange(day);

                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDayClick(day)}
                                    className={`w-8 h-8 mx-auto flex items-center justify-center rounded-md transition-colors 
                    ${selected ? 'bg-blue-600 text-white font-semibold' : ''}
                    ${inRange && !selected ? 'bg-blue-900/50 text-blue-200' : ''}
                    ${!selected && !inRange ? 'hover:bg-gray-700 text-gray-300' : ''}
                  `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    <hr className="border-gray-700 my-4" />

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-2">Từ ngày</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={!!startTimestamp}
                                    onChange={(e) => {
                                        if (!e.target.checked) {
                                            setStartTimestamp(null);
                                            setHistory(prev => prev.filter(t => t !== startTimestamp));
                                        }
                                    }}
                                    className="w-4 h-4 rounded border-gray-600 bg-transparent text-blue-500 focus:ring-0 cursor-pointer"
                                />
                                <input
                                    type="date"
                                    disabled={!startTimestamp}
                                    value={startDate ? formatDateToString(startDate) : ""}
                                    onChange={(e) => handleManualDateChange(e.target.value, 'start')}
                                    className="flex-1 px-3 py-1.5 bg-[#2d333b] border border-gray-600 rounded-md text-sm outline-none focus:border-blue-500 disabled:opacity-50"
                                />
                                <select
                                    disabled={!startTimestamp}
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-[100px] px-3 py-1.5 bg-[#2d333b] border border-gray-600 rounded-md text-sm outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer"
                                >
                                    <option value="00:00">00:00</option>
                                    <option value="08:00">08:00</option>
                                    <option value="12:00">12:00</option>
                                    <option value="21:22">21:22</option>
                                    <option value="23:59">23:59</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-2">Đến ngày</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={!!endTimestamp}
                                    onChange={(e) => {
                                        if (!e.target.checked) {
                                            setEndTimestamp(null);
                                            setHistory(prev => prev.filter(t => t !== endTimestamp));
                                        }
                                    }}
                                    className="w-4 h-4 rounded border-gray-600 bg-transparent text-blue-500 focus:ring-0 cursor-pointer"
                                />
                                <input
                                    type="date"
                                    disabled={!endTimestamp}
                                    value={endDate ? formatDateToString(endDate) : ""}
                                    onChange={(e) => handleManualDateChange(e.target.value, 'end')}
                                    className="flex-1 px-3 py-1.5 bg-[#2d333b] border border-gray-600 rounded-md text-sm outline-none focus:border-blue-500 disabled:opacity-50"
                                />
                                <select
                                    disabled={!endTimestamp}
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-[100px] px-3 py-1.5 bg-[#2d333b] border border-gray-600 rounded-md text-sm outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer"
                                >
                                    <option value="00:00">00:00</option>
                                    <option value="08:00">08:00</option>
                                    <option value="12:00">12:00</option>
                                    <option value="21:22">21:22</option>
                                    <option value="23:59">23:59</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}