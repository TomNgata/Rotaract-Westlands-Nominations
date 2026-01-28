
import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { DashboardOverview } from './components/DashboardOverview';
import { NominationForm } from './components/NominationForm';
import { CommitteePortal } from './components/CommitteePortal';
import { MyCandidacy } from './components/MyCandidacy';
import { POSITIONS, MOCK_MEMBERS, ELECTION_SCHEDULE } from './constants';
import { Nomination, Member, CandidacyResponse, Vote } from './types';
import { BallotBox } from './components/BallotBox';
import { TallyingStation } from './components/TallyingStation';
import { CheckCircle } from 'lucide-react';

import { supabase } from './services/supabaseClient';
import { SpeedInsights } from "@vercel/speed-insights/react"

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [candidacyResponses, setCandidacyResponses] = useState<CandidacyResponse[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showNominationModal, setShowNominationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch Members
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*');

        if (membersError) throw membersError;

        const mappedMembers: Member[] = (membersData || []).map(m => ({
          id: m.id,
          name: m.full_name,
          rotaryId: m.rotary_id,
          email: m.email || '',
          phone: m.phone_number || '',
          isGoodStanding: m.is_good_standing,
          role: m.role as any
        }));
        setMembers(mappedMembers);

        // Fetch Nominations
        const { data: nomsData, error: nomsError } = await supabase
          .from('nominations')
          .select('*');

        if (nomsError) throw nomsError;

        const mappedNoms: Nomination[] = (nomsData || []).map(n => ({
          id: n.id,
          nominatorId: n.nominator_id,
          nomineeId: n.nominee_id,
          positionId: n.position_id,
          statement: n.statement,
          timestamp: new Date(n.created_at).getTime(),
          isSelfNomination: n.is_self_nomination,
          reviewStatus: n.review_status as any
        }));
        setNominations(mappedNoms);

        // Fetch Candidacy Responses
        const { data: respData, error: respError } = await supabase
          .from('candidacy_responses')
          .select('*');

        if (respError) {
          console.log("Candidacy responses table might not exist yet", respError);
        } else {
          setCandidacyResponses(respData.map(r => ({
            id: r.id,
            memberId: r.member_id,
            positionId: r.position_id,
            status: r.status as any,
            timestamp: new Date(r.created_at).getTime()
          })));
        }

        // Fetch Votes
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('*');

        if (votesError) {
          console.log("Votes table might not exist yet", votesError);
        } else {
          setVotes(votesData.map(v => ({
            id: v.id,
            voterId: v.voter_id,
            positionId: v.position_id,
            candidateId: v.candidate_id,
            timestamp: new Date(v.created_at).getTime()
          })));
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogin = (user: Member) => {
    setCurrentUser(user);
    setActiveTab('overview');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('overview');
  };

  const handleAddNomination = useCallback(async (newNom: Partial<Nomination>) => {
    const now = new Date().getTime();
    const closeTime = new Date(ELECTION_SCHEDULE.CLOSE_DATE).getTime();
    const openTime = new Date(ELECTION_SCHEDULE.OPEN_DATE).getTime();

    if (now < openTime) {
      alert("Nominations have not opened yet.");
      return;
    }

    if (now > closeTime) {
      alert("Nominations are officially closed.");
      return;
    }

    if (!currentUser) return;

    try {
      const dbNomination = {
        nominator_id: currentUser.id,
        nominee_id: newNom.nomineeId,
        position_id: newNom.positionId,
        statement: newNom.statement,
        is_self_nomination: newNom.isSelfNomination,
        review_status: 'PENDING'
      };

      const { data, error } = await supabase
        .from('nominations')
        .insert(dbNomination)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const mappedNom: Nomination = {
          id: data.id,
          nominatorId: data.nominator_id,
          nomineeId: data.nominee_id,
          positionId: data.position_id,
          statement: data.statement,
          timestamp: new Date(data.created_at).getTime(),
          isSelfNomination: data.is_self_nomination,
          reviewStatus: data.review_status as any
        };
        setNominations(prev => [...prev, mappedNom]);
      }
    } catch (error) {
      console.error("Error submitting nomination:", error);
      alert("Failed to submit nomination. Please try again.");
    }
  }, [currentUser]);

  const handleReviewNomination = useCallback(async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const { error } = await supabase
        .from('nominations')
        .update({ review_status: status })
        .eq('id', id);

      if (error) throw error;

      setNominations(prev => prev.map(n => n.id === id ? { ...n, reviewStatus: status } : n));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
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
            members={members}
            onAddNomination={() => setShowNominationModal(true)}
          />
        );
      case 'nominations':
        const myNoms = nominations.filter(n => n.nominatorId === currentUser.id);
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-slate-100">My Submissions</h2>
            {myNoms.length === 0 ? (
              <div className="text-center py-20 bg-slate-900 rounded-xl border border-dashed border-slate-800">
                <p className="text-slate-500 mb-6">You haven't submitted any nominations yet.</p>
                <button
                  onClick={() => setShowNominationModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-all"
                >
                  Submit Your First Nomination
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {myNoms.map(n => {
                  const nominee = members.find(m => m.id === n.nomineeId);
                  const pos = POSITIONS.find(p => p.id === n.positionId);
                  return (
                    <div key={n.id} className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex justify-between items-center group hover:border-slate-700 transition-all">
                      <div>
                        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">{pos?.title}</div>
                        <h4 className="text-lg font-bold text-slate-100">{nominee?.name}</h4>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${n.reviewStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                            n.reviewStatus === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                              'bg-amber-500/10 text-amber-400'
                            }`}>
                            {n.reviewStatus}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 italic mt-4 max-w-lg">"{n.statement || 'No statement provided'}"</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-mono">SUBMITTED: {new Date(n.timestamp).toLocaleDateString()}</div>
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
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-slate-100">Candidate Pool</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map(m => {
                const count = candidateMap[m.id] || 0;
                const isQualified = count >= 2;
                return (
                  <div key={m.id} className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden group hover:border-slate-700 transition-all">
                    <div className="h-24 bg-gradient-to-br from-blue-900/40 to-slate-900 relative border-b border-slate-800">
                      <div className="absolute -bottom-6 left-6 w-16 h-16 bg-slate-900 rounded-full p-1 shadow-xl border border-slate-800">
                        <div className="w-full h-full bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-xl border border-blue-500/20">
                          {m.name.charAt(0)}
                        </div>
                      </div>
                    </div>
                    <div className="pt-8 p-6 space-y-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{m.name}</h4>
                        <p className="text-xs text-slate-500 font-mono tracking-tight">ID: {m.rotaryId}</p>
                      </div>
                      <div className="flex items-center justify-between py-3 border-y border-slate-800/50">
                        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Approved Noms</div>
                        <div className={`font-mono font-bold text-lg ${isQualified ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {count}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${isQualified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                          {isQualified ? 'Election Ready' : 'Pending Minimum'}
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
        if (currentUser.role !== 'COMMITTEE') return <div className="p-10 text-center text-red-400 font-bold">Unauthorized Access</div>;
        return (
          <CommitteePortal
            nominations={nominations}
            members={members}
            positions={POSITIONS}
            onReview={handleReviewNomination}
            candidacyResponses={candidacyResponses}
          />
        );
      case 'candidacy':
        return (
          <MyCandidacy
            currentUser={currentUser}
            nominations={nominations}
            positions={POSITIONS}
            members={members}
          />
        );
      case 'vote':
        const hasVoted = votes.some(v => v.voterId === currentUser.id);

        if (hasVoted) {
          return (
            <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
              <div className="bg-emerald-900/20 p-8 rounded-full mb-6">
                <CheckCircle className="text-emerald-500" size={64} />
              </div>
              <h2 className="text-3xl font-bold text-slate-100 mb-2">Vote Cast Successfully</h2>
              <p className="text-slate-400 max-w-md text-center">
                Thank you for participating in the 2026 Elections. Your digital ballot has been securely recorded.
              </p>
              <div className="mt-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-blue-400 hover:text-blue-300 font-bold underline decoration-blue-500/30"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          );
        }

        return (
          <BallotBox
            currentUser={currentUser}
            positions={POSITIONS}
            members={members}
            candidacyResponses={candidacyResponses}
            onVoteComplete={() => {
              // Re-fetch votes or optimistic update
              alert("Vote submitted successfully!");
              window.location.reload(); // Simple reload to refresh state and show success screen
            }}
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
      <SpeedInsights />
      {renderContent()}

      {showNominationModal && (
        <NominationForm
          onClose={() => setShowNominationModal(false)}
          members={members}
          positions={POSITIONS}
          currentUser={currentUser}
          onSubmit={handleAddNomination}
        />
      )}
    </Layout>
  );
}
