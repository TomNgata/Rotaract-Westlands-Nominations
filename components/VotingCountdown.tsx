import React, { useState, useEffect } from 'react';
import { Timer, Calendar, AlertCircle } from 'lucide-react';
import { VOTING_SCHEDULE } from '../constants';

export const VotingCountdown: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        status: 'UPCOMING' | 'ACTIVE' | 'ENDED';
    } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const openTime = new Date(VOTING_SCHEDULE.OPEN_DATE).getTime();
            const closeTime = new Date(VOTING_SCHEDULE.CLOSE_DATE).getTime();

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
    }, []);

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
                ? 'bg-gradient-to-r from-emerald-900/40 to-slate-900 border-emerald-500/30 shadow-lg shadow-emerald-900/10'
                : 'bg-gradient-to-r from-blue-900/40 to-slate-900 border-blue-500/30 shadow-lg shadow-blue-900/10'}
        `}>
            {/* Background Icon */}
            <div className="absolute -right-4 -top-4 opacity-10">
                <Timer size={100} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border
                        ${timeLeft.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/20'}
                    `}>
                        {timeLeft.status === 'ACTIVE' ? 'Polls Open' : 'Voting Starts In'}
                    </span>
                </div>

                <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
                    {[
                        { label: 'Days', value: timeLeft.days },
                        { label: 'Hours', value: timeLeft.hours },
                        { label: 'Mins', value: timeLeft.minutes },
                        { label: 'Secs', value: timeLeft.seconds },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-full bg-slate-950/50 rounded-lg py-3 border border-slate-700/50 backdrop-blur-sm">
                                <span className={`text-2xl md:text-3xl font-mono font-bold ${timeLeft.status === 'ACTIVE' ? 'text-white' : 'text-blue-100'}`}>
                                    {String(item.value).padStart(2, '0')}
                                </span>
                            </div>
                            <span className="text-[10px] uppercase text-slate-500 font-bold mt-1 tracking-wider">{item.label}</span>
                        </div>
                    ))}
                </div>

                {timeLeft.status === 'ACTIVE' && (
                    <div className="mt-6">
                        <p className="text-emerald-400 text-sm font-medium animate-pulse">
                            Voting is live! Cast your ballot now.
                        </p>
                    </div>
                )}

                {timeLeft.status === 'UPCOMING' && (
                    <p className="mt-4 text-slate-400 text-xs flex items-center justify-center">
                        <Calendar size={12} className="mr-1" />
                        Begins Wednesday, Jan 28th at 7:00 PM
                    </p>
                )}
            </div>
        </div>
    );
};
