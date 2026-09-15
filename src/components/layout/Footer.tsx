import React from 'react';
import { ShieldCheck, Heart, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenPostJob: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPostJob }) => {
  const { role } = useAuth();

  return (
    <footer className="bg-[#080C14] border-t border-[#1F293D] text-slate-400 text-xs py-12 px-4 sm:px-6 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Brand Col */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="glass-icon-box w-8 h-8 rounded-xl text-[#BAE6FD] font-black text-sm">
              W
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">WorkFlex</span>
          </div>
          <p className="text-[#BAE6FD] text-xs font-semibold leading-relaxed">
            Find work that fits your life.
          </p>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            A trusted hyper-local marketplace connecting students with verified shops and businesses for legitimate, flexible part-time work.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#BAE6FD]/10 border border-[#BAE6FD]/20 text-[#BAE6FD] text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Zero Advance Fees Guarantee</span>
          </div>
        </div>

        {/* Student Links */}
        <div className="space-y-2.5">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">For Students</h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button onClick={() => onNavigate('discover')} className="hover:text-white transition">
                Browse Nearby Jobs
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('discover')} className="hover:text-white transition">
                Interactive Map View
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('applications')} className="hover:text-white transition">
                Application Tracker
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('earnings')} className="hover:text-white transition">
                Earnings & Receipts
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('profile')} className="hover:text-white transition">
                Student Profile
              </button>
            </li>
          </ul>
        </div>

        {/* Employer Links */}
        <div className="space-y-2.5">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">For Shopkeepers & Employers</h4>
          <ul className="space-y-1.5 text-xs">
            {role === 'employer' && (
              <>
                <li>
                  <button onClick={onOpenPostJob} className="text-emerald-400 hover:text-emerald-300 font-semibold transition">
                    + Post a Part-Time Job
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('employer')} className="hover:text-white transition">
                    Employer Dashboard
                  </button>
                </li>
              </>
            )}
            <li>
              <span className="text-slate-500">Shop Verification Guidelines</span>
            </li>
            <li>
              <span className="text-slate-500">Student Fair Pay Standards</span>
            </li>
          </ul>
        </div>

        {/* Coverage Cities */}
        <div className="space-y-2.5">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>Karnataka Coverage</span>
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Active local listings across college clusters in:
          </p>
          <div className="flex flex-wrap gap-1.5 text-[10px]">
            {['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Tumakuru', 'Shivamogga', 'Davanagere'].map((c) => (
              <span key={c} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-[#1F293D] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
        <p>© 2026 WorkFlex. Built for flexible student schedules.</p>
        <p className="flex items-center gap-1">
          Built with <Heart className="w-3 h-3 text-rose-400 fill-rose-400" /> for college students balancing work and study.
        </p>
      </div>
    </footer>
  );
};
