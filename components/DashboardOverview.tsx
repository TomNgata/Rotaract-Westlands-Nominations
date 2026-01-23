
import React, { useMemo, useEffect, useState } from 'react';
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
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { Nomination, Position, Member, DashboardStats } from '../types';
import { geminiService } from '../services/geminiService';

interface DashboardOverviewProps {
  nominations: Nomination[];
  positions: Position[];
  members: Member[];
  onAddNomination: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; trend?: string; colorClass: string; iconBg: string }> = ({ title, value, icon, trend, colorClass, iconBg }) => (
  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
        {trend && (
          <p className="text-xs mt-1 flex items-center text-emerald-400 font-medium">
            <ArrowUpRight size={14} className="mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${iconBg}`}>
        {icon}
      </div>
    </div>
  </div>
);

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ nominations, positions, members, onAddNomination }) => {
  const [aiInsights, setAiInsights] = useState<string>('Analyzing current nomination data...');
  const [isInsightLoading, setIsInsightLoading] = useState(true);

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

  useEffect(() => {
    const fetchInsights = async () => {
      setIsInsightLoading(true);
      const insights = await geminiService.getDashboardInsights(nominations, positions, members);
      setAiInsights(insights || 'No insights available.');
      setIsInsightLoading(false);
    };
    fetchInsights();
  }, [nominations, positions, members]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Dashboard Overview</h2>
          <p className="text-sm text-slate-400">Real-time status of RY 2026/2027 board nominations.</p>
        </div>
        <button 
          onClick={onAddNomination}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20 inline-flex items-center justify-center space-x-2 active:scale-[0.98]"
        >
          <span>Submit a Nomination</span>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Nominations" 
          value={stats.totalNominations} 
          icon={<Trophy size={20} className="text-blue-400" />} 
          trend="+12% from yesterday"
          colorClass="text-blue-400"
          iconBg="bg-blue-500/10"
        />
        <StatCard 
          title="Participation Rate" 
          value={`${stats.participationRate}%`} 
          icon={<Users size={20} className="text-purple-400" />} 
          colorClass="text-purple-400"
          iconBg="bg-purple-500/10"
        />
        <StatCard 
          title="Qualified Candidates" 
          value={stats.qualifiedCandidates} 
          icon={<CheckCircle2 size={20} className="text-emerald-400" />} 
          colorClass="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <StatCard 
          title="Days Remaining" 
          value="4" 
          icon={<Clock size={20} className="text-amber-400" />} 
          colorClass="text-amber-400"
          iconBg="bg-amber-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-100">Nominations by Position</h3>
            <div className="text-xs text-slate-500">Target: Minimum 2 per position</div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.count < 2 ? '#f43f5e' : '#3b82f6'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb size={20} className="text-amber-400" />
            <h3 className="font-semibold text-slate-100">AI Committee Insights</h3>
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            {isInsightLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                <div className="h-4 bg-slate-800 rounded w-4/6"></div>
                <div className="h-4 bg-slate-800 rounded w-full"></div>
              </div>
            ) : (
              <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
                {aiInsights}
              </div>
            )}
          </div>
          <div className="mt-6 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10 flex items-start space-x-3">
            <AlertTriangle size={18} className="text-blue-400 mt-0.5" />
            <p className="text-[11px] text-blue-300">
              Note: This analysis is based on bylaws Clause 2.4. Final decisions rest with the Elections Committee Chair.
            </p>
          </div>
        </div>
      </div>

      {/* Position Tracker Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-semibold text-slate-100">Position Status Tracker</h3>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full uppercase tracking-wide font-medium">Auto-Validated</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-500 text-[10px] uppercase tracking-wider font-semibold">
                <th className="px-6 py-3">Position</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Noms</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {positions.map(p => {
                const count = nominations.filter(n => n.positionId === p.id).length;
                const isCritical = count < 2;
                return (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-200">{p.title}</div>
                      <div className="text-xs text-slate-500">{p.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded capitalize border border-slate-700">
                        {p.category.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-300">{count}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        isCritical ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {isCritical ? 'Critical' : 'Safe'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">View Noms</button>
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
