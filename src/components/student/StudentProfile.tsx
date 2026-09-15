import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobContext';
import { CATEGORIES } from '../../data/categories';
import { JobCategory, ShiftTiming } from '../../types/job';
import {
  GraduationCap,
  Star,
  MapPin,
  Clock,
  Briefcase,
  Plus,
  X,
  CheckCircle2,
  Edit2,
  Save,
  Wallet
} from 'lucide-react';

export const StudentProfileView: React.FC = () => {
  const { user, updateStudentProfile } = useAuth();
  const { applications, totalEarnings } = useJobs();

  const student = user?.studentData || {
    id: 'student-1',
    name: 'Ananya Rao',
    email: 'ananya.rao@rvce.edu.in',
    phone: '+91 98450 78219',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    college: 'R.V. College of Engineering (RVCE)',
    degree: 'B.E. Computer Science',
    yearOfStudy: '3rd Year Undergraduate',
    bio: 'Engineering student passionate about tech, coffee, and books. Looking for productive evening gigs.',
    skills: ['Quick Typing', 'Customer Communication', 'Two-Wheeler Navigation'],
    preferredCategories: ['Cafe & Restaurant', 'Retail', 'Tutoring'],
    preferredHours: ['evening', 'morning'] as ShiftTiming[],
    preferredDistanceKm: 5,
    completedJobsCount: 4,
    rating: 4.9,
    totalEarnings: 4850,
    city: 'Bengaluru'
  };

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(student.name);
  const [college, setCollege] = useState(student.college);
  const [degree, setDegree] = useState(student.degree);
  const [bio, setBio] = useState(student.bio);
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState<string[]>(student.skills);
  const [preferredDistanceKm, setPreferredDistanceKm] = useState(student.preferredDistanceKm);
  const [preferredCategories, setPreferredCategories] = useState<JobCategory[]>(student.preferredCategories);

  const handleSave = () => {
    updateStudentProfile({
      name,
      college,
      degree,
      bio,
      skills,
      preferredDistanceKm,
      preferredCategories,
    });
    setIsEditing(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const toggleCategory = (cat: JobCategory) => {
    if (preferredCategories.includes(cat)) {
      setPreferredCategories(preferredCategories.filter(c => c !== cat));
    } else {
      setPreferredCategories([...preferredCategories, cat]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-slate-100">
      {/* Profile Card Header */}
      <div className="bg-[#111827] border border-[#1F293D] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-emerald-400/40 shadow-xl shrink-0">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{student.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                  Verified Student ID
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{student.college} • {student.degree}</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-1 text-amber-300 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span>{student.rating} Employer Rating</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{student.completedJobsCount} Gigs Completed</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shrink-0 ${
              isEditing
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isEditing ? (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </>
            )}
          </button>
        </div>

        {/* Bio */}
        <div className="mt-6 pt-6 border-t border-[#1F293D]">
          {isEditing ? (
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#151D2D] border border-[#1F293D] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          ) : (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              "{student.bio}"
            </p>
          )}
        </div>
      </div>

      {/* Grid: Preferences & Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills Tag Cloud */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Student Skills & Strengths
            </h3>
            <span className="text-[11px] text-slate-400">{skills.length} skills listed</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200"
              >
                <span>{skill}</span>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a new skill..."
                className="flex-1 bg-[#151D2D] border border-[#1F293D] rounded-xl p-2 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleAddSkill}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          )}
        </div>

        {/* Preferred Working Radius & Hours */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Shift Preferences
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400 font-medium">Max Travel Radius from College/Hostel:</span>
                <span className="text-emerald-400 font-bold">{preferredDistanceKm} km</span>
              </div>
              {isEditing ? (
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={preferredDistanceKm}
                  onChange={(e) => setPreferredDistanceKm(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              ) : (
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${(preferredDistanceKm / 15) * 100}%` }} />
                </div>
              )}
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-2">Preferred Shift Timings:</span>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                  Evening (5:00 PM – 9:30 PM)
                </span>
                <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/30 font-semibold">
                  Weekend Mornings
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferred Categories */}
      <div className="bg-[#111827] border border-[#1F293D] rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Preferred Job Categories
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {CATEGORIES.map((cat) => {
            const isSelected = preferredCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                disabled={!isEditing}
                onClick={() => toggleCategory(cat.id)}
                className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-200 font-bold'
                    : 'bg-[#151D2D] border-[#1F293D] text-slate-400 opacity-60'
                }`}
              >
                <span>{cat.name}</span>
                {isSelected && <span className="text-emerald-400">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
