"use server";

import { createClient } from "@/lib/supabase/server";

export type SubmitSupportTicketResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const MAX_SUBJECT = 140;
const MAX_MESSAGE = 4000;

export async function submitSupportTicket(formData: FormData): Promise<SubmitSupportTicketResult> {
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!subject) return { ok: false, error: "Please add a subject." };
  if (!message) return { ok: false, error: "Please describe the problem." };
  if (subject.length > MAX_SUBJECT) return { ok: false, error: `Subject must be ≤ ${MAX_SUBJECT} characters.` };
  if (message.length > MAX_MESSAGE) return { ok: false, error: `Message must be ≤ ${MAX_MESSAGE} characters.` };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      user_id: user.id,
      user_email: user.email ?? "",
      subject: subject.slice(0, MAX_SUBJECT),
      message: message.slice(0, MAX_MESSAGE),
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "Could not submit ticket." };
  return { ok: true, id: data.id };
}
