-- Verified public Oxford content seed. No testimonials, events, FAQs, schedules, fees or staff roles are fabricated.
-- All inserts are isolated to the new oa_cms_* CMS tables.

insert into public.oa_cms_programs
(slug,title,category,level_label,summary,overview,topics,image_url,status,sort_order)
values
('japanese-n5','Japanese N5','Japanese','Beginner','Build foundational scripts, basic vocabulary and simple everyday expressions.','Explore the beginner level of the Japanese language programme. Ask Oxford about the current class plan and enrolment availability.','["Hiragana and katakana foundations","Basic vocabulary","Simple grammar patterns","Everyday expressions","Introductory listening and reading"]'::jsonb,'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85','published',1),
('japanese-n4','Japanese N4','Japanese','Elementary','Develop elementary Japanese grammar, vocabulary and comprehension for familiar situations.','Explore the elementary level of the Japanese language programme. Ask Oxford about the current class plan and enrolment availability.','["Elementary grammar","Expanded vocabulary and kanji","Reading familiar texts","Listening to everyday exchanges","Practical communication"]'::jsonb,'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=85','published',2),
('japanese-n3','Japanese N3','Japanese','Intermediate','Strengthen practical communication and comprehension of Japanese used in familiar situations.','Explore the intermediate level of the Japanese language programme. Ask Oxford about the current class plan and enrolment availability.','["Intermediate grammar","Reading comprehension","Listening comprehension","Vocabulary development","Practical communication"]'::jsonb,'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=85','published',3),
('japanese-n2','Japanese N2','Japanese','Upper-intermediate','Build comprehension for more complex Japanese texts and conversations.','Explore the upper-intermediate level listed in Oxford’s Japanese N5–N1 programme. Confirm current classes and availability with the academy.','["Advanced grammar patterns","Complex reading","Listening across contexts","Vocabulary and kanji","Formal and informal communication"]'::jsonb,'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=1200&q=85','published',4),
('japanese-n1','Japanese N1','Japanese','Advanced','Develop advanced reading, listening and communication skills for complex contexts.','Explore the advanced level listed in Oxford’s Japanese N5–N1 programme. Confirm current classes and availability with the academy.','["Advanced reading comprehension","Complex listening","Nuanced vocabulary","High-level grammar","Complex-context communication"]'::jsonb,'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=1200&q=85','published',5),
('korean-language','Korean Language','Korean','Language programme','Explore Oxford’s Korean language programme and ask about current levels and learning options.','Oxford lists Korean Language as one of its learning programmes. Contact the academy for the current class level, schedule, course structure and enrolment information.','["Programme information","Current learning levels","Course schedule information","Enrolment enquiry and follow-up"]'::jsonb,'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=85','published',6)
on conflict (slug) do nothing;

