```
import React, { useState, useEffect } from 'react';
import { Clock, CalendarCheck, AlertCircle } from 'lucide-react';
import { ELECTION_SCHEDULE } from '../constants';

interface NominationTimerProps {
  startDate?: string;
  endDate?: string;
}

export const NominationTimer: React.FC<NominationTimerProps> = ({ startDate, endDate }) => {
  const [timeLeft, setTimeLeft] = useState('Loading...');
  const [status, setStatus] = useState<'UPCOMING' | 'ACTIVE' | 'CLOSED'>('UPCOMING');

  useEffect(() => {
    const updateTimer = () => {
      // Use props or fallback to constants
      const openDateStr = startDate || ELECTION_SCHEDULE.OPEN_DATE;
      const closeDateStr = endDate || ELECTION_SCHEDULE.CLOSE_DATE;

      const now = new Date().getTime();
      const openTime = new Date(openDateStr).getTime();
      const closeTime = new Date(closeDateStr).getTime();

            if (now < openTime) {
                setStatus('UPCOMING');
                setTimeLeft(`Opens: ${ new Date(openTime).toLocaleDateString() } `);
            } else if (now >= openTime && now < closeTime) {
                setStatus('ACTIVE');
                setLabel('Nominations Live');
            } else {
                setStatus('CLOSED');
                setLabel('Nominations Closed');
            }
        };

        checkStatus();
    }, []);

    return (
        <div className={`
inline - flex items - center space - x - 2 px - 3 py - 1.5 rounded - full text - xs font - bold uppercase tracking - wider border mb - 4
            ${
    status === 'CLOSED'
    ? 'bg-slate-100 text-slate-400 border-slate-200'
    : status === 'ACTIVE'
        ? 'bg-cranberry-50 text-cranberry-600 border-cranberry-200'
        : 'bg-blue-50 text-blue-600 border-blue-200'
}
`}>
            {status === 'CLOSED' ? <CalendarCheck size={14} /> : <Clock size={14} />}
            <span>{label}</span>
            {status === 'CLOSED' && (
                <span className="hidden sm:inline text-[10px] normal-case opacity-75 border-l border-slate-300 pl-2 ml-1">
                    Ended {new Date(ELECTION_SCHEDULE.CLOSE_DATE).toLocaleDateString()}
                </span>
            )}
        </div>
    );
};
