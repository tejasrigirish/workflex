export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface JobApplication {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentCollege: string;
  studentAvatar: string;
  studentSkills: string[];
  appliedAt: string;
  status: ApplicationStatus;
  coverNote?: string;
  employerNotes?: string;
  jobTitle?: string;
  businessName?: string;
  jobSalary?: number;
  paidAmount?: number;
  paidAt?: string;
}

export interface EarningRecord {
  id: string;
  jobId: string;
  jobTitle: string;
  businessName: string;
  amount: number;
  completedDate: string;
  status: 'paid' | 'pending';
  receiptNumber: string;
}
