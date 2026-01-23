
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
  Lock
} from 'lucide-react';
import { Member } from '../types';

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
    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
      isDisabled ? 'opacity-30 cursor-not-allowed' : ''
    } ${
      isActive 
        ? 'bg-blue-600/10 text-blue-400 font-medium' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    }`}
  >
    <div className="flex items-center space-x-3">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    {isDisabled && <Lock size={12} className="text-slate-500" />}
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
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">W</div>
          <span className="font-bold text-slate-100">RAC Westlands</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block
      `}>
        <div className="h-full flex flex-col p-4">
          <div className="hidden md:flex items-center space-x-3 mb-10 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-xl shadow-sm">W</div>
            <div>
              <h1 className="font-bold text-slate-100 leading-tight">RAC Westlands</h1>
              <p className="text-xs text-slate-500">Nominations Platform</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Main Menu</div>
            <NavItem 
              icon={<LayoutDashboard size={18} />} 
              label="Overview" 
              isActive={activeTab === 'overview'} 
              onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              icon={<Vote size={18} />} 
              label="My Nominations" 
              isActive={activeTab === 'nominations'} 
              onClick={() => { setActiveTab('nominations'); setIsSidebarOpen(false); }}
            />
            <NavItem 
              icon={<Users size={18} />} 
              label="Candidates" 
              isActive={activeTab === 'candidates'} 
              onClick={() => { setActiveTab('candidates'); setIsSidebarOpen(false); }}
            />
            
            <div className="pt-6 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Administration</div>
            <NavItem 
              icon={<ShieldCheck size={18} />} 
              label="Committee Portal" 
              isActive={activeTab === 'administration'}
              isDisabled={!isCommittee}
              onClick={() => { setActiveTab('administration'); setIsSidebarOpen(false); }}
            />
          </nav>

          <div className="border-t border-slate-800 pt-4">
            <div className="px-4 py-3 flex items-center space-x-3 bg-slate-800/50 rounded-xl mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-xs uppercase border border-blue-500/20">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-100 truncate">{currentUser.name}</p>
                <p className={`text-[10px] font-medium truncate uppercase tracking-tight ${isCommittee ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
                  {currentUser.role === 'COMMITTEE' ? 'Elections Committee' : 'Club Member'}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <NavItem icon={<Settings size={18} />} label="Settings" onClick={() => {}} />
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <LogOut size={18} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen bg-slate-950">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
