
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
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <ShieldAlert size={24} className="mr-2 text-blue-600" />
            Elections Committee Portal
          </h2>
          <p className="text-sm text-gray-500">Restricted access: Review and validate all club nominations.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search nominee or nominator..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-400" />
          <select 
            className="text-sm border-none focus:ring-0 bg-transparent font-medium text-gray-600 cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="ALL">All Nominations</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Nominations Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider font-semibold border-b border-gray-100">
                <th className="px-6 py-4">Nominee / Position</th>
                <th className="px-6 py-4">Nominator</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredNominations.map(n => {
                const nominee = members.find(m => m.id === n.nomineeId);
                const nominator = members.find(m => m.id === n.nominatorId);
                const pos = positions.find(p => p.id === n.positionId);
                
                return (
                  <tr key={n.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{nominee?.name}</div>
                      <div className="text-xs text-blue-600 font-medium uppercase tracking-tight">{pos?.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{nominator?.name}</div>
                      <div className="text-[10px] text-gray-400">{n.isSelfNomination ? 'Self-Nominated' : 'External'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        n.reviewStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                        n.reviewStatus === 'REJECTED' ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {n.reviewStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                      {new Date(n.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {n.reviewStatus === 'PENDING' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => onReview(n.id, 'APPROVED')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => onReview(n.id, 'REJECTED')}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredNominations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm italic">
                    No nominations match your current criteria.
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
