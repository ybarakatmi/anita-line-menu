export type ContactSubmissionRow = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  phone: string | null;
  country: string | null;
  message: string | null;
  created_at: string;
};
