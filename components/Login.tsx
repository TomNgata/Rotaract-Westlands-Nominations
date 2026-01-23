import React, { useState } from 'react';
import { ShieldCheck, User, Key, ArrowRight, AlertCircle, Loader2, Clock } from 'lucide-react';
import { Member } from '../types';
import { supabase } from '../services/supabaseClient';
import { ELECTION_SCHEDULE } from '../constants';

interface LoginProps {
  onLogin: (user: Member) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [rotaryId, setRotaryId] = useState('');
  const [specialCode, setSpecialCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Timer State
  const [timeLeft, setTimeLeft] = useState('Loading...');
  const [timerStatus, setTimerStatus] = useState<'UPCOMING' | 'ACTIVE' | 'CLOSED'>('UPCOMING');

  React.useEffect(() => {
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

  const CONTACT_SUPPORT = " Please contact any member of the elections committee for support with any challenge.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Check for Committee Access Code FIRST (if provided)
      const isCommitteeAttempt = specialCode.trim().length > 0;

      if (isCommitteeAttempt) {
        // Verify the format: [ID]-EC26
        const expectedCode = `${rotaryId}-EC26`;
        if (specialCode !== expectedCode) {
          throw new Error("Invalid access combination." + CONTACT_SUPPORT);
        }
      }

      // 2. Query Supabase for the member
      const { data, error: dbError } = await supabase
        .from('members')
        .select('*')
        .eq('rotary_id', rotaryId)
        .single();

      if (dbError || !data) {
        if (dbError?.code === 'PGRST116') { // Not found
          throw new Error("Rotary ID not found in the member database." + CONTACT_SUPPORT);
        }
        console.error("Database Login Error:", dbError);
        throw new Error("Service unavailable. Please try again later.");
      }

      const member: Member = {
        id: data.id,
        name: data.full_name || data.name,
        rotaryId: data.rotary_id || data.rotaryId || rotaryId,
        email: data.email || 'No Email',
        phone: data.phone_number || data.phone || 'No Phone',
        isGoodStanding: data.is_good_standing ?? data.isGoodStanding ?? false,
        role: 'MEMBER'
      };

      // 3. Status Check
      if (!member.isGoodStanding) {
        throw new Error("Member is not in good standing and cannot participate in nominations." + CONTACT_SUPPORT);
      }

      // 4. Final Role Assignment
      if (isCommitteeAttempt) {
        member.role = 'COMMITTEE';
      }

      // Success!
      onLogin(member);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-body bg-white">
      {/* Left Side - Brand Panel (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cranberry-700 to-cranberry-900 relative overflow-hidden items-center justify-center p-12 text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 max-w-lg flex flex-col items-center text-center">
          {/* Desktop Timer */}
          <div className="mb-8 inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
            <Clock size={16} className={timerStatus === 'ACTIVE' ? "text-emerald-300" : "text-amber-300"} />
            <span className="text-sm font-mono font-bold tracking-wider text-white">
              {timerStatus === 'UPCOMING' ? "OPENS IN:" : timerStatus === 'ACTIVE' ? "CLOSING IN:" : "STATUS:"}
              <span className={timerStatus === 'ACTIVE' ? "text-emerald-300 ml-2" : "text-amber-300 ml-2"}>{timeLeft}</span>
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/10 shadow-2xl mb-8 inline-block transform hover:scale-105 transition-transform duration-500">
            <img
              src="/logos/PM2526-BC-SOCIAL-ROTARACT-WHITE-1080x1080-EN-US.png"
              alt="Unite for Good"
              className="w-48 h-48 object-contain drop-shadow-xl"
            />
          </div>

          <h1 className="text-5xl font-heading font-extrabold italic mb-4 tracking-tight text-white drop-shadow-sm">UNITE FOR GOOD</h1>
          <p className="text-cranberry-100 text-lg font-medium tracking-wide mb-8">Elections 2025-2026</p>
          <div className="h-1 w-24 bg-cranberry-400 mx-auto rounded-full"></div>
          <p className="mt-8 text-cranberry-200 text-sm max-w-xs mx-auto leading-relaxed">
            "Leadership is not about being in charge. It is about taking care of those in your charge."
          </p>
        </div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16 bg-white">
        <div className="max-w-md w-full space-y-10">

          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center pb-6 border-b border-slate-100 mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-cranberry-600 p-3 rounded-xl shadow-lg shadow-cranberry-200">
                <img src="/logos/PM2526-BC-SOCIAL-ROTARACT-WHITE-1080x1080-EN-US.png" alt="Logo" className="w-12 h-12" />
              </div>
            </div>
            <h2 className="text-2xl font-heading font-bold text-slate-900">RAC Westlands</h2>
          </div>

          <div className="text-center space-y-2">
            <div className="flex justify-center items-center gap-6 mb-8 opacity-90 transition-opacity hover:opacity-100">
              <img src="/logos/Rac_Westlands.png" alt="RAC Westlands" className="h-14 w-auto object-contain" />
              <div className="h-8 w-px bg-slate-200"></div>
              <img src="/logos/Westlands New Logo.png" alt="Compass" className="h-16 w-auto object-contain" />
            </div>
            <h2 className="text-3xl font-heading font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500">Sign in to the Nominations Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Rotary ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-cranberry-500 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6789012"
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cranberry-100 focus:border-cranberry-500 outline-none transition-all font-mono text-sm shadow-sm hover:bg-white hover:border-cranberry-200"
                  value={rotaryId}
                  onChange={(e) => setRotaryId(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-400 group-focus-within:text-cranberry-500 transition-colors" />
                </div>
                <input
                  type="password"
                  placeholder="Access Code (Optional)"
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cranberry-100 focus:border-cranberry-500 outline-none transition-all font-mono text-sm shadow-sm hover:bg-white hover:border-cranberry-200"
                  value={specialCode}
                  onChange={(e) => setSpecialCode(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-end">
                <button type="button" className="text-xs font-medium text-cranberry-600 hover:text-cranberry-800 transition-colors">
                  Committee Member?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-cranberry-600 hover:bg-cranberry-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-cranberry-200 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99] ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:translate-y-[-1px]'
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Access Dashboard</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* Mobile Timer - Creates Haste */}
            <div className="lg:hidden mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-center space-x-3 animate-pulse">
              <Clock size={16} className={timerStatus === 'ACTIVE' ? "text-emerald-600" : "text-amber-600"} />
              <div className="text-xs font-bold text-slate-700">
                <span className="uppercase mr-1 opacity-70">
                  {timerStatus === 'UPCOMING' ? "Starts In:" : timerStatus === 'ACTIVE' ? "Time Left:" : "Status:"}
                </span>
                <span className="font-mono text-sm">{timeLeft}</span>
              </div>
            </div>
          </form>

          <div className="pt-8 border-t border-slate-100 text-center">
            <div className="inline-flex items-center space-x-2 text-slate-400 bg-slate-50 px-4 py-2 rounded-full mb-4">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Secure 256-bit Encryption</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              By accessing this platform, you agree to uphold the <span className="font-semibold text-slate-600">4-Way Test</span> and club bylaws.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
