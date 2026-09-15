import React, { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import {
  Wallet,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Download,
  Receipt,
  Building,
  Sparkles
} from 'lucide-react';

export const EarningsView: React.FC = () => {
  const { earnings, totalEarnings, thisMonthEarnings, pendingEarnings, applications } = useJobs();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const completedCount = applications.filter((a) => a.status === 'completed').length;

  const handleDownloadReceipt = (receiptNumber: string, id: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      alert(`Receipt ${receiptNumber} generated! Digital payment confirmation acknowledged by employer.`);
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Earnings & Payouts</h1>
        <p className="text-xs text-slate-400 mt-1">
          Directly verified earnings from completed local part-time shifts
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total Earned */}
        <div className="bg-gradient-to-br from-[#111827] via-[#162136] to-[#111827] border border-emerald-500/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
            Total Earned
          </span>
          <div className="text-3xl font-black text-emerald-400 mt-1">
            ₹{totalEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Lifetime student income</p>
        </div>

        {/* This Month */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-3xl p-5 shadow-xl">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            This Month
          </span>
          <div className="text-2xl font-black text-white mt-1">
            ₹{thisMonthEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">September 2026</p>
        </div>

        {/* Pending Approval / Payment */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-3xl p-5 shadow-xl">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Pending / In-Progress
          </span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            ₹{pendingEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active accepted shifts</p>
        </div>

        {/* Completed Shifts */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-3xl p-5 shadow-xl">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Completed Gigs
          </span>
          <div className="text-2xl font-black text-purple-300 mt-1">
            {completedCount} shifts
          </div>
          <p className="text-[11px] text-slate-400 mt-1">100% verified payout rate</p>
        </div>
      </div>

      {/* Earnings History Table */}
      <div className="bg-[#111827] border border-[#1F293D] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F293D]">
          <div>
            <h3 className="text-base font-bold text-white">Recent Earnings History</h3>
            <p className="text-xs text-slate-400">All payouts received directly via UPI or verified store cash</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">Auto-generated receipts</span>
        </div>

        {earnings.length === 0 ? (
          <p className="text-center text-slate-500 py-8 text-xs">No payouts recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1F293D] text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-2">Job & Workplace</th>
                  <th className="py-3 px-2">Completed Date</th>
                  <th className="py-3 px-2">Receipt #</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                  <th className="py-3 px-2 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F293D]/60 text-slate-300">
                {earnings.map((earn) => (
                  <tr key={earn.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-2">
                      <strong className="text-white block">{earn.jobTitle}</strong>
                      <span className="text-slate-400 text-[11px]">{earn.businessName}</span>
                    </td>
                    <td className="py-3.5 px-2 text-slate-300">{earn.completedDate}</td>
                    <td className="py-3.5 px-2 font-mono text-slate-400 text-[11px]">
                      {earn.receiptNumber}
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                        {earn.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right text-emerald-400 font-black text-sm">
                      +₹{earn.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button
                        onClick={() => handleDownloadReceipt(earn.receiptNumber, earn.id)}
                        disabled={downloadingId === earn.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition"
                      >
                        <Download className="w-3 h-3 text-slate-400" />
                        <span>{downloadingId === earn.id ? 'Saving...' : 'PDF'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
