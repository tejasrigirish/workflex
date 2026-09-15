// src/api/client.ts
// Frontend typed HTTP client for WorkFlex SQLite Backend

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

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Network request failed');
  }

  return data as T;
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
    return request<{ success: boolean; user: ApiUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async login(identifier: string, password: string, role?: 'student' | 'employer') {
    return request<{ success: boolean; user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, role }),
    });
  },

  async forgotPassword(identifier: string) {
    return request<{ success: boolean; message: string; resetCode?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  },

  async resetPassword(identifier: string, code: string, newPassword: string) {
    return request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, code, newPassword }),
    });
  },

  // Jobs
  async getJobs(params?: { employerId?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return request<{ success: boolean; jobs: ApiJob[] }>(`/jobs${query ? `?${query}` : ''}`);
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
  }) {
    return request<{ success: boolean; jobId: string; message: string }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  async deleteJob(jobId: string) {
    return request<{ success: boolean; message: string }>(`/jobs/${jobId}`, {
      method: 'DELETE',
    });
  },

  async updateJobStatus(jobId: string, status: 'open' | 'paused' | 'filled' | 'completed' | 'cancelled') {
    return request<{ success: boolean; message: string }>(`/jobs/${jobId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Applications
  async getApplications(params?: { studentId?: string; employerId?: string; jobId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return request<{ success: boolean; applications: ApiApplication[] }>(
      `/applications${query ? `?${query}` : ''}`
    );
  },

  async submitApplication(jobId: string, studentId: string, message?: string) {
    return request<{ success: boolean; applicationId: string; message: string }>('/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId, studentId, message }),
    });
  },

  async updateApplicationStatus(applicationId: string, status: string) {
    return request<{ success: boolean; message: string }>(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Shifts
  async completeShift(applicationId: string) {
    return request<{ success: boolean; shiftId: string; amount: number; message: string }>(
      '/shifts/complete',
      {
        method: 'POST',
        body: JSON.stringify({ applicationId }),
      }
    );
  },

  async getShifts(params?: { studentId?: string; employerId?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return request<{ success: boolean; shifts: ApiShift[] }>(`/shifts${query ? `?${query}` : ''}`);
  },

  // Dashboard Aggregates
  async getEmployerDashboard(employerId: string) {
    return request<{
      success: boolean;
      metrics: {
        activePostings: number;
        pendingApplications: number;
        acceptedWorkers: number;
        completedGigs: number;
      };
    }>(`/dashboard/employer/${employerId}`);
  },

  async getStudentDashboard(studentId: string) {
    return request<{
      success: boolean;
      metrics: {
        totalEarnings: number;
        completedShifts: number;
        activeApplications: number;
      };
    }>(`/dashboard/student/${studentId}`);
  },
};