insert into public.oa_cms_services
(slug,title,category,summary,body,highlights,steps,disclaimer,status,sort_order)
values
('student-visa','Student Visa & Study in Japan Guidance','Study in Japan','Explore Japanese language schools and further-study options with guidance on school selection, applications and documentation.','Planning to study in Japan involves understanding the education system, language expectations, application stages, financial documentation and practical realities of living and studying abroad.',['Study and career counselling','Information about Japanese language schools','School selection guidance','Application-stage information','Document checklists','Interview preparation','Follow-up guidance']::jsonb,'[]'::jsonb,'School admission, Certificate of Eligibility and visa decisions are made by relevant institutions and Japanese authorities. Requirements can change. Admission or visa approval is not guaranteed.','published',1),
('working-visa-language','Language Preparation for Working in Japan','Work in Japan','Build practical Japanese language skills and understand preparation steps relevant to employment pathways.','Language preparation helps learners develop communication skills for daily life and workplace situations. Oxford can discuss goals and information to verify for a chosen route.',['Japanese communication skills','Workplace vocabulary','Listening and speaking practice','Language-test guidance','Planning support']::jsonb,'[]'::jsonb,'A language course does not provide a job offer or work visa. Work eligibility and visa approval depend on the category, employer and Japanese authorities.','published',2),
('ssw','Specified Skilled Worker (SSW) Guidance','Work in Japan','Understand Japanese language and skills preparation relevant to the Specified Skilled Worker pathway.','The SSW pathway can involve Japanese language preparation and a skills assessment for the selected work sector.',['SSW pathway introduction','Japanese-language preparation','Language-test guidance','Sector-specific skills-assessment information','Application-information organisation']::jsonb,'[]'::jsonb,'SSW categories, tests, conditions and eligibility can change. Training does not guarantee test results, employment or visa approval.','published',3),
('dependent-visa','Dependent Visa Guidance','Personal and Family Guidance','Understand documents and application steps relevant to eligible family members joining a resident in Japan.','Dependent applications can involve relationship records, financial support information and documents from the family member living in Japan.',['Family circumstances discussion','Identity and relationship records','Financial support evidence','Document checklists','File organisation']::jsonb,'[]'::jsonb,'Eligibility and documents vary by residence status and individual case. Approval is determined by Japanese authorities.','published',4),
('documentation','Japan Application & Documentation Support','Personal and Family Guidance','Understand and organise academic, identity, sponsor and financial documents requested for Japan-related applications.','Complete and consistent paperwork is important in many study and visa-related applications. Oxford can help applicants understand document categories and organise a checklist.',['Passport and identity records','Academic certificates and transcripts','Resume and education or work history','Language-study records and test certificates','Sponsor, employment and income information where required','Financial and relationship records where relevant']::jsonb,'[]'::jsonb,'This is a general guide, not a fixed or exhaustive checklist. Requirements, translations, certifications and financial thresholds vary by case and may change.','published',5),
('career-counselling','Study & Career Counselling','Personal and Family Guidance','Discuss your background, interests and goals before deciding which education or work pathway to explore.','Choosing a course, school or work pathway is an important decision. Oxford''s counselling service helps learners consider background, language preparation needs and available options.',['Academic-background discussion','Future-goal discussion','Japanese education and study-route information','School and programme selection guidance','Language and test-preparation planning']::jsonb,'[]'::jsonb,'Counselling is informational and does not guarantee school admission, employment, a Certificate of Eligibility or visa approval.','published',6),
('japanese-classes','Japanese Language Classes (N5–N1)','Language Education','Build Japanese language skills across five JLPT levels, from beginner foundations to advanced proficiency.','Explore Japanese language learning from N5 beginner foundations through N1 advanced proficiency. Ask about current class levels, schedules and learning plans.',['N5 beginner Japanese','N4 elementary Japanese','N3 intermediate Japanese','N2 upper-intermediate Japanese','N1 advanced Japanese','Grammar, vocabulary, reading, listening and speaking practice']::jsonb,'[]'::jsonb,'Class schedules, level availability and course duration should be confirmed with the academy before enrolment.','published',7),
('language-tests','Japanese Language Test Preparation','Examination Preparation','Prepare for Japanese proficiency and communication tests through structured learning and practice.','Oxford''s Japanese language preparation can support learners planning to sit proficiency and communication tests. Ask which sessions, levels and classes are currently available.',['JLPT preparation','NAT-TEST preparation','J-CERT and JLCT preparation','JFT-Basic preparation','Grammar, vocabulary, reading, listening and communication practice']::jsonb,'[]'::jsonb,'Exam availability, registration dates, formats and requirements are set by test organisations and may change.','published',8),
('ssw-preparation','SSW Preparation Class','Examination Preparation','Prepare for Japanese-language and sector-specific assessment requirements relevant to the SSW route.','Preparation can include Japanese-language learning, relevant language-test guidance and an introduction to sector-specific assessment information.',['Japanese-language preparation','JFT-Basic or other language-test guidance','Sector-specific skills-assessment preparation','Workplace vocabulary','Practical communication']::jsonb,'[]'::jsonb,'The required language test and skills assessment depend on the sector and current rules. Training does not guarantee test results, employment or visa approval.','published',9),
('korean-classes','Korean Language Classes','Language Education','Explore Oxford''s Korean language programme and ask about current classes and learning options.','Oxford lists Korean Language as one of its learning programmes. Contact the academy for current class level, schedule, course structure and enrolment information.',['Programme information and class availability','Guidance on current learning levels','Course schedule information','Enrolment enquiry and follow-up']::jsonb,'[]'::jsonb,'Please contact Oxford to confirm the latest Korean class availability and course details.','published',10)
on conflict (slug) do nothing;

