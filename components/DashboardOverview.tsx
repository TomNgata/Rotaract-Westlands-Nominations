
import React, { useMemo, useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Trophy,
  Users,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  AlertTriangle
} from 'lucide-react';
import { Nomination, Position, Member, DashboardStats } from '../types';
import { ELECTION_SCHEDULE } from '../constants';

interface DashboardOverviewProps {
  nominations: Nomination[];
  positions: Position[];
  members: Member[];
  onAddNomination: () => void;
}


const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; trend?: string; colorClass: string; iconBg: string }> = ({ title, value, icon, trend, colorClass, iconBg }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-cranberry-200 transition-all flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-2">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <div className={`p-2 rounded-lg ${iconBg.replace('bg-slate-900', 'bg-slate-50')}`}>
        {icon}
      </div>
    </div>
    <div>
      <h3 className="text-3xl font-heading font-bold text-slate-900">{value}</h3>
      {trend && (
        <p className="text-[10px] mt-1 flex items-center text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
          <ArrowUpRight size={12} className="mr-1" />
          {trend}
        </p>
      )}
    </div>
  </div>
);

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ nominations, positions, members, onAddNomination }) => {
  const [timeLeft, setTimeLeft] = useState('Loading...');
  const [timerStatus, setTimerStatus] = useState<'UPCOMING' | 'ACTIVE' | 'CLOSED'>('UPCOMING');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const openTime = new Date(ELECTION_SCHEDULE.OPEN_DATE).getTime();
      const closeTime = new Date(ELECTION_SCHEDULE.CLOSE_DATE).getTime();

      let targetTime = openTime;
      let status: 'UPCOMING' | 'ACTIVE' | 'CLOSED' = 'UPCOMING';

      if (now < openTime) {
        status = 'UPCOMING';
        targetTime = openTime;
      } else if (now >= openTime && now < closeTime) {
        status = 'ACTIVE';
        targetTime = closeTime;
      } else {
        status = 'CLOSED';
        setTimeLeft('Nominations Closed');
        setTimerStatus('CLOSED');
        return;
      }

      setTimerStatus(status);

      const distance = targetTime - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer(); // Initial call

    return () => clearInterval(interval);
  }, []);

  const stats: DashboardStats = useMemo(() => {
    const totalMembers = members.length;
    const totalNominations = nominations.length;
    const uniqueNominators = new Set(nominations.map(n => n.nominatorId)).size;

    const nomCountMap: Record<string, Set<string>> = {};
    nominations.forEach(n => {
      if (!nomCountMap[n.nomineeId]) nomCountMap[n.nomineeId] = new Set();
      nomCountMap[n.nomineeId].add(n.nominatorId);
    });

    const qualifiedCandidates = Object.values(nomCountMap).filter(set => set.size >= 2).length;

    return {
      totalMembers,
      totalNominations,
      participationRate: Math.round((uniqueNominators / totalMembers) * 100),
      qualifiedCandidates
    };
  }, [nominations, members]);

  const chartData = useMemo(() => {
    return positions.map(p => {
      const count = nominations.filter(n => n.positionId === p.id).length;
      return { name: p.title, count };
    });
  }, [nominations, positions]);



  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-body">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-heading font-bold italic text-cranberry-600">Dashboard Overview</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">Real-time status of the Rotary Year 2026/2027 board nominations process.</p>
        </div>
        <button
          onClick={onAddNomination}
          className="bg-cranberry-600 hover:bg-cranberry-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg shadow-cranberry-900/20 inline-flex items-center justify-center space-x-2 active:scale-[0.98] group"
        >
          <span>Submit Nomination</span>
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Nominations"
          value={stats.totalNominations}
          icon={<Trophy size={20} className="text-cranberry-600" />}
          trend="+12% from yesterday"
          colorClass="text-cranberry-600"
          iconBg="bg-cranberry-50"
        />
        <StatCard
          title="Participation Rate"
          value={`${stats.participationRate}%`}
          icon={<Users size={20} className="text-blue-600" />}
          colorClass="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Qualified Candidates"
          value={stats.qualifiedCandidates}
          icon={<CheckCircle2 size={20} className="text-emerald-600" />}
          colorClass="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title={timerStatus === 'UPCOMING' ? "Nominations Open In" : timerStatus === 'ACTIVE' ? "Time Remaining" : "Status"}
          value={timeLeft}
          icon={<Clock size={20} className={timerStatus === 'ACTIVE' ? "text-emerald-600" : "text-amber-600"} />}
          colorClass={timerStatus === 'ACTIVE' ? "text-emerald-600" : "text-amber-600"}
          iconBg={timerStatus === 'ACTIVE' ? "bg-emerald-50" : "bg-amber-50"}
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Main Chart */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">Nominations by Position</h3>
              <p className="text-xs text-slate-500 mt-1">Target: Minimum 2 per position</p>
            </div>
            <div className="flex space-x-4 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center"><div className="w-3 h-3 bg-cranberry-500 rounded-sm mr-2"></div>Safe</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-slate-300 rounded-sm mr-2"></div>Critical</div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.count < 2 ? '#cbd5e1' : '#D41B5C'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>


      </div>

      {/* Position Tracker Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900">Position Status Tracker</h3>
            <p className="text-xs text-slate-500">Live monitoring of all open roles</p>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-widest font-bold border border-emerald-100">
            System Active
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="px-8 py-4">Position</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Current Noms</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {positions.map(p => {
                const count = nominations.filter(n => n.positionId === p.id).length;
                const isCritical = count < 2;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold text-slate-800">{p.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{p.description}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] px-2.5 py-1 bg-white text-slate-500 rounded-md font-bold uppercase tracking-wider border border-slate-200 shadow-sm">
                        {p.category.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-bold text-slate-700">{count}</span>
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isCritical ? 'bg-amber-400' : 'bg-cranberry-500'}`}
                            style={{ width: `${Math.min((count / 2) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${isCritical ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                        {isCritical ? <AlertTriangle size={10} className="mr-1.5" /> : <CheckCircle2 size={10} className="mr-1.5" />}
                        {isCritical ? 'Needs Noms' : 'Qualified'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-cranberry-600 hover:text-cranberry-800 text-xs font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        View Details &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
