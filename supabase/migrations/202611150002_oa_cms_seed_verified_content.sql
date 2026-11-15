-- Supplemental verified-content settings for Oxford CMS.
-- The core migration already creates and seeds programmes, services, tests,
-- branches, news, gallery and navigation. This file only fills missing
-- company/branding/homepage metadata and corrects a verified gallery URL.
-- Existing administrator edits take precedence when this migration is replayed.

insert into public.oa_cms_site_settings(setting_key,setting_value)
values
('branding',jsonb_build_object(
  'brand_name','OXFORD',
  'brand_subtitle','ACADEMIC INSTRUCTION PVT. LTD.',
  'logo_url','https://gsfhhvkipvoutqqgyick.supabase.co/storage/v1/object/public/oa-academy-media/branding/1794111699180-WhatsApp-Image-2026-11-08-at-9.03.23-AM.jpeg',
  'hero_image_url','https://gsfhhvkipvoutqqgyick.supabase.co/storage/v1/object/public/oa-academy-media/branding/1794201976743-images.jpeg',
  'tagline','Learn. Prepare. Progress.'
)),
('company',jsonb_build_object(
  'legal_name','OXFORD ACADEMIC INSTRUCTION PVT. LTD.',
  'intro','Oxford Academic Instruction Pvt. Ltd. supports learners and families through Japanese and Korean language programmes, examination preparation and practical guidance for Japan-related study and work pathways.',
  'vision','To be a trusted education and guidance centre that connects learners in Nepal with meaningful learning opportunities, international understanding and well-prepared future pathways.',
  'mission','To provide clear, learner-focused language education and practical guidance that helps students make informed decisions about study, work and family pathways connected with Japan.',
  'goals','Offer structured Japanese and Korean language learning; explain Japan-related study and work pathways in clear terms; support careful document preparation; encourage informed decisions; and continue improving our service through feedback from learners and families.',
  'leadership','Every learner begins with a different background, goal and set of questions. At Oxford, we believe the right guidance starts by listening, explaining the available options clearly and helping each person understand the next practical step. We welcome learners and families to speak with our team about language classes, study plans and Japan-related guidance.'
)),
('homepage',jsonb_build_object(
  'eyebrow','OXFORD ACADEMIC INSTRUCTION PVT. LTD.',
  'title','Build Your Future',
  'accent','With Confidence.',
  'description','Explore language learning, examination preparation and practical guidance for your next academic or professional step.',
  'primaryCta','Explore Programs',
  'secondaryCta','Contact Oxford',
  'heroImage','https://gsfhhvkipvoutqqgyick.supabase.co/storage/v1/object/public/oa-academy-media/branding/1794201976743-images.jpeg'
))
on conflict(setting_key) do update
set setting_value=excluded.setting_value || public.oa_cms_site_settings.setting_value,
    updated_at=now();

-- Correct the source URL for the existing published Oxford Academy photograph.
update public.oa_cms_gallery_images
set image_url='https://gsfhhvkipvoutqqgyick.supabase.co/storage/v1/object/public/oa-academy-media/content/1794089434010-568624252_1398264098759852_4852395577372441262_n.jpg',
    alt_text='Oxford Academy students'
where title='Oxford Academy';

insert into public.oa_cms_seo_metadata(page_path,title,description,no_index)
values
('/','Oxford Academic Instruction Pvt. Ltd.','Japanese and Korean language programmes, examination preparation and Japan-related study and work guidance.',false),
('/about','About Oxford Academic Instruction','Learn about Oxford Academic Instruction, its approach and branches.',false),
('/programs','Japanese and Korean Language Programmes','Explore Japanese N5–N1 and Korean language learning programmes.',false),
('/services','Study, Work and Language Guidance','Explore Oxford Academic Instruction services and Japan-related guidance.',false),
('/examinations','Japanese Examination Preparation','Information about Japanese language examinations and preparation.',false),
('/branches','Oxford Academy Branches','Contact Oxford Academic Instruction in Kushma and Baglung.',false)
on conflict(page_path) do nothing;

-- No FAQs, events, testimonials, student-success metrics or unverified team
-- credentials are seeded because approved source records were not supplied.
