import React from 'react';
import { Home, Compass, MapPin, Briefcase, User } from 'lucide-react';
import { useJobs } from '../../context/JobContext';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  const { applications } = useJobs();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F17]/95 backdrop-blur-xl border-t border-[#1F293D] py-2 px-3">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onNavigate('landing')}
          className={`flex flex-col items-center gap-1 p-1 transition cursor-pointer ${
            currentView === 'landing' ? 'text-[#BAE6FD] font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => onNavigate('discover')}
          className={`flex flex-col items-center gap-1 p-1 transition cursor-pointer ${
            currentView === 'discover' ? 'text-[#BAE6FD] font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Jobs</span>
        </button>

        <button
          onClick={() => onNavigate('discover-map')}
          className={`flex flex-col items-center gap-1 p-1 transition cursor-pointer ${
            currentView === 'discover-map' ? 'text-[#BAE6FD] font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-5 h-5 text-[#BAE6FD]" />
          <span className="text-[10px]">Map</span>
        </button>

        <button
          onClick={() => onNavigate('applications')}
          className={`relative flex flex-col items-center gap-1 p-1 transition cursor-pointer ${
            currentView === 'applications' ? 'text-[#BAE6FD] font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px]">Applied</span>
          {applications.length > 0 && (
            <span className="absolute -top-0.5 right-1 w-2 h-2 rounded-full bg-[#BAE6FD]" />
          )}
        </button>

        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center gap-1 p-1 transition cursor-pointer ${
            currentView === 'profile' ? 'text-[#BAE6FD] font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </div>
  );
};
