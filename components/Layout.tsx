
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Vote,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Lock,
  MoreHorizontal,
  Briefcase
} from 'lucide-react';
import { Member } from '../types';
import { VOTING_SCHEDULE } from '../constants';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, isDisabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-md transition-colors font-medium text-sm ${isDisabled ? 'opacity-40 cursor-not-allowed text-slate-500' : ''
      } ${isActive
        ? 'text-cranberry-500 bg-cranberry-50'
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
      }`}
  >
    {icon}
    <span>{label}</span>
    {isDisabled && <Lock size={12} className="ml-auto text-slate-400" />}
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: Member;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, currentUser, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isCommittee = currentUser.role === 'COMMITTEE';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-body text-slate-800">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <img src="/logos/Westlands New Logo.png" alt="Logo" className="h-8" />
          <span className="font-heading font-bold text-slate-800">RAC Westlands</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-500">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block
      `}>
        {/* Sidebar Header with 3 Logos */}
        <div className="p-6 border-b border-slate-100 flex flex-col items-center space-y-4">
          <div className="flex items-center justify-between w-full space-x-2">
            <img src="/logos/Rac_Westlands.png" alt="Club Logo" className="h-10 w-auto object-contain" />
            <img src="/logos/Westlands New Logo.png" alt="Compass Logo" className="h-12 w-auto object-contain" />
            <img src="/logos/PM2526-BC-SOCIAL-ROTARACT-WHITE-1080x1080-EN-US.png" alt="Theme Logo" className="h-10 w-auto object-contain" />
          </div>
          <div className="text-center">
            <h1 className="font-heading font-bold italic text-lg text-slate-900 leading-tight">UNITE FOR GOOD</h1>
            <p className="text-[10px] text-slate-500 tracking-wide uppercase mt-1">Elections 2025-26</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col px-4 py-6 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Election Portal</div>
            <NavItem
              icon={<LayoutDashboard size={18} />}
              label="Overview"
              isActive={activeTab === 'overview'}
              onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
            />
            <NavItem
              icon={<Users size={18} />}
              label="Candidates"
              isActive={activeTab === 'candidates'}
              onClick={() => { setActiveTab('candidates'); setIsSidebarOpen(false); }}
            />
            <NavItem
              icon={<Vote size={18} />}
              label="My Nominations"
              isActive={activeTab === 'nominations'}
              onClick={() => { setActiveTab('nominations'); setIsSidebarOpen(false); }}
            />
            {/* Voting Tab - Only shows when active */}
            {(() => {
              const now = new Date().getTime();
              const openTime = new Date(VOTING_SCHEDULE.OPEN_DATE).getTime();
              const closeTime = new Date(VOTING_SCHEDULE.CLOSE_DATE).getTime();
              const isVotingActive = now >= openTime && now < closeTime;

              if (!isVotingActive) return null;

              return (
                <NavItem
                  icon={<ShieldCheck size={18} />}
                  label="Cast Vote"
                  isActive={activeTab === 'vote'}
                  onClick={() => { setActiveTab('vote'); setIsSidebarOpen(false); }}
                />
              );
            })()}
            <NavItem
              icon={<Briefcase size={18} />}
              label="My Candidacy"
              isActive={activeTab === 'candidacy'}
              onClick={() => { setActiveTab('candidacy'); setIsSidebarOpen(false); }}
            />
          </div>

          <div className="mt-8 space-y-1">
            <div className="px-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administration</div>
            <NavItem
              icon={<ShieldCheck size={18} />}
              label="Committee Portal"
              isActive={activeTab === 'administration'}
              isDisabled={!isCommittee}
              onClick={() => { setActiveTab('administration'); setIsSidebarOpen(false); }}
            />
            <div className="pt-2">
              <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors font-medium text-sm">
                <MoreHorizontal size={18} />
                <span>More</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-cranberry-100 flex items-center justify-center text-cranberry-600 font-bold text-xs border border-cranberry-200">
              {currentUser.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{currentUser.role === 'COMMITTEE' ? 'Committee Member' : 'Club Member'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded border border-slate-200 text-slate-600 hover:bg-white hover:text-cranberry-600 hover:border-cranberry-200 transition-all text-xs font-medium"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Brand Footer */}
        <div className="py-4 flex justify-center border-t border-slate-200">
          <img src="/logos/Rotaract Logo_EN21-07.png" alt="District Theme" className="h-8 opacity-80" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen bg-white">
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};
