import React, { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import { CATEGORIES } from '../../data/categories';
import { JobCategory, ShiftTiming, DurationType, WorkType, SortOption } from '../../types/job';
import { CITY_COORDINATES } from '../../constants/cities';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ArrowUpDown,
  Compass,
  Clock,
  Briefcase,
  SunMedium,
  ShieldCheck,
  IndianRupee,
  MapPin,
  ChevronDown
} from 'lucide-react';

interface JobFiltersProps {
  onCloseMobile?: () => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({ onCloseMobile }) => {
  const { filters, updateFilter, clearFilters, filteredJobs } = useJobs();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategoryToggle = (category: JobCategory) => {
    const current = filters.categories;
    if (current.includes(category)) {
      updateFilter('categories', current.filter(c => c !== category));
    } else {
      updateFilter('categories', [...current, category]);
    }
  };

  const activeFilterCount = [
    filters.categories.length > 0,
    filters.city !== 'All Cities',
    filters.workType !== 'all',
    filters.duration !== 'all',
    filters.timing !== 'all',
    filters.verifiedOnly,
    filters.maxDistanceKm < 15,
    filters.minPay > 0,
    filters.maxPay < 10000,
    filters.sortBy !== 'relevant'
  ].filter(Boolean).length;

  return (
    <div className="bg-[#111827] border border-[#1F293D] rounded-2xl p-3.5 sm:p-4 shadow-xl text-slate-200">
      {/* Top Controls Row: Search Input + Sort Dropdown + Filter Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Search Input Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            placeholder="Search shifts by title, shop name, skill, or locality..."
            className="w-full bg-[#151D2D] border border-[#1F293D] hover:border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
          />
          {filters.searchQuery && (
            <button
              onClick={() => updateFilter('searchQuery', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls: Sort Selector + Filter Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Working Sort Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <div className="flex items-center gap-1.5 bg-[#151D2D] border border-[#1F293D] hover:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 transition">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">Sort:</span>
              <select
                value={filters.sortBy || 'relevant'}
                onChange={(e) => updateFilter('sortBy', e.target.value as SortOption)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1 font-medium"
              >
                <option value="relevant" className="bg-[#111827] text-white">Most Relevant</option>
                <option value="highest_pay" className="bg-[#111827] text-white">Highest Pay</option>
                <option value="lowest_pay" className="bg-[#111827] text-white">Lowest Pay</option>
                <option value="nearest" className="bg-[#111827] text-white">Nearest Distance</option>
                <option value="farthest" className="bg-[#111827] text-white">Farthest Distance</option>
                <option value="newest" className="bg-[#111827] text-white">Newest</option>
              </select>
            </div>
          </div>

          {/* Prominent Filter Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition shrink-0 cursor-pointer ${
              isExpanded || activeFilterCount > 0
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-md shadow-cyan-500/10'
                : 'bg-[#151D2D] text-slate-300 border-[#1F293D] hover:border-slate-700 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px]">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Category Chips Carousel */}
      <div className="mt-3 pt-3 border-t border-[#1F293D]/80 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => updateFilter('categories', [])}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
            filters.categories.length === 0
              ? 'bg-cyan-400 text-slate-950 shadow-sm shadow-cyan-400/20'
              : 'bg-[#151D2D] text-slate-400 hover:text-slate-200 border border-[#1F293D]'
          }`}
        >
          All Shifts ({filteredJobs.length})
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = filters.categories.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryToggle(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 font-bold'
                  : 'bg-[#151D2D] text-slate-400 hover:text-slate-200 border-[#1F293D]'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Comprehensive Filter Panel (Opens only when user clicks Filter button) */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[#1F293D] space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Main Filter Selectors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            {/* 1. Location / City */}
            <div className="bg-[#151D2D] border border-[#1F293D] rounded-xl p-3 space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>City / Region</span>
              </label>
              <select
                value={filters.city}
                onChange={(e) => updateFilter('city', e.target.value)}
                className="w-full bg-[#0F172A] border border-[#1F293D] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="All Cities">All Cities (All Karnataka)</option>
                {Object.keys(CITY_COORDINATES).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* 2. Work Type */}
            <div className="bg-[#151D2D] border border-[#1F293D] rounded-xl p-3 space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>Work Type</span>
              </label>
              <select
                value={filters.workType}
                onChange={(e) => updateFilter('workType', e.target.value as any)}
                className="w-full bg-[#0F172A] border border-[#1F293D] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">All Work Types</option>
                <option value="part_time">Part Time</option>
                <option value="weekend">Weekend Only</option>
                <option value="one_time">One-Time Shift</option>
                <option value="temporary">Temporary Rush</option>
                <option value="monthly">Monthly Recurring</option>
              </select>
            </div>

            {/* 3. Shift Duration */}
            <div className="bg-[#151D2D] border border-[#1F293D] rounded-xl p-3 space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Shift Duration</span>
              </label>
              <select
                value={filters.duration}
                onChange={(e) => updateFilter('duration', e.target.value as any)}
                className="w-full bg-[#0F172A] border border-[#1F293D] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">All Durations</option>
                <option value="few_hours">Few Hours (2-4 hrs)</option>
                <option value="1_day">1 Day</option>
                <option value="several_days">Several Days</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* 4. Shift Timing */}
            <div className="bg-[#151D2D] border border-[#1F293D] rounded-xl p-3 space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <SunMedium className="w-3.5 h-3.5 text-yellow-400" />
                <span>Shift Timing</span>
              </label>
              <select
                value={filters.timing}
                onChange={(e) => updateFilter('timing', e.target.value as any)}
                className="w-full bg-[#0F172A] border border-[#1F293D] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">Any Timing</option>
                <option value="morning">Morning (8am – 1pm)</option>
                <option value="afternoon">Afternoon (1pm – 5pm)</option>
                <option value="evening">Evening (5pm – 9:30pm)</option>
                <option value="night">Night (8pm – 11pm)</option>
              </select>
            </div>
          </div>

          {/* Secondary Controls: Distance + Pay Range + Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            {/* Distance Slider */}
            <div className="bg-[#151D2D] border border-[#1F293D] rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Max Distance</span>
                </label>
                <span className="text-[11px] text-cyan-300 font-bold">
                  {filters.maxDistanceKm >= 15 ? 'Any distance' : `Within ${filters.maxDistanceKm} km`}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                step={1}
                value={filters.maxDistanceKm}
                onChange={(e) => updateFilter('maxDistanceKm', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 km</span>
                <span>5 km</span>
                <span>10 km</span>
                <span>15+ km</span>
              </div>
            </div>

            {/* Pay / Salary Range */}
            <div className="bg-[#151D2D] border border-[#1F293D] rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pay Range (₹)</span>
                </label>
                <span className="text-[11px] text-emerald-300 font-bold">
                  ₹{filters.minPay} – {filters.maxPay >= 10000 ? 'Any' : `₹${filters.maxPay}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={filters.minPay || ''}
                  onChange={(e) => updateFilter('minPay', Number(e.target.value) || 0)}
                  placeholder="Min ₹"
                  className="w-1/2 bg-[#0F172A] border border-[#1F293D] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
                <span className="text-slate-600 text-xs">to</span>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={filters.maxPay >= 10000 ? '' : filters.maxPay}
                  onChange={(e) => updateFilter('maxPay', e.target.value ? Number(e.target.value) : 10000)}
                  placeholder="Max ₹"
                  className="w-1/2 bg-[#0F172A] border border-[#1F293D] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Verification Checkbox Toggle */}
            <div className="bg-[#151D2D] border border-[#1F293D] rounded-xl p-3 flex items-center justify-between sm:col-span-2 lg:col-span-1">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider cursor-pointer">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Verified Employers</span>
                </label>
                <p className="text-[10px] text-slate-400 mt-0.5">Physical store location confirmed</p>
              </div>
              <button
                type="button"
                onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  filters.verifiedOnly ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    filters.verifiedOnly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* All Categories Multi-Select Grid */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Filter by Specific Categories ({filters.categories.length} selected)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = filters.categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryToggle(cat.id)}
                    className={`text-left px-2.5 py-2 rounded-xl text-xs transition border flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 font-bold'
                        : 'bg-[#151D2D] text-slate-400 hover:text-white border-[#1F293D]'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {isSelected && <span className="text-xs text-cyan-400 font-black">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Summary & Clear Button Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1F293D]">
            <span className="text-xs text-slate-400">
              Showing <strong className="text-cyan-300 font-bold">{filteredJobs.length}</strong> available {filteredJobs.length === 1 ? 'shift' : 'shifts'}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Clear All Filters</span>
              </button>

              <button
                onClick={() => {
                  setIsExpanded(false);
                  if (onCloseMobile) onCloseMobile();
                }}
                className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

