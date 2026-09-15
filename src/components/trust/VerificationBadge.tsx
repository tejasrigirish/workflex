import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface VerificationBadgeProps {
  isVerified: boolean;
  type?: 'verified_business' | 'profile_provided';
  showDetails?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  isVerified,
  type = 'verified_business',
  showDetails = false,
}) => {
  if (isVerified) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Verified Business</span>
        {showDetails && (
          <span className="text-[11px] text-emerald-400/80 font-normal ml-1">
            (Physical shop & phone confirmed)
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
      <Info className="w-3.5 h-3.5 text-blue-300 shrink-0" />
      <span>Business Profile Provided</span>
    </div>
  );
};
