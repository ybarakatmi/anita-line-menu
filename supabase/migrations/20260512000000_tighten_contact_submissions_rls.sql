-- Tighten contact_submissions SELECT: only owners and managers may read submissions.
-- Replaces the previous "any authenticated user" policy.

drop policy if exists "contact_submissions_authenticated_select" on public.contact_submissions;

create policy "contact_submissions_staff_select"
  on public.contact_submissions for select
  to authenticated
  using (
    exists (
      select 1 from public.console_profiles p
      where p.user_id = auth.uid()
        and p.role in ('owner', 'manager')
    )
  );
