
import React, { useState } from 'react';
import { X, Search, Info, CheckCircle } from 'lucide-react';
import { Member, Position, Nomination } from '../types';

interface NominationFormProps {
  onClose: () => void;
  members: Member[];
  positions: Position[];
  onSubmit: (nomination: Partial<Nomination>) => void;
  currentUser: Member;
}

export const NominationForm: React.FC<NominationFormProps> = ({ onClose, members, positions, onSubmit, currentUser }) => {
  const [step, setStep] = useState(1);
  const [selectedPositionId, setSelectedPositionId] = useState('');
  const [selectedNomineeId, setSelectedNomineeId] = useState('');
  const [statement, setStatement] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelfNom, setIsSelfNom] = useState(false);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.rotaryId.includes(searchQuery)
  );

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nomineeId: isSelfNom ? currentUser.id : selectedNomineeId,
      positionId: selectedPositionId,
      statement,
      isSelfNomination: isSelfNom,
      timestamp: Date.now()
    });
  };

  const selectedPosition = positions.find(p => p.id === selectedPositionId);
  const selectedNominee = members.find(m => m.id === selectedNomineeId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0">
          <div>
            <h3 className="text-lg font-bold text-slate-100">New Nomination</h3>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-300">Which position are you nominating for?</label>
              <div className="grid grid-cols-1 gap-2">
                {positions.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPositionId(p.id)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      selectedPositionId === p.id 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-100">{p.title}</span>
                      {selectedPositionId === p.id && <CheckCircle size={18} className="text-blue-400" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-300">Who are you nominating?</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="selfNom" 
                    checked={isSelfNom} 
                    onChange={(e) => setIsSelfNom(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500/20"
                  />
                  <label htmlFor="selfNom" className="text-xs text-slate-400 cursor-pointer font-medium">Self-nominate</label>
                </div>
              </div>

              {!isSelfNom ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="text"
                      placeholder="Search member name or Rotary ID..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-100 placeholder:text-slate-600"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {filteredMembers.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedNomineeId(m.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          selectedNomineeId === m.id 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium text-slate-200">{m.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {m.rotaryId}</span>
                        </div>
                        {selectedNomineeId === m.id && <CheckCircle size={16} className="text-blue-400" />}
                      </button>
                    ))}
                    {filteredMembers.length === 0 && (
                      <p className="text-center py-8 text-sm text-slate-500 italic">No members found.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-100">{currentUser.name}</p>
                    <p className="text-xs text-blue-400/80">You are self-nominating</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Position</span>
                  <span className="font-bold text-slate-200">{selectedPosition?.title}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Nominee</span>
                  <span className="font-bold text-slate-200">{isSelfNom ? currentUser.name : selectedNominee?.name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Supporting Statement (Optional)</label>
                <textarea
                  className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm min-h-[120px] text-slate-100 placeholder:text-slate-600"
                  placeholder="Why is this member the right fit for this leadership role?"
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                />
              </div>

              <div className="flex items-start space-x-3 p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                <Info size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-amber-200/70 leading-tight">
                  By submitting, you confirm this member is in good standing and demonstrates the 4-Way Test in their conduct.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="text-sm font-medium text-slate-400 hover:text-slate-100 px-4 py-2 transition-colors"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 ? !selectedPositionId : !isSelfNom && !selectedNomineeId}
              className="bg-blue-600 disabled:bg-slate-800 disabled:text-slate-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20 hover:bg-blue-500"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-emerald-600 text-white px-8 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-emerald-900/20 hover:bg-emerald-500"
            >
              Submit Nomination
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
