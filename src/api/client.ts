// src/api/client.ts
// Frontend typed HTTP client for WorkFlex with automatic Vercel / offline fallback

import { localStore } from './localStore';

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'student' | 'employer';
  createdAt: string;
  profile?: any;
}

export interface ApiJob {
  id: string;
  employerId: string;
  title: string;
  description: string;
  fullDescription: string;
  shortDescription: string;
  category: string;
  salary: number;
  salaryType: string;
  date: string;
  startTime: string;
  endTime: string;
  durationText: string;
  workingHoursText: string;
  address: string;
  locality: string;
  city: string;
  latitude: number;
  longitude: number;
  numberOfWorkers: number;
  status: string;
  photoUrl: string;
  workplacePhotos: string[];
  responsibilities: string[];
  requiredSkills: string[];
  postedDate: string;
  businessName: string;
  businessType: string;
  isVerifiedBusiness: boolean;
  payment: {
    amount: number;
    frequency: string;
    currency: string;
    isNegotiable: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiApplication {
  id: string;
  jobId: string;
  studentId: string;
  employerId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'completed';
  jobTitle: string;
  jobSalary: number;
  businessName: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantCollege: string;
  applicantSkills: string[];
  appliedAt: string;
  updatedAt: string;
}

export interface ApiShift {
  id: string;
  job_id: string;
  student_id: string;
  employer_id: string;
  start_time: string;
  end_time: string;
  amount: number;
  status: string;
  completed_at: string;
  job_title?: string;
  business_name?: string;
}

const BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const contentType = response.headers.get('content-type') || '';

    // If response is not JSON (e.g. Vercel 404 HTML: "The page could not be found...")
    if (!contentType.includes('application/json')) {
      const serverErr = new Error('SERVER_UNAVAILABLE');
      (serverErr as any).isServerUnavailable = true;
      throw serverErr;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Network request failed');
    }

    return data as T;
  } catch (err: any) {
    if (
      err.isServerUnavailable ||
      err.message === 'SERVER_UNAVAILABLE' ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('NetworkError') ||
      err.message?.includes('Unexpected token') ||
      err.message?.includes('JSON') ||
      err.name === 'TypeError'
    ) {
      const fallbackErr = new Error('SERVER_UNAVAILABLE');
      (fallbackErr as any).isServerUnavailable = true;
      throw fallbackErr;
    }
    throw err;
  }
}

