-- Replace the privileged public admission RPC with an invoker function.
-- RLS performs field and active-branch validation while the browser receives
-- INSERT-only permission on the enquiry fields that the admission form needs.
DROP FUNCTION IF EXISTS public.oa_submit_admission(text,text,text,text,text,text);

DROP POLICY IF EXISTS "oa admissions public validated submit" ON public.oa_admissions;
CREATE POLICY "oa admissions public validated submit"
  ON public.oa_admissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(btrim(student_name)) BETWEEN 2 AND 100
    AND char_length(btrim(phone)) BETWEEN 6 AND 30
    AND (
      email IS NULL OR (
        char_length(btrim(email)) <= 160
        AND btrim(email) ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      )
    )
    AND (guardian_name IS NULL OR char_length(btrim(guardian_name)) <= 100)
    AND (message IS NULL OR char_length(btrim(message)) <= 5000)
    AND btrim(branch_name) <> ''
    AND EXISTS (
      SELECT 1 FROM public.oa_branches b
      WHERE b.branch_name = oa_admissions.branch_name AND b.is_active = true
    )
    AND status = 'new'
  );

GRANT INSERT (student_name, guardian_name, phone, email, message, branch_name)
  ON public.oa_admissions TO anon, authenticated;

CREATE FUNCTION public.oa_submit_admission(
  p_student_name text,
  p_guardian_name text,
  p_phone text,
  p_email text,
  p_message text,
  p_branch_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO ''
AS $function$
DECLARE
  clean_name text := btrim(coalesce(p_student_name, ''));
  clean_phone text := btrim(coalesce(p_phone, ''));
  clean_branch text := btrim(coalesce(p_branch_name, ''));
  clean_email text := nullif(btrim(coalesce(p_email, '')), '');
  clean_guardian text := nullif(btrim(coalesce(p_guardian_name, '')), '');
  clean_message text := nullif(btrim(coalesce(p_message, '')), '');
BEGIN
  IF char_length(clean_name) < 2 OR char_length(clean_name) > 100 THEN
    RAISE EXCEPTION 'Please enter a valid student name.';
  END IF;
  IF char_length(clean_phone) < 6 OR char_length(clean_phone) > 30 THEN
    RAISE EXCEPTION 'Please enter a valid contact number.';
  END IF;
  IF clean_email IS NOT NULL AND (
    char_length(clean_email) > 160
    OR clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ) THEN
    RAISE EXCEPTION 'Please enter a valid email address.';
  END IF;
  IF clean_guardian IS NOT NULL AND char_length(clean_guardian) > 100 THEN
    RAISE EXCEPTION 'Guardian name is too long.';
  END IF;
  IF clean_message IS NOT NULL AND char_length(clean_message) > 5000 THEN
    RAISE EXCEPTION 'Your message is too long.';
  END IF;
  IF clean_branch = '' OR NOT EXISTS (
    SELECT 1 FROM public.oa_branches b
    WHERE b.branch_name = clean_branch AND b.is_active = true
  ) THEN
    RAISE EXCEPTION 'Please select an active academy branch.';
  END IF;
  INSERT INTO public.oa_admissions (
    student_name, guardian_name, phone, email, message, branch_name
  )
  VALUES (
    clean_name, clean_guardian, clean_phone, clean_email, clean_message, clean_branch
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.oa_submit_admission(text,text,text,text,text,text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.oa_submit_admission(text,text,text,text,text,text)
  TO anon, authenticated;
