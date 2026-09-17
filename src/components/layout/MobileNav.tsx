import React from 'react';
import { Home, Compass, MapPin, Briefcase, User, LayoutDashboard, PlusCircle } from 'lucide-react';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenPostJob?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate, onOpenPostJob }) => {
  const { applications } = useJobs();
  const { role, isAuthenticated } = useAuth();

  const isEmployer = isAuthenticated && role === 'employer';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F17]/95 backdrop-blur-xl border-t border-[#1F293D] pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] px-3 shadow-2xl">
      <div className="flex items-center justify-around">
        {isEmployer ? (
          <>
            {/* Employer Dashboard */}
            <button
              onClick={() => onNavigate('employer')}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-1 p-1 transition cursor-pointer active:scale-95 ${
                currentView === 'employer' ? 'text-[#BAE6FD] font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px]">Dashboard</span>
            </button>

            {/* Employer Post a Job */}
            <button
              onClick={() => (onOpenPostJob ? onOpenPostJob() : onNavigate('employer'))}
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-1 p-1 text-sky-400 hover:text-sky-300 font-bold transition cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-5 h-5 text-sky-400" />
              <span className="text-[10px]">Post Job</span>
            </button>

            {/* Map */}
            <button
              onClick={() => onNavigate('discover-map')}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-1 p-1 transition cursor-pointer active:scale-95 ${
                currentView === 'discover-map' ? 'text-[#BAE6FD] font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-5 h-5 text-[#BAE6FD]" />
              <span className="text-[10px]">Map</span>
            </button>

            {/* Employer My Jobs / Applications */}
            <button
              onClick={() => onNavigate('employer')}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-1 p-1 transition cursor-pointer active:scale-95 ${
                currentView === 'employer' ? 'text-[#BAE6FD] font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span className="text-[10px]">My Jobs</span>
            </button>

            {/* Profile */}
            <button
              onClick={() => onNavigate('profile')}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-1 p-1 transition cursor-pointer active:scale-95 ${
                currentView === 'profile' ? 'text-[#BAE6FD] font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px]">Account</span>
            </button>
          </>
        ) : (
          <>
            {/* Student / Employee: Clean, strictly no Employer controls */}
            <button
              onClick={() => onNavigate('landing')}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-1 p-1 transition cursor-pointer active:scale-95 ${
                currentView === 'landing' ? 'text-[#BAE6FD] font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Home</span>
            </button>

            <button
              onClick={() => onNavigate('discover')}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-1 p-1 transition cursor-pointer active:scale-95 ${
                currentView === 'discover' ? 'text-[#BAE6FD] font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px]">Jobs</span>
            </button>

            <button
              onClick={() => onNavigate('discover-map')}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-1 p-1 transition cursor-pointer active:scale-95 ${
                currentView === 'discover-map' ? 'text-[#BAE6FD] font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-5 h-5 text-[#BAE6FD]" />
              <span className="text-[10px]">Map</span>
            </button>

            <button
              onClick={() => onNavigate('applications')}
              className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-1 p-1 transition cursor-pointer active:scale-95 ${
                currentView === 'applications' ? 'text-[#BAE6FD] font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span className="text-[10px]">Applied</span>
              {applications.length > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#BAE6FD]" />
              )}
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-1 p-1 transition cursor-pointer active:scale-95 ${
                currentView === 'profile' ? 'text-[#BAE6FD] font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px]">Profile</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
