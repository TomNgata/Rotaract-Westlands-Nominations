
import React, { useState, useMemo } from 'react';
import { Member, Position, PositionCategory, CandidacyResponse, Nomination } from '../types';
import { CheckCircle, ShieldCheck, Trophy } from 'lucide-react';

interface BallotBoxProps {
    currentUser: Member;
    positions: Position[];
    members: Member[];
    candidacyResponses: CandidacyResponse[];
    nominations: Nomination[];
    onVoteComplete: () => void;
}

export const BallotBox: React.FC<BallotBoxProps> = ({ currentUser, positions, members, candidacyResponses, nominations, onVoteComplete }) => {
    const [votes, setVotes] = useState<Record<string, string>>({});
    const [step, setStep] = useState<'VOTE' | 'REVIEW' | 'SUCCESS'>('VOTE');

    const candidatesByPosition = useMemo(() => {
        const map: Record<string, Member[]> = {};
        positions.forEach(pos => {
            const acceptedResponses = candidacyResponses.filter(r => r.positionId === pos.id && r.status === 'ACCEPTED');
            const candidateIds = acceptedResponses.map(r => r.memberId);
            map[pos.id] = members.filter(m => candidateIds.includes(m.id));
        });
        return map;
    }, [positions, members, candidacyResponses]);

    const handleSelect = (positionId: string, candidateId: string) => {
        setVotes(prev => ({ ...prev, [positionId]: candidateId }));
    };

    const isComplete = useMemo(() => {
        // Only require votes for positions that are NOT Unopposed and have candidates
        const relevantPositions = positions.filter(pos => {
            const candidates = candidatesByPosition[pos.id] || [];
            const acceptedCandidates = candidates;
            const activeCandidatesCount = nominations.filter(n =>
                n.positionId === pos.id &&
                n.reviewStatus === 'APPROVED' &&
                (!candidacyResponses.find(r => r.memberId === n.nomineeId && r.positionId === pos.id) ||
                    candidacyResponses.find(r => r.memberId === n.nomineeId && r.positionId === pos.id)?.status !== 'DECLINED')
            ).length;
            const isUnopposed = acceptedCandidates.length === 1 && activeCandidatesCount === 1;

            return !isUnopposed && candidates.length > 0;
        });

        return relevantPositions.every(p => votes[p.id]);
    }, [positions, votes, candidatesByPosition, nominations, candidacyResponses]);

    const renderPositionGroup = (categoryFilter: (cat: PositionCategory) => boolean) => {
        const groupPositions = positions.filter(p => categoryFilter(p.category));

        return (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
                {groupPositions.map(pos => {
                    const candidates = candidatesByPosition[pos.id] || [];

                    // Determine if Unopposed
                    const acceptedCandidates = candidates;
                    const activeCandidatesCount = nominations.filter(n =>
                        n.positionId === pos.id &&
                        n.reviewStatus === 'APPROVED' &&
                        (!candidacyResponses.find(r => r.memberId === n.nomineeId && r.positionId === pos.id) ||
                            candidacyResponses.find(r => r.memberId === n.nomineeId && r.positionId === pos.id)?.status !== 'DECLINED')
                    ).length;

                    // Strict Check: exactly 1 accepted AND total active candidates is also 1.
                    const isUnopposed = acceptedCandidates.length === 1 && activeCandidatesCount === 1;

                    return (
                        <div key={pos.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-slate-200 mb-2">{pos.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">{pos.description}</p>

                            {isUnopposed && acceptedCandidates.length > 0 ? (
                                <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                                        <Trophy size={32} />
                                    </div>
                                    <h4 className="text-xl font-bold text-white">{acceptedCandidates[0].name}</h4>
                                    <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest mt-1 mb-2">Elected Unopposed</p>
                                    <p className="text-slate-400 text-sm max-w-md">
                                        As the sole candidate accepting nomination for this position,
                                        {acceptedCandidates[0].name} is declared elected unopposed.
                                        No voting is required for this docket.
                                    </p>
                                </div>
                            ) : (
                                candidates.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {candidates.map(cand => {
                                            const isSelected = votes[pos.id] === cand.id;
                                            return (
                                                <div
                                                    key={cand.id}
                                                    onClick={() => handleSelect(pos.id, cand.id)}
                                                    className={`cursor-pointer relative flex items-center p-4 rounded-xl border-2 transition-all
                                                        ${isSelected
                                                            ? 'bg-cranberry-900/20 border-cranberry-500 shadow-lg shadow-cranberry-900/10'
                                                            : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800'}
                                                    `}
                                                >
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mr-4 shrink-0
                                                        ${isSelected ? 'bg-cranberry-600 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'}
                                                    `}>
                                                        {cand.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{cand.name}</h4>
                                                        <p className="text-xs text-slate-500">Rotary ID: {cand.rotaryId}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute top-4 right-4 text-cranberry-400">
                                                            <CheckCircle size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed text-slate-500 text-sm italic">
                                        No qualified candidates on the ballot for this position.
                                    </div>
                                )
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderReview = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
                <ShieldCheck size={48} className="mx-auto text-emerald-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Confirm Your Votes</h2>
                <p className="text-slate-400 max-w-lg mx-auto">
                    Please review your selections carefully. Once submitted, your vote is final and cannot be changed.
                </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="divide-y divide-slate-800">
                    {positions.map(p => {
                        // Calculate Unopposed status again for display
                        const activeCandidatesCount = nominations.filter(n =>
                            n.positionId === p.id &&
                            n.reviewStatus === 'APPROVED' &&
                            (!candidacyResponses.find(r => r.memberId === n.nomineeId && r.positionId === p.id) ||
                                candidacyResponses.find(r => r.memberId === n.nomineeId && r.positionId === p.id)?.status !== 'DECLINED')
                        ).length;
                        const acceptedCandidates = candidatesByPosition[p.id] || [];
                        const isUnopposed = acceptedCandidates.length === 1 && activeCandidatesCount === 1;

                        return (
                            <div key={p.id} className="p-4 flex items-center justify-between">
                                <span className="text-slate-400 font-medium w-1/3">{p.title}</span>
                                {isUnopposed ? (
                                    <span className="text-emerald-400 font-bold text-xs uppercase bg-emerald-900/20 px-2 py-1 rounded border border-emerald-900/50">
                                        Elected Unopposed
                                    </span>
                                ) : (
                                    (() => {
                                        const selectedId = votes[p.id];
                                        const selectedCand = members.find(m => m.id === selectedId);
                                        return (
                                            <span className={`font-mono text-sm ${selectedCand ? 'text-white font-bold' : 'text-slate-500 italic'}`}>
                                                {selectedCand ? selectedCand.name : 'No Selection'}
                                            </span>
                                        );
                                    })()
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <button
                    onClick={() => setStep('VOTE')}
                    className="px-6 py-2 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                    Back to Ballot
                </button>
                <button
                    onClick={() => {
                        setStep('SUCCESS');
                        onVoteComplete();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all transform active:scale-95"
                >
                    Submit Official Vote
                </button>
            </div>
        </div>
    );

    if (step === 'SUCCESS') {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
                    <CheckCircle size={48} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Vote Cast Successfully!</h2>
                <p className="text-slate-400 text-center max-w-md">
                    Thank you, {currentUser.name}. Your participation in the Rotaract Westlands Elections 2026 has been recorded.
                </p>
            </div>
        );
    }

    if (step === 'REVIEW') {
        return renderReview();
    }

    return (
        <div className="space-y-12 pb-20">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-heading font-black text-white tracking-tight">
                    Official Ballot Paper
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Please select your preferred candidate for each position below.
                    You must verify your selection before final submission.
                </p>
            </div>

            <div className="space-y-16">
                <div>
                    <h2 className="text-2xl font-bold text-cranberry-400 mb-6 border-b border-slate-800 pb-2">Executive Board</h2>
                    {renderPositionGroup(cat => cat === PositionCategory.EXECUTIVE)}
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-cranberry-400 mb-6 border-b border-slate-800 pb-2">Directors</h2>
                    {renderPositionGroup(cat => cat === PositionCategory.DIRECTOR)}
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-cranberry-400 mb-6 border-b border-slate-800 pb-2">Succession</h2>
                    {renderPositionGroup(cat => cat === PositionCategory.SUCCESSION)}
                </div>
            </div>

            <div className="sticky bottom-4 flex justify-center pt-8 pointer-events-none">
                <button
                    onClick={() => setStep('REVIEW')}
                    disabled={!isComplete}
                    className={`pointer-events-auto px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-all transform hover:-translate-y-1
                        ${isComplete
                            ? 'bg-cranberry-600 text-white shadow-cranberry-900/50 hover:bg-cranberry-500'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                    `}
                >
                    {isComplete ? 'Review Selections' : 'Complete All Selections'}
                </button>
            </div>
        </div>
    );
};