export const api = {
  // Auth
  async register(params: {
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
  }) {
    try {
      return await request<{ success: boolean; user: ApiUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (err: any) {
      if (err.isServerUnavailable) {
        return localStore.register(params);
      }
      throw err;
    }
  },

  async login(identifier: string, password: string, role?: 'student' | 'employer') {
    try {
      return await request<{ success: boolean; user: ApiUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password, role }),
      });
    } catch (err: any) {
      if (err.isServerUnavailable) {
        return localStore.login(identifier, password, role);
      }
      throw err;
    }
  },

  async forgotPassword(identifier: string) {
    try {
      return await request<{ success: boolean; message: string; resetCode?: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ identifier }),
      });
    } catch (err: any) {
      if (err.isServerUnavailable) {
        return localStore.forgotPassword(identifier);
      }
      throw err;
    }
  },

  async resetPassword(identifier: string, code: string, newPassword: string) {
    try {
      return await request<{ success: boolean; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ identifier, code, newPassword }),
      });
    } catch (err: any) {
      if (err.isServerUnavailable) {
        return localStore.resetPassword(identifier, code, newPassword);
      }
      throw err;
    }
  },

  // Jobs
  async getJobs(params?: { employerId?: string; status?: string }) {
    try {
      const query = new URLSearchParams(params as any).toString();
      return await request<{ success: boolean; jobs: ApiJob[] }>(`/jobs${query ? `?${query}` : ''}`);
    } catch (err: any) {
      if (err.isServerUnavailable) {
        return localStore.getJobs(params);
      }
      throw err;
    }
  },

  async postJob(jobData: {
    employerId: string;
    title: string;
    description: string;
    category: string;
    salary: number;
    salaryType?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    address: string;
    locality?: string;
    city?: string;
    latitude: number;
    longitude: number;
    numberOfWorkers?: number;
    photoUrl?: string;
    responsibilities?: string[];
    requiredSkills?: string[];
    businessName?: string;
    businessType?: string;
  }) {
    try {
      return await request<{ success: boolean; jobId: string; message: string }>('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      });
    } catch (err: any) {
      if (err.isServerUnavailable) {
        return localStore.postJob(jobData);
      }
      throw err;
    }
  },

  async deleteJob(jobId: string) {
    try {
      return await request<{ success: boolean; message: string }>(`/jobs/${jobId}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (err.isServerUnavailable) {
        return localStore.deleteJob(jobId);
      }
      throw err;
    }
  },

  async updateJobStatus(jobId: string, status: 'open' | 'paused' | 'filled' | 'completed' | 'cancelled') {
    try {
      return await request<{ success: boolean; message: string }>(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (err: any) {
      if (err.isServerUnavailable) {
        return localStore.updateJobStatus(jobId, status);
      }
      throw err;
    }
  },

  // Applications
  async getApplications(params?: { studentId?: string; employerId?: string; jobId?: string }) {
    try {
      const query = new URLSearchParams(params as any).toString();
      return await request<{ success: boolean; applications: ApiApplication[] }>(
        `/applications${query ? `?${query}` : ''}`
      );
    } catch (err: any) {
      if (err.isServerUnavailable) {
        return localStore.getApplications(params);
      }
      throw err;
    }
  },

  async submitApplication(jobId: string, studentId: string, message?: string) {
    try {
      return await request<{ success: boolean; applicationId: string; message: string }>('/applications', {
        method: 'POST',
        body: JSON.stringify({ jobId, studentId, message }),
      });
    } catch (err: any) {
      if (err.isServerUnavailable) {
        return localStore.submitApplication(jobId, studentId, message);
      }
      throw err;
    }
  },

  async updateApplicationStatus(applicationId: string, status: string) {
    try {
      return await request<{ success: boolean; message: string }>(`/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (err: any) {
      if (err.isServerUnavailable) {
        return localStore.updateApplicationStatus(applicationId, status);
      }
      throw err;
    }
  },

  // Shifts
  async completeShift(applicationId: string) {
    try {
      return await request<{ success: boolean; shiftId: string; amount: number; message: string }>(
        '/shifts/complete',
        {
          method: 'POST',
          body: JSON.stringify({ applicationId }),
        }
      );
    } catch (err: any) {
      if (err.isServerUnavailable) {
        return localStore.completeShift(applicationId);
      }
      throw err;
    }
  },

  async getShifts(params?: { studentId?: string; employerId?: string }) {
    try {
      const query = new URLSearchParams(params as any).toString();
      return await request<{ success: boolean; shifts: ApiShift[] }>(`/shifts${query ? `?${query}` : ''}`);
    } catch (err: any) {
      if (err.isServerUnavailable) {
        return localStore.getShifts(params);
      }
      throw err;
    }
  },

  // Dashboard Aggregates
  async getEmployerDashboard(employerId: string) {
    try {
      return await request<{
        success: boolean;
        metrics: {
          activePostings: number;
          pendingApplications: number;
          acceptedWorkers: number;
          completedGigs: number;
        };
      }>(`/dashboard/employer/${employerId}`);
    } catch (err: any) {
      if (err.isServerUnavailable) {
        return localStore.getEmployerDashboard(employerId);
      }
      throw err;
    }
  },

  async getStudentDashboard(studentId: string) {
    try {
      return await request<{
        success: boolean;
        metrics: {
          totalEarnings: number;
          completedShifts: number;
          activeApplications: number;
        };
      }>(`/dashboard/student/${studentId}`);
    } catch (err: any) {
      if (err.isServerUnavailable) {
        return localStore.getStudentDashboard(studentId);
      }
      throw err;
    }
  },
};
