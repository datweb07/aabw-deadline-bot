"use client";
import React, { useState, useEffect } from "react";
import { Timer } from "lucide-react";

// Hạn chót nộp bài: 09:00 sáng ngày 12/07/2026 (UTC+7)
const SUBMISSION_DEADLINE = new Date("2026-07-12T09:00:00+07:00").getTime();

// Component vẽ ra từng ô thẻ lật (Split Card Design)
const FlipCard = ({ value, label, isSec }: { value: number; label: string; isSec?: boolean }) => {
    const formattedValue = value.toString().padStart(2, "0");

    return (
        <div className="flex flex-col items-center">
            {/* Khối thẻ số */}
            <div className="relative bg-gradient-to-b from-gray-800 to-gray-950 rounded-lg w-12 h-16 sm:w-14 sm:h-16 flex items-center justify-center border border-gray-700 shadow-[0_8px_16px_rgba(0,0,0,0.4)] overflow-hidden">
                {/* Đường cắt ngang chia đôi thẻ tạo hiệu ứng cơ học */}
                <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-black/80 z-10 shadow-sm" />

                {/* Lớp mờ bóng râm ở nửa trên của thẻ lật */}
                <div className="absolute top-0 left-0 right-0 bottom-1/2 bg-black/10 z-0" />

                <span className={`relative text-3xl font-extrabold font-mono z-0 tracking-tighter ${isSec ? "text-green-400" : "text-white"}`}>
                    {formattedValue}
                </span>
            </div>
            <span className="text-[10px] text-gray-500 mt-2 font-bold tracking-widest uppercase">
                {label}
            </span>
        </div>
    );
};

export default function FlipTimer() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = SUBMISSION_DEADLINE - now;

            if (distance <= 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            } else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!isClient) return null; // Tránh lỗi Hydration của Next.js

    return (
        <div className="shrink-0 bg-[#0f172a] rounded-2xl p-5 shadow-2xl border border-gray-800 w-full md:w-auto relative overflow-hidden group">
            {/* Hiệu ứng tia sáng chạy ngang khi hover */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Timer className="h-4 w-4 text-green-400 animate-pulse" />
                <p className="text-xs font-bold text-green-400 uppercase tracking-wider">
                    Final Submission Deadline
                </p>
            </div>

            <div className="flex gap-3 sm:gap-4 justify-center">
                <FlipCard value={timeLeft.days} label="Days" />
                <FlipCard value={timeLeft.hours} label="Hours" />
                <FlipCard value={timeLeft.minutes} label="Mins" />
                <FlipCard value={timeLeft.seconds} label="Secs" isSec />
            </div>
        </div>
    );
}