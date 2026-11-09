-- Public visitors may submit learner testimonials, but submissions remain pending.
-- The existing admin-only ALL policy continues to control moderation and edits.

grant insert (
  student_name,
  course_name,
  quote_en,
  location,
  photo_url,
  is_published,
  sort_order
) on table public.oa_testimonials to anon, authenticated;

create policy "oa testimonials public pending submit"
on public.oa_testimonials
for insert
to anon, authenticated
with check (
  char_length(btrim(student_name)) between 2 and 100
  and char_length(btrim(course_name)) between 2 and 120
  and char_length(btrim(quote_en)) between 15 and 1200
  and char_length(btrim(location)) <= 120
  and photo_url = ''
  and is_published = false
  and sort_order = 0
);
