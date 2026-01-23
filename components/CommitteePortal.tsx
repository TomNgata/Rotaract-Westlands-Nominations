
import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  MoreVertical,
  Search,
  Filter,
  Download,
  ShieldAlert
} from 'lucide-react';
import { Nomination, Member, Position } from '../types';

interface CommitteePortalProps {
  nominations: Nomination[];
  members: Member[];
  positions: Position[];
  onReview: (nominationId: string, status: 'APPROVED' | 'REJECTED') => void;
}

export const CommitteePortal: React.FC<CommitteePortalProps> = ({ nominations, members, positions, onReview }) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');

  const filteredNominations = nominations.filter(n => {
    const nominee = members.find(m => m.id === n.nomineeId);
    const nominator = members.find(m => m.id === n.nominatorId);
    const matchesSearch =
      nominee?.name.toLowerCase().includes(search.toLowerCase()) ||
      nominator?.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || n.reviewStatus === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center">
            <ShieldAlert size={24} className="mr-2 text-blue-500" />
            Committee Portal
          </h2>
          <p className="text-sm text-slate-400 font-medium">Review and validate all club nominations.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button disabled className="flex items-center space-x-2 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed transition-colors">
            <Download size={16} />
            <span>Export Registry</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search nominee or nominator..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm text-slate-200 placeholder:text-slate-600 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 px-3 border border-slate-800 rounded-lg bg-slate-950">
          <Filter size={16} className="text-slate-500" />
          <select
            className="text-sm border-none focus:ring-0 bg-transparent font-medium text-slate-400 cursor-pointer py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="ALL">All Entries</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Nominations Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-500 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <th className="px-6 py-4">Nominee / Position</th>
                <th className="px-6 py-4">Nominator</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredNominations.map(n => {
                const nominee = members.find(m => m.id === n.nomineeId);
                const nominator = members.find(m => m.id === n.nominatorId);
                const pos = positions.find(p => p.id === n.positionId);

                return (
                  <tr key={n.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-200">{nominee?.name}</div>
                      <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{pos?.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-400 font-medium">{nominator?.name}</div>
                      <div className="text-[10px] text-slate-600 font-semibold">{n.isSelfNomination ? 'SELF' : 'MEMBER'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${n.reviewStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                          n.reviewStatus === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                            'bg-amber-500/10 text-amber-400'
                        }`}>
                        {n.reviewStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {new Date(n.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {n.reviewStatus === 'PENDING' ? (
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onReview(n.id, 'APPROVED')}
                            className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => onReview(n.id, 'REJECTED')}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <button className="p-2 text-slate-600 hover:bg-slate-800 rounded-lg transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredNominations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm italic">
                    No records found for the current selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
