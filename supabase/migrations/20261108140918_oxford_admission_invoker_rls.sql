-- Move public admission submission from SECURITY DEFINER to SECURITY INVOKER.
-- The caller can insert only when the table grant and the validated INSERT
-- policy both allow it. The separate follow-up migration grants INSERT only.

drop function if exists public.oa_submit_admission(text, text, text, text, text, text);

create function public.oa_submit_admission(
  p_student_name text,
  p_guardian_name text,
  p_phone text,
  p_email text,
  p_message text,
  p_branch_name text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  clean_name text := btrim(coalesce(p_student_name, ''));
  clean_phone text := btrim(coalesce(p_phone, ''));
  clean_branch text := btrim(coalesce(p_branch_name, ''));
  clean_email text := nullif(btrim(coalesce(p_email, '')), '');
  clean_guardian text := nullif(btrim(coalesce(p_guardian_name, '')), '');
  clean_message text := nullif(btrim(coalesce(p_message, '')), '');
begin
  if char_length(clean_name) < 2 or char_length(clean_name) > 100 then
    raise exception 'Please enter a valid student name.';
  end if;

  if char_length(clean_phone) < 6 or char_length(clean_phone) > 30 then
    raise exception 'Please enter a valid contact number.';
  end if;

  if clean_email is not null and (
    char_length(clean_email) > 160
    or clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ) then
    raise exception 'Please enter a valid email address.';
  end if;

  if clean_guardian is not null and char_length(clean_guardian) > 100 then
    raise exception 'Guardian name is too long.';
  end if;

  if clean_message is not null and char_length(clean_message) > 5000 then
    raise exception 'Your message is too long.';
  end if;

  if clean_branch = '' or not exists (
    select 1
    from public.oa_branches b
    where b.branch_name = clean_branch
      and b.is_active = true
  ) then
    raise exception 'Please select an active academy branch.';
  end if;

  insert into public.oa_admissions (
    student_name, guardian_name, phone, email, message, branch_name
  )
  values (
    clean_name, clean_guardian, clean_phone, clean_email, clean_message, clean_branch
  );
end;
$function$;

drop policy if exists "oa admissions public validated submit" on public.oa_admissions;

create policy "oa admissions public validated submit"
on public.oa_admissions
for insert
to anon, authenticated
with check (
  char_length(btrim(student_name)) >= 2
  and char_length(btrim(student_name)) <= 100
  and char_length(btrim(phone)) >= 6
  and char_length(btrim(phone)) <= 30
  and (
    email is null
    or (
      char_length(btrim(email)) <= 160
      and btrim(email) ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
  )
  and (guardian_name is null or char_length(btrim(guardian_name)) <= 100)
  and (message is null or char_length(btrim(message)) <= 5000)
  and btrim(branch_name) <> ''
  and exists (
    select 1
    from public.oa_branches b
    where b.branch_name = oa_admissions.branch_name
      and b.is_active = true
  )
  and status = 'new'
);
