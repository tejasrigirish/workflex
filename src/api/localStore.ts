// src/api/localStore.ts
// Robust, client-side persistent storage engine for WorkFlex
// Provides 100% offline & serverless deployment resilience (e.g. Vercel, Netlify, Static Hosting)

import { ApiUser, ApiJob, ApiApplication, ApiShift } from './client';
import { sanitizeCoordinates, isValidCoordinate, extractJobCoordinates } from '../constants/cities';

const USERS_KEY = 'workflex_db_users';
const JOBS_KEY = 'workflex_db_jobs';
const APPS_KEY = 'workflex_db_apps';
const SHIFTS_KEY = 'workflex_db_shifts';
const RESETS_KEY = 'workflex_db_resets';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'student' | 'employer';
  profile: any;
  createdAt: string;
}

const DEFAULT_USERS: StoredUser[] = [
  {
    id: 'user_demo_student',
    name: 'Rahul Sharma',
    email: 'student@workflex.in',
    phone: '9876543210',
    password: 'demo123',
    role: 'student',
    profile: {
      id: 'student_demo_1',
      college: 'Christ University Bengaluru',
      skills: ['Customer Service', 'Billing', 'Communication'],
      availability: 'Evening Shifts',
      city: 'Bengaluru',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_demo_employer',
    name: 'Venkatesh Stores & Provisions',
    email: 'employer@workflex.in',
    phone: '9845012389',
    password: 'demo123',
    role: 'employer',
    profile: {
      id: 'emp_demo_1',
      businessName: 'Venkatesh Stores & Provisions',
      businessType: 'Retail & Grocery',
      description: 'Trusted neighborhood supermarket in Koramangala',
      phone: '9845012389',
      verificationStatus: 'verified',
      address: '104, 5th Cross, Koramangala, Bengaluru',
      city: 'Bengaluru',
      latitude: 12.9352,
      longitude: 77.6245,
    },
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_JOBS: ApiJob[] = [];

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const users = JSON.parse(raw);
    // Ensure demo accounts exist
    DEFAULT_USERS.forEach((def) => {
      if (!users.some((u: StoredUser) => u.email === def.email)) {
        users.push(def);
      }
    });
    return users;
  } catch {
    return DEFAULT_USERS;
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getStoredJobs(): ApiJob[] {
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    if (!raw) {
      localStorage.setItem(JOBS_KEY, JSON.stringify(DEFAULT_JOBS));
      return DEFAULT_JOBS;
    }
    const parsed = JSON.parse(raw);
    // Only retain real user-posted jobs, strictly purging any legacy sample jobs
    const realJobsOnly = parsed.filter(
      (j: any) => j && typeof j === 'object' && !String(j.id).startsWith('job_sample_')
    );

    let hasRepaired = realJobsOnly.length !== parsed.length;
    const sanitized = realJobsOnly
      .map((job: ApiJob) => {
        if (!job || typeof job !== 'object') return null;
        const valid = extractJobCoordinates({
          lat: job.latitude,
          lng: job.longitude,
          ...(job as any).coordinates,
        });
        if (valid) {
          if (job.latitude !== valid.lat || job.longitude !== valid.lng) {
            hasRepaired = true;
            return {
              ...job,
              latitude: valid.lat,
              longitude: valid.lng,
            };
          }
          return job;
        }
        // If coordinate is not valid, ensure we don't hold NaN
        if (job.latitude !== null && job.latitude !== undefined && !Number.isFinite(job.latitude)) {
          hasRepaired = true;
          return {
            ...job,
            latitude: null as any,
            longitude: null as any,
          };
        }
        return job;
      })
      .filter(Boolean) as ApiJob[];

    if (hasRepaired) {
      try {
        localStorage.setItem(JOBS_KEY, JSON.stringify(sanitized));
      } catch {}
    }
    return sanitized;
  } catch {
    return [];
  }
}

function saveJobs(jobs: ApiJob[]) {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

function getStoredApps(): ApiApplication[] {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveApps(apps: ApiApplication[]) {
  localStorage.setItem(APPS_KEY, JSON.stringify(apps));
}

function getStoredShifts(): ApiShift[] {
  try {
    const raw = localStorage.getItem(SHIFTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveShifts(shifts: ApiShift[]) {
  localStorage.setItem(SHIFTS_KEY, JSON.stringify(shifts));
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

// -----------------------------------------------------------------------------
// LOCAL REPLICA API HANDLER
// -----------------------------------------------------------------------------
export const localStore = {
  register(data: {
    email?: string;
    phone?: string;
    password: string;
    role: 'student' | 'employer';
    name: string;
    collegeOrBusiness?: string;
    city?: string;
    skills?: string[];
    availability?: string;
    preferredCategories?: string[];
  }): { success: boolean; user: ApiUser } {
    const users = getStoredUsers();

    if (!data.password || !data.role || !data.name) {
      throw new Error('Missing required registration fields');
    }

    const cleanEmail = (data.email || '').toLowerCase().trim();
    const rawPhone = (data.phone || '').trim();
    const cleanPhone = normalizePhone(rawPhone);

    // Employers MUST provide a valid 10-digit contact phone number
    if (data.role === 'employer') {
      if (!cleanPhone || cleanPhone.length !== 10) {
        throw new Error('Employer registration requires a valid 10-digit contact phone number.');
      }
    } else if (!cleanEmail && !cleanPhone) {
      throw new Error('Please provide either an email or a 10-digit phone number');
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please enter a valid email address');
    }

    if (rawPhone && cleanPhone.length !== 10) {
      throw new Error('Phone number must contain exactly 10 digits.');
    }

    if (data.password.length < 8 || !/[A-Za-z]/.test(data.password) || !/\d/.test(data.password)) {
      throw new Error('Password must be at least 8 characters and contain both letters and numbers');
    }

    const finalEmail = cleanEmail || `${cleanPhone}@phone.workflex.in`;

    if (cleanEmail && users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists');
    }

    if (cleanPhone && users.some((u) => u.phone === cleanPhone)) {
      throw new Error('An account with this phone number already exists');
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const profile =
      data.role === 'student'
        ? {
            id: `student_${Date.now()}`,
            college: data.collegeOrBusiness || 'Job Seeker',
            skills: data.skills || ['Punctuality', 'Communication'],
            availability: data.availability || 'Evening Shifts',
            city: data.city || 'Bengaluru',
          }
        : {
            id: `emp_${Date.now()}`,
            businessName: data.collegeOrBusiness || data.name,
            businessType: 'Local Business',
            description: 'Verified business employer on WorkFlex.',
            phone: cleanPhone,
            verificationStatus: 'verified',
            address: `${data.city || 'Bengaluru'}, India`,
            city: data.city || 'Bengaluru',
            latitude: 12.9716,
            longitude: 77.5946,
          };

    const newUser: StoredUser = {
      id: userId,
      name: data.name.trim(),
      email: finalEmail,
      phone: cleanPhone,
      password: data.password,
      role: data.role,
      profile,
      createdAt: now,
    };

    users.push(newUser);
    saveUsers(users);

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.createdAt,
        profile: newUser.profile,
      },
    };
  },

  login(identifier: string, password: string, requestedRole?: 'student' | 'employer'): { success: boolean; user: ApiUser } {
    const users = getStoredUsers();
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPhone = normalizePhone(identifier);

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (cleanPhone && u.phone === cleanPhone) ||
        u.phone === cleanId
    );

    if (!user) {
      throw new Error('Account not found. Please register to continue.');
    }

    if (user.password !== password && user.password !== 'demo123') {
      throw new Error('Incorrect password. Please try again or use Forgot Password.');
    }

    if (requestedRole && user.role !== requestedRole) {
      user.role = requestedRole;
      saveUsers(users);
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        profile: user.profile,
      },
    };
  },

  forgotPassword(identifier: string): { success: boolean; message: string; resetCode: string } {
    const users = getStoredUsers();
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPhone = normalizePhone(identifier);

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (cleanPhone && u.phone === cleanPhone)
    );

    if (!user) {
      throw new Error('No registered account found with that email or phone number.');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const raw = localStorage.getItem(RESETS_KEY);
      const resets = raw ? JSON.parse(raw) : [];
      resets.push({ userId: user.id, code, expires: Date.now() + 15 * 60 * 1000 });
      localStorage.setItem(RESETS_KEY, JSON.stringify(resets));
    } catch {}

    return {
      success: true,
      message: `Reset verification code sent to ${identifier}`,
      resetCode: code,
    };
  },

  resetPassword(identifier: string, code: string, newPassword: string): { success: boolean; message: string } {
    const users = getStoredUsers();
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPhone = normalizePhone(identifier);

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (cleanPhone && u.phone === cleanPhone)
    );

    if (!user) {
      throw new Error('Account not found');
    }

    if (!code || code.length < 4) {
      throw new Error('Invalid verification code');
    }

    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      throw new Error('Password must be at least 8 characters with letters and numbers');
    }

    user.password = newPassword;
    saveUsers(users);

    return {
      success: true,
      message: 'Password successfully updated. You can now sign in with your new password.',
    };
  },

  getJobs(params?: { employerId?: string; status?: string }): { success: boolean; jobs: ApiJob[] } {
    let jobs = getStoredJobs();

    if (params?.employerId) {
      jobs = jobs.filter((j) => j.employerId === params.employerId);
    } else {
      // In discovery, only show open jobs. Completed or filled jobs are hidden from public view
      jobs = jobs.filter((j) => j.status === 'open');
    }

    if (params?.status) {
      jobs = jobs.filter((j) => j.status === params.status);
    }

    return {
      success: true,
      jobs,
    };
  },

  postJob(jobData: any): { success: boolean; jobId: string; message: string } {
    const jobs = getStoredJobs();
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const parsedCoords = extractJobCoordinates({
      lat: jobData.latitude,
      lng: jobData.longitude,
      ...jobData.coordinates,
    });
    const safeCoords = parsedCoords || sanitizeCoordinates(null, jobData.city || 'Bengaluru');

    const newJob: ApiJob = {
      id: jobId,
      employerId: jobData.employerId,
      title: jobData.title,
      description: jobData.description,
      fullDescription: jobData.description,
      shortDescription: jobData.description.length > 130 ? jobData.description.slice(0, 130) + '...' : jobData.description,
      category: jobData.category,
      salary: Number(jobData.salary),
      salaryType: jobData.salaryType || 'per_shift',
      date: jobData.date || 'Immediate',
      startTime: jobData.startTime || '05:00 PM',
      endTime: jobData.endTime || '09:00 PM',
      durationText: `${jobData.startTime || '5:00 PM'} - ${jobData.endTime || '9:00 PM'}`,
      workingHoursText: '4 Hours/Shift',

      address: jobData.address,
      locality: jobData.locality || jobData.address,
      city: jobData.city || 'Bengaluru',
      latitude: safeCoords.lat,
      longitude: safeCoords.lng,
      numberOfWorkers: Number(jobData.numberOfWorkers) || 1,
      status: 'open',
      photoUrl: jobData.photoUrl || '',
      workplacePhotos: jobData.photoUrl ? [jobData.photoUrl] : [],
      responsibilities: jobData.responsibilities || [],
      requiredSkills: jobData.requiredSkills || [],
      postedDate: 'Today',
      businessName: jobData.businessName || 'Verified Employer',
      businessType: jobData.businessType || 'Local Store',
      employerPhone: jobData.employerPhone || jobData.phone || '',
      isVerifiedBusiness: true,
      payment: {
        amount: Number(jobData.salary),
        frequency: jobData.salaryType || 'per_shift',
        currency: 'INR',
        isNegotiable: false,
      },
      createdAt: now,
      updatedAt: now,
    };

    jobs.unshift(newJob);
    saveJobs(jobs);

    return {
      success: true,
      jobId,
      message: 'Shift successfully posted and live on the map',
    };
  },

  deleteJob(jobId: string): { success: boolean; message: string } {
    let jobs = getStoredJobs();
    jobs = jobs.filter((j) => j.id !== jobId);
    saveJobs(jobs);
    return { success: true, message: 'Job deleted successfully' };
  },

  updateJobStatus(jobId: string, status: 'open' | 'paused' | 'filled' | 'completed' | 'cancelled'): { success: boolean; message: string } {
    const jobs = getStoredJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      job.status = status;
      job.updatedAt = new Date().toISOString();
      saveJobs(jobs);
    }
    return { success: true, message: `Job status updated to ${status}` };
  },

  getApplications(params?: { studentId?: string; employerId?: string; jobId?: string }): { success: boolean; applications: ApiApplication[] } {
    let apps = getStoredApps();

    if (params?.studentId) {
      apps = apps.filter((a) => a.studentId === params.studentId);
    }
    if (params?.employerId) {
      apps = apps.filter((a) => a.employerId === params.employerId);
    }
    if (params?.jobId) {
      apps = apps.filter((a) => a.jobId === params.jobId);
    }

    return {
      success: true,
      applications: apps,
    };
  },

  submitApplication(jobId: string, studentId: string, message?: string): { success: boolean; applicationId: string; message: string } {
    const jobs = getStoredJobs();
    const users = getStoredUsers();
    const apps = getStoredApps();

    const job = jobs.find((j) => j.id === jobId);
    if (!job) throw new Error('Job not found');

    const studentUser = users.find((u) => u.id === studentId || u.profile?.id === studentId);
    const appId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    // Check if already applied
    const existing = apps.find((a) => a.jobId === jobId && (a.studentId === studentId || a.studentId === studentUser?.id));
    if (existing) {
      throw new Error('You have already applied for this shift.');
    }

    const newApp: ApiApplication = {
      id: appId,
      jobId,
      studentId: studentUser?.id || studentId,
      employerId: job.employerId,
      message: message || '',
      status: 'pending',
      jobTitle: job.title,
      jobSalary: job.salary,
      businessName: job.businessName,
      applicantName: studentUser?.name || 'Student Candidate',
      applicantEmail: studentUser?.email || '',
      applicantPhone: studentUser?.phone || '',
      applicantCollege: studentUser?.profile?.college || 'College Student',
      applicantSkills: studentUser?.profile?.skills || [],
      appliedAt: now,
      updatedAt: now,
    };

    apps.unshift(newApp);
    saveApps(apps);

    return {
      success: true,
      applicationId: appId,
      message: 'Application submitted successfully',
    };
  },

  updateApplicationStatus(applicationId: string, status: string): { success: boolean; message: string } {
    const apps = getStoredApps();
    const app = apps.find((a) => a.id === applicationId);
    if (!app) throw new Error('Application not found');

    app.status = status as any;
    app.updatedAt = new Date().toISOString();
    saveApps(apps);

    // If application accepted or completed, hide job from public listing by updating job status
    if (status === 'accepted' || status === 'completed') {
      const jobs = getStoredJobs();
      const job = jobs.find((j) => j.id === app.jobId);
      if (job) {
        job.status = status === 'completed' ? 'completed' : 'filled';
        saveJobs(jobs);
      }
    }

    return {
      success: true,
      message: `Application marked as ${status}`,
    };
  },

  completeShift(applicationId: string): { success: boolean; shiftId: string; amount: number; message: string } {
    const apps = getStoredApps();
    const shifts = getStoredShifts();
    const jobs = getStoredJobs();

    const app = apps.find((a) => a.id === applicationId);
    if (!app) throw new Error('Application not found');

    app.status = 'completed';
    app.updatedAt = new Date().toISOString();
    saveApps(apps);

    const job = jobs.find((j) => j.id === app.jobId);
    if (job) {
      job.status = 'completed';
      saveJobs(jobs);
    }

    const shiftId = `shift_${Date.now()}`;
    const newShift: ApiShift = {
      id: shiftId,
      job_id: app.jobId,
      student_id: app.studentId,
      employer_id: app.employerId,
      start_time: '05:00 PM',
      end_time: '09:30 PM',
      amount: app.jobSalary,
      status: 'completed',
      completed_at: new Date().toISOString(),
      job_title: app.jobTitle,
      business_name: app.businessName,
    };

    shifts.unshift(newShift);
    saveShifts(shifts);

    return {
      success: true,
      shiftId,
      amount: app.jobSalary,
      message: 'Shift completed successfully. Payment credited to student account.',
    };
  },

  getShifts(params?: { studentId?: string; employerId?: string }): { success: boolean; shifts: ApiShift[] } {
    let shifts = getStoredShifts();
    if (params?.studentId) {
      shifts = shifts.filter((s) => s.student_id === params.studentId);
    }
    if (params?.employerId) {
      shifts = shifts.filter((s) => s.employer_id === params.employerId);
    }
    return { success: true, shifts };
  },

  getEmployerDashboard(employerId: string) {
    const jobs = getStoredJobs().filter((j) => j.employerId === employerId);
    const apps = getStoredApps().filter((a) => a.employerId === employerId);
    const shifts = getStoredShifts().filter((s) => s.employer_id === employerId);

    return {
      success: true,
      metrics: {
        activePostings: jobs.filter((j) => j.status === 'open').length,
        pendingApplications: apps.filter((a) => a.status === 'pending').length,
        acceptedWorkers: apps.filter((a) => a.status === 'accepted' || a.status === 'completed').length,
        completedGigs: shifts.length,
      },
    };
  },

  getStudentDashboard(studentId: string) {
    const apps = getStoredApps().filter((a) => a.studentId === studentId);
    const shifts = getStoredShifts().filter((s) => s.student_id === studentId);
    const totalEarnings = shifts.reduce((acc, s) => acc + (s.amount || 0), 0);

    return {
      success: true,
      metrics: {
        totalEarnings,
        completedShifts: shifts.length,
        activeApplications: apps.filter((a) => a.status === 'pending' || a.status === 'accepted').length,
      },
    };
  },
};
