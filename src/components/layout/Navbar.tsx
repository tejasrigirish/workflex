import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobContext';
import {
  Briefcase,
  MapPin,
  Bookmark,
  User,
  Bell,
  Plus,
  Compass,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Building,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenPostJob: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenPostJob }) => {
  const { user, role, setRole, logout, isAuthenticated, openAuth } = useAuth();
  const {
    savedJobIds,
    applications,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useJobs();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleToggle = () => {
    const nextRole = role === 'student' ? 'employer' : 'student';
    setRole(nextRole);
    if (nextRole === 'employer') {
      onNavigate('employer');
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <header className="sticky top-3 sm:top-4 z-40 w-full px-3 sm:px-6 pointer-events-none transition-all duration-300">
      <div className="max-w-6xl mx-auto nav-island rounded-2xl sm:rounded-full px-4 sm:px-6 py-2 flex items-center justify-between gap-4 pointer-events-auto shadow-2xl">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="glass-icon-box w-9 h-9 rounded-xl text-[#BAE6FD] font-black text-base group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(186,230,253,0.35)] transition-all">
            W
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-white text-lg tracking-tight leading-none group-hover:text-[#BAE6FD] transition-colors">
              WorkFlex
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
              Flexible Shifts
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-2 rounded-xl transition cursor-pointer ${
              currentView === 'landing'
                ? 'bg-slate-800 text-white'
                : 'hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('discover')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentView === 'discover'
                ? 'bg-[#BAE6FD]/15 text-[#BAE6FD] border border-[#BAE6FD]/30 font-bold'
                : 'hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#BAE6FD]" />
            <span>Find Jobs</span>
          </button>

          <button
            onClick={() => onNavigate('discover-map')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentView === 'discover-map'
                ? 'bg-[#BAE6FD]/15 text-[#BAE6FD] border border-[#BAE6FD]/30 font-bold'
                : 'hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#BAE6FD]" />
            <span>Map</span>
          </button>

          {isAuthenticated && role === 'student' && (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-2 rounded-xl transition ${
                  currentView === 'dashboard'
                    ? 'bg-slate-800 text-white'
                    : 'hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => onNavigate('applications')}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  currentView === 'applications'
                    ? 'bg-slate-800 text-white'
                    : 'hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span>Applications</span>
                {applications.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-700 text-[10px] text-slate-300">
                    {applications.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => onNavigate('saved')}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  currentView === 'saved'
                    ? 'bg-slate-800 text-white'
                    : 'hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span>Saved</span>
                {savedJobIds.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-700 text-[10px] text-slate-300">
                    {savedJobIds.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => onNavigate('earnings')}
                className={`px-3 py-2 rounded-xl transition ${
                  currentView === 'earnings'
                    ? 'bg-slate-800 text-white'
                    : 'hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Earnings
              </button>
            </>
          )}

          {isAuthenticated && role === 'employer' && (
            <button
              onClick={() => onNavigate('employer')}
              className={`px-3 py-2 rounded-xl transition ${
                currentView === 'employer'
                  ? 'bg-slate-800 text-white'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Employer Dashboard
            </button>
          )}
        </nav>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Post a Shift CTA */}
          <button
            onClick={onOpenPostJob}
            className="btn-floating-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Post a Shift</span>
          </button>

          {!isAuthenticated ? (
            <button
              onClick={() => openAuth()}
              className="btn-floating-glass flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Sign In</span>
            </button>
          ) : (
            <>
              {/* Role Status Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-700/60 text-[11px] font-semibold text-slate-300 backdrop-blur-md">
                <span className="text-slate-400">Account:</span>
                <span className={role === 'student' ? 'text-emerald-400' : 'text-sky-300'}>
                  {role === 'student' ? '👤 Employee' : '💼 Employer'}
                </span>
              </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] sm:w-96 bg-[#111827] border border-[#1F293D] rounded-2xl shadow-2xl p-4 text-slate-100 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#1F293D]">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Notifications
                    </h4>
                    {unreadNotificationsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        {unreadNotificationsCount} new
                      </span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-indigo-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#1F293D]/60 pt-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.linkTarget) {
                            onNavigate(n.linkTarget);
                            setIsNotificationsOpen(false);
                          }
                        }}
                        className={`py-3 px-1 hover:bg-slate-800/40 rounded-lg cursor-pointer transition text-xs space-y-1 ${
                          !n.read ? 'bg-slate-800/20' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-white font-bold">{n.title}</strong>
                          <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 bg-[#141A28] hover:bg-slate-800 border border-slate-800 rounded-xl transition"
            >
              <span className="text-xs font-bold text-slate-200 hidden md:inline truncate max-w-[100px]">
                {user?.name || 'My Account'}
              </span>
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={user?.name || 'User'}
                className="w-7 h-7 rounded-lg object-cover border border-slate-700"
              />
              <ChevronDown className="w-3 h-3 text-slate-400 mr-1" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0D121D] border border-slate-800 rounded-2xl shadow-2xl p-2 text-xs text-slate-200 z-50 animate-in fade-in duration-150">
                <div className="p-3 border-b border-slate-800 space-y-0.5">
                  <p className="font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-emerald-400 font-semibold uppercase">
                    {role === 'student' ? 'Student Account' : 'Employer Account'}
                  </span>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2 transition"
                  >
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>My Profile</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-950/40 text-rose-300 flex items-center gap-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out (Switch Account)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
