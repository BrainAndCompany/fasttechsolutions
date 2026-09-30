export type UserRole = "candidate" | "hr" | "admin";

export type JobStatus = "draft" | "published" | "closed";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "temporary";

export type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "interview"
  | "offer"
  | "hired"
  | "rejected"
  | "withdrawn";

export type EmploymentStatus =
  | "employed"
  | "unemployed"
  | "notice_period"
  | "student"
  | "other";

export type QuestionInputType = "text" | "textarea" | "yes_no";

export type EducationEntry = {
  degree: string;
  institution: string;
  year?: string;
  field?: string;
};

export type ExperienceEntry = {
  company: string;
  title: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
};

export type ProjectEntry = {
  name: string;
  description?: string;
  url?: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  iqama_number: string | null;
  iqama_expiry: string | null;
  passport_number: string | null;
  passport_expiry: string | null;
  employment_status: EmploymentStatus | null;
  current_employer: string | null;
  current_job_title: string | null;
  years_experience: number | null;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  profile_updated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Job = {
  id: string;
  title: string;
  slug: string;
  department: string | null;
  location: string | null;
  employment_type: EmploymentType;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  status: JobStatus;
  created_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type JobQuestion = {
  id: string;
  job_id: string;
  prompt: string;
  input_type: QuestionInputType;
  required: boolean;
  sort_order: number;
  created_at?: string;
};

export type ApplicationAnswer = {
  id: string;
  application_id: string;
  question_id: string;
  answer_text: string;
  created_at?: string;
};

export type Application = {
  id: string;
  job_id: string;
  user_id: string;
  cover_note: string | null;
  cv_path: string;
  cv_file_name: string | null;
  status: ApplicationStatus;
  hr_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationEvent = {
  id: string;
  application_id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string | null;
  note: string | null;
  created_at: string;
};

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "interview",
  "offer",
  "hired",
  "rejected",
  "withdrawn",
];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full time",
  part_time: "Part time",
  contract: "Contract",
  temporary: "Temporary",
};

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  employed: "Employed",
  unemployed: "Unemployed",
  notice_period: "On notice period",
  student: "Student",
  other: "Other",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** Required before applying to any job. */
export function isProfileReadyToApply(
  profile: Pick<
    Profile,
    "full_name" | "phone" | "iqama_number" | "iqama_expiry"
  >,
): boolean {
  return Boolean(
    profile.full_name?.trim() &&
      profile.phone?.trim() &&
      profile.iqama_number?.trim() &&
      profile.iqama_expiry,
  );
}

export function normalizeJsonArray<T>(value: unknown): T[] {
  if (!Array.isArray(value)) return [];
  return value as T[];
}
