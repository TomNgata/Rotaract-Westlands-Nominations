
import React, { useMemo, useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell 
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

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; trend?: string; color: string }> = ({ title, value, icon, trend, color }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {trend && (
          <p className="text-xs mt-1 flex items-center text-green-600 font-medium">
            <ArrowUpRight size={14} className="mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
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
    
    // Count qualified (>=2 noms)
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-500">Real-time status of RY 2026/2027 board nominations.</p>
        </div>
        <button 
          onClick={onAddNomination}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm inline-flex items-center justify-center space-x-2"
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
          icon={<Trophy size={20} className="text-blue-600" />} 
          trend="+12% from yesterday"
          color="bg-blue-50"
        />
        <StatCard 
          title="Participation Rate" 
          value={`${stats.participationRate}%`} 
          icon={<Users size={20} className="text-purple-600" />} 
          color="bg-purple-50"
        />
        <StatCard 
          title="Qualified Candidates" 
          value={stats.qualifiedCandidates} 
          icon={<CheckCircle2 size={20} className="text-emerald-600" />} 
          color="bg-emerald-50"
        />
        <StatCard 
          title="Days Remaining" 
          value="4" 
          icon={<Clock size={20} className="text-amber-600" />} 
          color="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Nominations by Position</h3>
            <div className="text-xs text-gray-400">Target: Minimum 2 per position</div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.count < 2 ? '#f87171' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb size={20} className="text-amber-500" />
            <h3 className="font-semibold text-gray-900">AI Committee Insights</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isInsightLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {aiInsights}
              </div>
            )}
          </div>
          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start space-x-3">
            <AlertTriangle size={18} className="text-blue-600 mt-0.5" />
            <p className="text-[11px] text-blue-700">
              Note: This analysis is based on bylaws Clause 2.4. Final decisions rest with the Elections Committee Chair.
            </p>
          </div>
        </div>
      </div>

      {/* Critical Status Table (Summary) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Position Status Tracker</h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase tracking-wide font-medium">Auto-Validated</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider font-semibold">
                <th className="px-6 py-3">Position</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Noms</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {positions.map(p => {
                const count = nominations.filter(n => n.positionId === p.id).length;
                const isCritical = count < 2;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{p.title}</div>
                      <div className="text-xs text-gray-400">{p.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded capitalize">
                        {p.category.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">{count}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        isCritical ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {isCritical ? 'Critical' : 'Safe'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Noms</button>
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