insert into public.oa_cms_examinations
(slug,title,full_name,summary,preparation_topics,official_note,status,sort_order)
values
('jlpt','JLPT Preparation','Japanese-Language Proficiency Test','Structured preparation across vocabulary, grammar, reading and listening.','["Vocabulary and kanji","Grammar patterns","Reading practice","Listening and comprehension","Timed practice and review"]'::jsonb,'JLPT levels, test dates, venues, fees and registration procedures are managed by official organisers. Confirm current information before registering.','published',1),
('nat-test','NAT-TEST Preparation','Japanese NAT-TEST','Build Japanese language knowledge and practise skills assessed by NAT-TEST.','["Vocabulary and kanji","Grammar and language knowledge","Reading comprehension","Listening comprehension","Practice questions and review"]'::jsonb,'NAT-TEST dates, venues, fees, levels and registration requirements may change. Confirm current details with the official organiser.','published',2),
('jft-basic','JFT-Basic Preparation','Japan Foundation Test for Basic Japanese','Develop practical Japanese communication skills for everyday situations.','["Listening to everyday exchanges","Understanding notices and short texts","Daily-life vocabulary and grammar","Reading for practical information","Task-based practice"]'::jsonb,'JFT-Basic availability, registration, fees and official requirements are controlled by the test provider. Confirm current details before applying.','published',3),
('j-cert','J-CERT Preparation','J-CERT','Ask Oxford about current preparation information and availability for J-CERT.','["Test information enquiry","Language preparation discussion","Current class availability"]'::jsonb,'Current test details and preparation availability must be confirmed with Oxford and the official organiser.','published',4),
('jlct','JLCT Preparation','JLCT','Ask Oxford about current preparation information and availability for JLCT.','["Test information enquiry","Language preparation discussion","Current class availability"]'::jsonb,'Current test details and preparation availability must be confirmed with Oxford and the official organiser.','published',5),
('ssw','SSW Preparation','Specified Skilled Worker pathway','Prepare for Japanese-language and sector-specific assessment requirements relevant to the SSW route.','["Japanese language preparation","Relevant language-test guidance","Sector-specific skills assessment","Workplace vocabulary and communication"]'::jsonb,'SSW conditions, tests and eligibility depend on the sector and current Japanese rules. Training does not guarantee a test result, job offer or visa approval.','published',6)
on conflict (slug) do nothing;

insert into public.oa_cms_branches
(slug,name,address,phone,whatsapp,email,facebook_url,instagram_url,tiktok_url,maps_url,active,sort_order)
values
('kushma','Kushma Branch','Kushma, Parbat, Gandaki Province, Nepal','+977 9857631100','+977 9857631100','oxfordmilankushma@gmail.com','https://www.facebook.com/share/1EEb977HqN/?mibextid=wwXIfr','','https://www.tiktok.com/@oxford486?_r=1&_t=ZS-9BQ8PzVqepg','https://maps.app.goo.gl/wVMenxrcrhp1rCcA7?g_st=ic',true,1),
('baglung','Baglung Branch','Baglung, Gandaki Province, Nepal','068-524426','9847601155','oxforddoc55@gmail.com','https://www.facebook.com/share/1HArT3iNJB/?mibextid=wwXIfr','','https://www.tiktok.com/@oxfordacademybaglung?_r=1&_t=ZS-9BQ8w7sM9RN','',true,2)
on conflict (slug) do nothing;

insert into public.oa_cms_news_categories(name,slug)
values ('Academic','academic')
on conflict (slug) do nothing;

insert into public.oa_cms_news_articles(category_id,slug,title,summary,body,cover_image_url,status,published_at)
select c.id,'online-classes','Online Classes','Oxford Academy is planning to launch online classes.','Oxford Academy is planning to launch online classes on short notice to ensure students can continue their education without interruption. The initiative aims to provide an effective, accessible, and interactive learning experience through online platforms, with proper class schedules, teacher coordination, and student support.','https://gsfhhvkipvoutqqgyick.supabase.co/storage/v1/object/public/oa-academy-media/content/1794088839037-the-amazing-benefits-of-ca-online-classes-for-students.jpg','published',now()
from public.oa_cms_news_categories c
where c.slug='academic'
and not exists(select 1 from public.oa_cms_news_articles a where a.slug='online-classes');

insert into public.oa_cms_gallery_images(title,caption,image_url,alt_text,category,status,sort_order)
values
('Baglung Kalika','A memorable day at Baglung Kalika with our Oxford Academy family! ❤️','https://gsfhhvkipvoutqqgyick.supabase.co/storage/v1/object/public/oa-academy-media/content/1794089248561-660406314_1533374425248818_7855048687995695948_n.jpg','Oxford Academy visit to Baglung Kalika','Academy','published',1),
('Oxford Academy','Our amazing students, the pride of Oxford Academy! ❤️📚','https://gsfhhvkipvoutqqgyick.supabase.co/storage/v1/object/public/oa-academy-media/content/1794089434010-568624252_1398264098759852_4852395577372441262_n.jpg','Oxford Academy students','Academy','published',2);

