import React, { useState, useEffect } from 'react';
import { Timer, Calendar, AlertCircle } from 'lucide-react';
import { VOTING_SCHEDULE } from '../constants';

interface VotingCountdownProps {
    startDate?: string;
    endDate?: string;
}

export const VotingCountdown: React.FC<VotingCountdownProps> = ({ startDate, endDate }) => {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        status: 'UPCOMING' | 'ACTIVE' | 'ENDED';
    } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            // Use props or fallback to constants
            const openDateStr = startDate || VOTING_SCHEDULE.OPEN_DATE;
            const closeDateStr = endDate || VOTING_SCHEDULE.CLOSE_DATE;

            const now = new Date().getTime();
            const openTime = new Date(openDateStr).getTime();
            const closeTime = new Date(closeDateStr).getTime();

            let targetTime = openTime;
            let currentStatus: 'UPCOMING' | 'ACTIVE' | 'ENDED' = 'UPCOMING';

            if (now >= openTime && now < closeTime) {
                targetTime = closeTime;
                currentStatus = 'ACTIVE';
            } else if (now >= closeTime) {
                currentStatus = 'ENDED';
                return { days: 0, hours: 0, minutes: 0, seconds: 0, status: 'ENDED' };
            }

            const difference = targetTime - now;

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                    status: currentStatus
                };
            } else {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, status: 'ENDED' };
            }
        };

        // Initial set
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [startDate, endDate]);

    if (!timeLeft) return null;

    if (timeLeft.status === 'ENDED') {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-center space-x-4">
                <AlertCircle className="text-slate-500" size={24} />
                <div>
                    <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm">Voting Period</h3>
                    <p className="text-xl font-bold text-slate-200">Election Closed</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`
             relative overflow-hidden rounded-xl border p-6 text-center animate-in fade-in zoom-in duration-500
             ${timeLeft.status === 'ACTIVE'
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 border-emerald-600 shadow-lg shadow-emerald-900/10'
                : 'bg-gradient-to-br from-amber-300 to-amber-500 border-amber-400 shadow-xl shadow-amber-500/20'}
        `}>
            {/* Background Icon */}
            <div className="absolute -right-8 -top-8 opacity-20 rotate-12">
                <Timer size={140} className="text-white mix-blend-overlay" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border shadow-sm
                        ${timeLeft.status === 'ACTIVE'
                            ? 'bg-white text-emerald-600 border-white/50'
                            : 'bg-cranberry-700 text-white border-white/20'}
                    `}>
                        {timeLeft.status === 'ACTIVE' ? 'Polls Open' : 'Voting Starts In'}
                    </span>
                </div>

                <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
                    {[
                        { label: 'Days', value: timeLeft.days },
                        { label: 'Hours', value: timeLeft.hours },
                        { label: 'Mins', value: timeLeft.minutes },
                        { label: 'Secs', value: timeLeft.seconds },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-full bg-white/90 rounded-xl py-3 border border-white/50 backdrop-blur-sm shadow-inner relative overflow-hidden group">
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-50 transition-opacity"></div>
                                <span className={`text-3xl md:text-3xl font-mono font-bold tracking-tight
                                    ${timeLeft.status === 'ACTIVE' ? 'text-emerald-700' : 'text-cranberry-800'}
                                `}>
                                    {String(item.value).padStart(2, '0')}
                                </span>
                            </div>
                            <span className={`text-[10px] uppercase font-bold mt-2 tracking-widest ${timeLeft.status === 'ACTIVE' ? 'text-emerald-900' : 'text-amber-950'}`}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>

                {timeLeft.status === 'ACTIVE' && (
                    <div className="mt-6">
                        <p className="text-white text-sm font-bold animate-pulse drop-shadow-md bg-emerald-600/30 py-1 px-3 rounded-full inline-block">
                            Voting is Live!
                        </p>
                    </div>
                )}

                {timeLeft.status === 'UPCOMING' && (
                    <p className="mt-5 text-cranberry-900 text-xs font-bold flex items-center justify-center opacity-80">
                        <Calendar size={14} className="mr-1.5" />
                        Begins {new Date(startDate || VOTING_SCHEDULE.OPEN_DATE).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                    </p>
                )}
            </div>
        </div>
    );
};
