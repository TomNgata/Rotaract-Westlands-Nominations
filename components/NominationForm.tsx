
import React, { useState } from 'react';
import { X, Search, Info, CheckCircle, Loader2 } from 'lucide-react';
import { Member, Position, Nomination, ElectionSettings } from '../types';

interface NominationFormProps {
  onClose: () => void;
  members: Member[];
  positions: Position[];
  onSubmit: (nomination: Partial<Nomination>) => void;
  currentUser: Member;
  nominations: Nomination[];
  settings: ElectionSettings | null;
}

export const NominationForm: React.FC<NominationFormProps> = ({ onClose, members, positions, onSubmit, currentUser, nominations, settings }) => {
  const [step, setStep] = useState(1);
  const [selectedPositionId, setSelectedPositionId] = useState('');
  const [selectedNomineeId, setSelectedNomineeId] = useState('');
  const [statement, setStatement] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelfNom, setIsSelfNom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.rotaryId.includes(searchQuery)
  );

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate network delay for "Trust" - users trust operations that take a tangible amount of time
    await new Promise(resolve => setTimeout(resolve, 1500));

    onSubmit({
      nomineeId: isSelfNom ? currentUser.id : selectedNomineeId,
      positionId: selectedPositionId,
      statement,
      isSelfNomination: isSelfNom,
      timestamp: Date.now()
    });

    setIsSubmitting(false);
    setStep(4);
  };

  const selectedPosition = positions.find(p => p.id === selectedPositionId);
  const selectedNominee = members.find(m => m.id === selectedNomineeId);


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-body">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
          <div className="flex items-center space-x-4">
            <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
              <img src="/logos/Rotaract Logo_EN21-06.png" alt="Logo" className="h-8 w-auto" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-slate-900">New Nomination</h3>
              <div className="flex items-center space-x-2">
                <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-cranberry-600' : 'bg-slate-200'}`}></div>
                <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-cranberry-600' : 'bg-slate-200'}`}></div>
                <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 3 ? 'bg-cranberry-600' : 'bg-slate-200'}`}></div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold ml-2">
                  {step > 3 ? 'Complete' : `Step ${step} of 3`}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-cranberry-600">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-5">
              <label className="block text-sm font-bold text-slate-700">Which position are you nominating for?</label>
              <div className="grid grid-cols-1 gap-3">
                {positions.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPositionId(p.id)}
                    className={`text-left p-5 rounded-xl border-2 transition-all group ${selectedPositionId === p.id
                      ? 'border-cranberry-600 bg-cranberry-50'
                      : 'border-slate-100 hover:border-cranberry-200 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-heading font-bold text-lg ${selectedPositionId === p.id ? 'text-cranberry-700' : 'text-slate-800'}`}>
                        {p.title}
                      </span>
                      {selectedPositionId === p.id && <CheckCircle size={20} className="text-cranberry-600" />}
                    </div>
                    <p className={`text-xs ${selectedPositionId === p.id ? 'text-cranberry-800/80' : 'text-slate-500'}`}>
                      {p.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-sm font-bold text-slate-700">Who are you nominating?</label>
                {(settings?.allow_self_nomination ?? true) && (
                  <div className="flex items-center space-x-2.5">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        id="selfNom"
                        checked={isSelfNom}
                        onChange={(e) => setIsSelfNom(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-cranberry-600 checked:bg-cranberry-600 hover:border-cranberry-400"
                      />
                      <CheckCircle className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" size={12} />
                    </div>
                    <label htmlFor="selfNom" className="text-xs text-slate-600 cursor-pointer font-bold uppercase tracking-wide select-none">Self-nominate</label>
                  </div>
                )}
              </div>

              {!isSelfNom ? (
                <>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cranberry-500 transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Search member name or Rotary ID..."
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-xl focus:border-cranberry-500 focus:ring-4 focus:ring-cranberry-500/10 outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {filteredMembers.map(m => {
                      // Check if member is already nominated for a DIFFERENT position
                      const existingNom = nominations.find(n => n.nomineeId === m.id && n.reviewStatus !== 'REJECTED');
                      const isRestricted = (settings?.limit_one_position ?? true) && existingNom && existingNom.positionId !== selectedPositionId;

                      // Check Good Standing if required
                      const isGoodStandingIssue = (settings?.require_good_standing ?? true) && !m.isGoodStanding;

                      const isDisabled = !!isRestricted || isGoodStandingIssue;

                      return (
                        <button
                          key={m.id}
                          onClick={() => !isDisabled && setSelectedNomineeId(m.id)}
                          disabled={isDisabled}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedNomineeId === m.id
                            ? 'border-cranberry-500 bg-cranberry-50 shadow-sm'
                            : isDisabled
                              ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                              : 'border-transparent hover:bg-slate-50'
                            }`}
                        >
                          <div className="flex flex-col text-left">
                            <span className={`text-sm font-bold ${selectedNomineeId === m.id ? 'text-cranberry-900' : 'text-slate-700'}`}>{m.name}</span>
                            <span className={`text-[10px] font-mono ${selectedNomineeId === m.id ? 'text-cranberry-700' : 'text-slate-400'}`}>ID: {m.rotaryId}</span>
                            {isRestricted && (
                              <span className="text-[10px] text-amber-600 font-bold mt-1 block">Already nominated for another position</span>
                            )}
                            {isGoodStandingIssue && (
                              <span className="text-[10px] text-red-500 font-bold mt-1 block">Not in Good Standing</span>
                            )}
                          </div>
                          {selectedNomineeId === m.id && <CheckCircle size={18} className="text-cranberry-600" />}
                        </button>
                      )
                    })}
                    {filteredMembers.length === 0 && (
                      <div className="text-center py-10">
                        <p className="text-sm text-slate-400 italic">No matching members found.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-6 bg-cranberry-50 rounded-xl border border-cranberry-100 flex items-center space-x-5 animate-in fade-in duration-300">
                  <div className="w-12 h-12 bg-cranberry-600 rounded-full flex items-center justify-center text-white font-heading font-bold text-lg shadow-lg shadow-cranberry-200">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-base font-bold text-cranberry-900">{currentUser.name}</p>
                    <p className="text-sm text-cranberry-700">Confirming your self-nomination</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
                  <span className="text-slate-500 font-medium">Position</span>
                  <span className="font-heading font-bold text-slate-900 text-right">{selectedPosition?.title}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Nominee</span>
                  <span className="font-heading font-bold text-slate-900 text-right">{isSelfNom ? currentUser.name : selectedNominee?.name}</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">Supporting Statement <span className="text-slate-400 font-normal italic ml-1">(Optional)</span></label>
                <textarea
                  className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl focus:border-cranberry-500 focus:ring-4 focus:ring-cranberry-500/10 outline-none transition-all text-sm min-h-[140px] text-slate-700 placeholder:text-slate-400 resize-none"
                  placeholder="Share a brief statement on why this candidate is the right fit..."
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <Info size={18} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  By submitting, you confirm this member is in good standing and demonstrates the <span className="font-bold">4-Way Test</span> in their conduct.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="text-emerald-600 w-10 h-10" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">Nomination Received!</h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                  Thank you for participating. The committee will review your submission shortly.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 w-full max-w-sm">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Reference ID</span>
                  <span className="font-mono font-bold text-slate-700">#{Date.now().toString().slice(-6)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="text-sm font-bold text-slate-400 hover:text-slate-600 px-4 py-2 transition-colors uppercase tracking-wide disabled:opacity-50"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 && (
            <button
              onClick={handleNext}
              disabled={step === 1 ? !selectedPositionId : !isSelfNom && !selectedNomineeId}
              className="bg-cranberry-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-cranberry-900/20 hover:bg-cranberry-700 hover:shadow-cranberry-900/30 active:scale-[0.98] flex items-center space-x-2"
            >
              <span>Next Step</span>
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-emerald-600 disabled:bg-emerald-600/70 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 hover:shadow-emerald-900/30 active:scale-[0.98] flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Confirm Nomination</span>
              )}
            </button>
          )}

          {step === 4 && (
            <button
              onClick={onClose}
              className="w-full bg-slate-900 text-white px-8 py-3 rounded-xl font-bold transition-all hover:bg-slate-800 active:scale-[0.98]"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