insert into public.oa_cms_site_settings(setting_key,setting_value)
values
('branding','{"brand_name":"OXFORD","brand_subtitle":"ACADEMIC INSTRUCTION PVT. LTD.","logo_url":"https://gsfhhvkipvoutqqgyick.supabase.co/storage/v1/object/public/oa-academy-media/branding/1794111699180-WhatsApp-Image-2026-11-08-at-9.03.23-AM.jpeg","hero_image_url":"https://gsfhhvkipvoutqqgyick.supabase.co/storage/v1/object/public/oa-academy-media/branding/1794201976743-images.jpeg","tagline":"Learn. Prepare. Progress."}'::jsonb),
('company','{"legal_name":"OXFORD ACADEMIC INSTRUCTION PVT. LTD.","intro":"Oxford Academic Instruction Pvt. Ltd. supports learners and families through Japanese and Korean language programmes, examination preparation and practical guidance for Japan-related study and work pathways.","vision":"To be a trusted education and guidance centre that connects learners in Nepal with meaningful learning opportunities, international understanding and well-prepared future pathways.","mission":"To provide clear, learner-focused language education and practical guidance that helps students make informed decisions about study, work and family pathways connected with Japan.","goals":"Offer structured Japanese and Korean language learning; explain Japan-related study and work pathways in clear terms; support careful document preparation; encourage informed decisions; and continue improving our service through feedback from learners and families.","leadership":"Every learner begins with a different background, goal and set of questions. At Oxford, we believe the right guidance starts by listening, explaining the available options clearly and helping each person understand the next practical step. We welcome learners and families to speak with our team about language classes, study plans and Japan-related guidance."}'::jsonb),
('homepage','{"eyebrow":"OXFORD ACADEMIC INSTRUCTION PVT. LTD.","title":"Build Your Future","accent":"With Confidence.","description":"Explore language learning, examination preparation and practical guidance for your next academic or professional step.","primaryCta":"Explore Programs","secondaryCta":"Contact Oxford"}'::jsonb)
on conflict (setting_key) do nothing;

with parent_rows(label,href,sort_order) as (
 values ('About','/about',1),('Programs','/programs',2),('Services','/services',3),('Examinations','/examinations',4),('Branches','/branches',5),('More','/news',6)
)
insert into public.oa_cms_navigation_items(label,href,sort_order,visible)
select p.label,p.href,p.sort_order,true
from parent_rows p
where not exists(select 1 from public.oa_cms_navigation_items n where n.label=p.label and n.parent_id is null);

with child_rows(parent_label,label,href,sort_order) as (
 values
 ('Programs','Japanese Language N5–N1','/programs',1),
 ('Programs','Korean Language','/programs/korean-language',2),
 ('More','Our Team','/team',1),
 ('More','Nepali Calendar','/calendar',2),
 ('More','News & Notices','/news',3),
 ('More','Events','/events',4),
 ('More','Gallery','/gallery',5),
 ('More','Student Experiences','/experiences',6),
 ('More','FAQs','/faq',7),
 ('More','Contact','/contact',8)
)
insert into public.oa_cms_navigation_items(label,href,parent_id,sort_order,visible)
select c.label,c.href,p.id,c.sort_order,true
from child_rows c
join public.oa_cms_navigation_items p on p.label=c.parent_label and p.parent_id is null
where not exists(select 1 from public.oa_cms_navigation_items n where n.parent_id=p.id and n.label=c.label);

insert into public.oa_cms_seo_metadata(page_path,title,description,no_index)
values
('/','Oxford Academic Instruction Pvt. Ltd.','Japanese and Korean language programmes, examination preparation and Japan-related study and work guidance.',false),
('/about','About Oxford Academic Instruction','Learn about Oxford Academic Instruction, its approach and branches.',false),
('/programs','Japanese and Korean Language Programmes','Explore Japanese N5–N1 and Korean language learning programmes.',false),
('/services','Study, Work and Language Guidance','Explore Oxford Academic Instruction services and Japan-related guidance.',false),
('/examinations','Japanese Examination Preparation','Information about Japanese language examinations and preparation.',false),
('/branches','Oxford Academy Branches','Contact Oxford Academic Instruction in Kushma and Baglung.',false)
on conflict (page_path) do nothing;

-- No FAQ, event or student-review records are inserted: no approved source records were found for those categories.
