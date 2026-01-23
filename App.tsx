
import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { DashboardOverview } from './components/DashboardOverview';
import { NominationForm } from './components/NominationForm';
import { CommitteePortal } from './components/CommitteePortal';
import { POSITIONS, MOCK_MEMBERS } from './constants';
import { Nomination, Member } from './types';

// Initial state for demonstration
const INITIAL_NOMINATIONS: Nomination[] = [
  { id: 'n1', nominatorId: 'm2', nomineeId: 'm1', positionId: 'sec', timestamp: Date.now() - 86400000, isSelfNomination: false, reviewStatus: 'APPROVED' },
  { id: 'n2', nominatorId: 'm3', nomineeId: 'm1', positionId: 'sec', timestamp: Date.now() - 43200000, isSelfNomination: false, reviewStatus: 'PENDING' },
  { id: 'n3', nominatorId: 'm4', nomineeId: 'm2', positionId: 'trs', timestamp: Date.now() - 100000, isSelfNomination: false, reviewStatus: 'APPROVED' },
  { id: 'n4', nominatorId: 'm5', nomineeId: 'm2', positionId: 'trs', timestamp: Date.now() - 50000, isSelfNomination: false, reviewStatus: 'PENDING' },
  { id: 'n5', nominatorId: 'm1', nomineeId: 'm3', positionId: 'pn', timestamp: Date.now() - 10000, isSelfNomination: false, reviewStatus: 'PENDING' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [nominations, setNominations] = useState<Nomination[]>(INITIAL_NOMINATIONS);
  const [showNominationModal, setShowNominationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);

  const handleLogin = (user: Member) => {
    setCurrentUser(user);
    setActiveTab('overview');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('overview');
  };

  const handleAddNomination = useCallback((newNom: Partial<Nomination>) => {
    if (!currentUser) return;
    
    const nomination: Nomination = {
      ...newNom,
      id: `n-${Date.now()}`,
      nominatorId: currentUser.id,
      timestamp: Date.now(),
      reviewStatus: 'PENDING',
    } as Nomination;

    setNominations(prev => [...prev, nomination]);
    setShowNominationModal(false);
    console.log('Nomination added optimistically');
  }, [currentUser]);

  const handleReviewNomination = useCallback((id: string, status: 'APPROVED' | 'REJECTED') => {
    setNominations(prev => prev.map(n => n.id === id ? { ...n, reviewStatus: status } : n));
  }, []);

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview 
            nominations={nominations} 
            positions={POSITIONS} 
            members={MOCK_MEMBERS} 
            onAddNomination={() => setShowNominationModal(true)}
          />
        );
      case 'nominations':
        const myNoms = nominations.filter(n => n.nominatorId === currentUser.id);
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Submissions</h2>
            {myNoms.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 mb-4">You haven't submitted any nominations yet.</p>
                <button onClick={() => setShowNominationModal(true)} className="text-blue-600 font-semibold hover:underline">Start Nominating</button>
              </div>
            ) : (
              <div className="grid gap-4">
                {myNoms.map(n => {
                  const nominee = MOCK_MEMBERS.find(m => m.id === n.nomineeId);
                  const pos = POSITIONS.find(p => p.id === n.positionId);
                  return (
                    <div key={n.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-blue-600 uppercase mb-1">{pos?.title}</div>
                        <h4 className="text-lg font-bold text-gray-900">{nominee?.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            n.reviewStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                            n.reviewStatus === 'REJECTED' ? 'bg-red-50 text-red-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {n.reviewStatus}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 italic mt-3">"{n.statement || 'No statement provided'}"</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-medium">Submitted {new Date(n.timestamp).toLocaleDateString()}</div>
                        {n.reviewStatus === 'PENDING' && (
                          <button className="text-red-500 text-xs font-semibold hover:underline mt-2">Withdraw</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case 'candidates':
        const candidateMap: Record<string, number> = {};
        nominations.filter(n => n.reviewStatus === 'APPROVED').forEach(n => {
          candidateMap[n.nomineeId] = (candidateMap[n.nomineeId] || 0) + 1;
        });

        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Current Candidate Pool</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_MEMBERS.map(m => {
                const count = candidateMap[m.id] || 0;
                const isQualified = count >= 2;
                return (
                  <div key={m.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                    <div className="h-24 bg-gradient-to-br from-blue-500 to-blue-700 relative">
                       <div className="absolute -bottom-6 left-6 w-16 h-16 bg-white rounded-full p-1 shadow-md">
                          <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                            {m.name.charAt(0)}
                          </div>
                       </div>
                    </div>
                    <div className="pt-8 p-6 space-y-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{m.name}</h4>
                        <p className="text-xs text-gray-400 font-mono">Rotary ID: {m.rotaryId}</p>
                      </div>
                      <div className="flex items-center justify-between py-3 border-y border-gray-50">
                        <div className="text-xs text-gray-500 font-medium">Approved Noms</div>
                        <div className={`font-mono font-bold ${isQualified ? 'text-emerald-600' : 'text-amber-500'}`}>
                          {count}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isQualified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {isQualified ? 'Election Ready' : 'Pending Min Noms'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'administration':
        if (currentUser.role !== 'COMMITTEE') return <div className="p-10 text-center text-red-500 font-bold">Unauthorized Access</div>;
        return (
          <CommitteePortal 
            nominations={nominations}
            members={MOCK_MEMBERS}
            positions={POSITIONS}
            onReview={handleReviewNomination}
          />
        );
      default:
        return <div>Tab not implemented.</div>;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {renderContent()}
      
      {showNominationModal && (
        <NominationForm 
          onClose={() => setShowNominationModal(false)}
          members={MOCK_MEMBERS}
          positions={POSITIONS}
          currentUser={currentUser}
          onSubmit={handleAddNomination}
        />
      )}
    </Layout>
  );
}
