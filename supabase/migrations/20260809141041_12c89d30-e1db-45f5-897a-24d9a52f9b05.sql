-- 1. Extend teachers
ALTER TABLE public.teachers
  ADD COLUMN IF NOT EXISTS name_ar text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bio_ar text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS curricula text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS grades text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS platform_url text,
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS owner_id uuid;

-- 2. Teacher self-registration applications
CREATE TABLE IF NOT EXISTS public.teacher_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  full_name_ar text NOT NULL DEFAULT '',
  phone text NOT NULL,
  subject text NOT NULL,
  governorate text NOT NULL,
  area text NOT NULL,
  center_name text NOT NULL DEFAULT '',
  center_address text NOT NULL DEFAULT '',
  modes text[] NOT NULL DEFAULT '{}',
  curricula text[] NOT NULL DEFAULT '{}',
  grades text[] NOT NULL DEFAULT '{}',
  price_per_session numeric NOT NULL DEFAULT 0,
  bio text NOT NULL DEFAULT '',
  platform_url text,
  national_id_last4 text NOT NULL DEFAULT '',
  id_document_path text,
  credential_document_path text,
  status text NOT NULL DEFAULT 'pending',
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.teacher_applications TO authenticated;
GRANT ALL ON public.teacher_applications TO service_role;

ALTER TABLE public.teacher_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applications_select_own" ON public.teacher_applications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "applications_insert_own" ON public.teacher_applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "applications_update_own_pending" ON public.teacher_applications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_teacher_applications_updated_at ON public.teacher_applications;
CREATE TRIGGER update_teacher_applications_updated_at
  BEFORE UPDATE ON public.teacher_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Replace catalogue data with Egypt
DELETE FROM public.bookings;
DELETE FROM public.reviews;
DELETE FROM public.bundles;
DELETE FROM public.teachers;

INSERT INTO public.teachers (id, name, name_ar, subject, area, region, center_name, center_address, map_query, modes, rating, students, price_per_session, bio, bio_ar, manasa, platform_url, youtube, slots, accent, sort, curricula, grades, verified) VALUES
('mohamed-salah','Mr. Mohamed Salah','مستر محمد صلاح','English','Nasr City','Cairo','Anglovibes','Abbas El Akkad St., Nasr City, Cairo','Nasr City Cairo',ARRAY['center','online','manasa'],4.9,12000,250,'English teacher with 20+ years of experience, known as "The Excellence". Founder of the Anglovibes platform and a long-running free YouTube channel for Thanaweya Amma students.','مدرس لغة إنجليزية بخبرة تتجاوز 20 عامًا، صاحب منصة Anglovibes ومحتوى مجاني على يوتيوب لطلاب الثانوية العامة.','https://www.anglovibes.com','https://www.anglovibes.com',NULL,'[{"day":"Saturday","times":["16:00","18:00"]},{"day":"Tuesday","times":["17:00","19:00"]}]'::jsonb,'from-sky-500 to-cyan-400',1,ARRAY['thanaweya','bakalorya'],ARRAY['sec1','sec2','sec3'],true),
('englishawy','Mr. Englishawy','مستر إنجلشاوي','English','Dokki','Giza','Englishawy Platform','Dokki, Giza','Dokki Giza',ARRAY['manasa','online'],4.8,9500,180,'Englishawy is a Thanaweya Amma English platform covering the full syllabus with lessons, grammar and final revisions in a simple, structured way.','إنجلشاوي منصة لغة إنجليزية لطلاب الثانوية العامة تغطي المنهج كامل: دروس وقواعد ومراجعات نهائية بأسلوب بسيط ومنظم.','https://www.mrenglishawy.com','https://www.mrenglishawy.com',NULL,'[{"day":"Sunday","times":["18:00","20:00"]},{"day":"Wednesday","times":["18:00"]}]'::jsonb,'from-indigo-500 to-sky-400',2,ARRAY['thanaweya'],ARRAY['sec1','sec2','sec3'],true),
('mohamed-khames','Mr. Mohamed Khames','مستر محمد خميس','English','Heliopolis','Cairo','The Legend','Heliopolis, Cairo','Heliopolis Cairo',ARRAY['center','manasa','online'],4.8,8000,220,'Specialist English teacher for Thanaweya Amma, founder of "The Legend" platform with a large question bank and gradual unit-by-unit explanation.','معلم لغة إنجليزية متخصص للثانوية العامة وصاحب منصة The Legend ببنك أسئلة ضخم وشرح مبسط وحدة بوحدة.','https://mr-mohamed-khames.com','https://mr-mohamed-khames.com',NULL,'[{"day":"Monday","times":["17:00","19:00"]},{"day":"Thursday","times":["16:00"]}]'::jsonb,'from-violet-500 to-fuchsia-400',3,ARRAY['thanaweya','bakalorya'],ARRAY['sec1','sec2','sec3'],true),
('yasser-mofid','Mr. Yasser Mofid','مستر ياسر مفيد','English','Smouha','Alexandria','Mr. Yasser Mofid Platform','Smouha, Alexandria','Smouha Alexandria',ARRAY['center','manasa'],4.7,7000,200,'Expert English teacher for the secondary stage with 20+ years of experience, covering both Thanaweya Amma and the new Baccalaureate track.','معلم خبير لغة إنجليزية للمرحلة الثانوية بخبرة أكثر من 20 سنة، ويغطي الثانوية العامة والبكالوريا.','https://mr-yassermofid.com','https://mr-yassermofid.com',NULL,'[{"day":"Saturday","times":["15:00","17:00"]},{"day":"Tuesday","times":["18:00"]}]'::jsonb,'from-emerald-500 to-teal-400',4,ARRAY['thanaweya','bakalorya'],ARRAY['sec1','sec2','sec3'],true),
('mohamed-abdelmaaboud','Mr. Mohamed Abdelmaaboud','مستر محمد عبدالمعبود','Physics','Maadi','Cairo','Abdelmaaboud Platform','Maadi, Cairo','Maadi Cairo',ARRAY['center','manasa','online'],4.9,15000,300,'Physics teacher with over 27 years of experience teaching Thanaweya Amma, with practical demonstrations and full training on the latest question patterns.','مدرس فيزياء بخبرة تتجاوز 27 سنة في تدريس الثانوية العامة مع تجارب عملية وتدريب على أحدث أنماط الأسئلة.','https://abdelmaaboud.com','https://abdelmaaboud.com',NULL,'[{"day":"Sunday","times":["16:00","18:00"]},{"day":"Friday","times":["10:00","12:00"]}]'::jsonb,'from-amber-500 to-orange-400',5,ARRAY['thanaweya','bakalorya'],ARRAY['sec2','sec3'],true),
('ahmed-samir','Mr. Ahmed Samir','مستر أحمد سمير','Physics','Mohandessin','Giza','In Physics We Are Enough','Mohandessin, Giza','Mohandessin Giza',ARRAY['center','manasa'],4.7,6800,280,'Physics teacher with 20+ years of experience, teaching the secondary syllabus through an approach that links theory to real applications.','مدرس فيزياء بخبرة أكثر من 20 عامًا يدرّس منهج الثانوية بأسلوب مبتكر يربط العلم بالتطبيق العملي.','https://mrahmedsamir.com','https://mrahmedsamir.com',NULL,'[{"day":"Monday","times":["18:00"]},{"day":"Thursday","times":["17:00","19:00"]}]'::jsonb,'from-rose-500 to-pink-400',6,ARRAY['thanaweya'],ARRAY['sec1','sec2','sec3'],true),
('abdullah-elshennawy','Mr. Abdullah El-Shennawy','مستر عبدالله الشناوي','Chemistry','Nasr City','Cairo','El-Takafo2 Chemistry','Nasr City, Cairo','Nasr City Cairo',ARRAY['center','home','manasa'],4.8,9000,270,'Chemistry teacher and author of the well-known "El-Takafo2 fil Chemistry" series for Egyptian secondary students.','مدرس كيمياء ومؤسس سلسلة "التكافؤ في الكيمياء" الشهيرة لطلاب الثانوية في مصر.',NULL,NULL,NULL,'[{"day":"Saturday","times":["17:00","19:00"]},{"day":"Wednesday","times":["16:00"]}]'::jsonb,'from-lime-500 to-emerald-400',7,ARRAY['thanaweya','bakalorya'],ARRAY['sec2','sec3'],true),
('ali-eldein','Mr. Ali Eldein','مستر علي الدين','Math','Mansoura','Dakahlia','Nesr El Riyadiyat','Mansoura, Dakahlia','Mansoura Egypt',ARRAY['center','manasa','online'],4.7,5400,230,'Mathematics specialist for the secondary stage, running a platform with courses, regular exams and continuous follow-up.','متخصص في الرياضيات للمرحلة الثانوية، وصاحب منصة بها كورسات وامتحانات دورية ومتابعة مستمرة.','https://www.mr-alieldein.com','https://www.mr-alieldein.com',NULL,'[{"day":"Sunday","times":["15:00","17:00"]},{"day":"Tuesday","times":["19:00"]}]'::jsonb,'from-cyan-500 to-blue-400',8,ARRAY['thanaweya','bakalorya'],ARRAY['sec1','sec2','sec3'],true),
('mostafa-yaqoup','Mr. Mostafa Yaqoub','مستر مصطفى يعقوب','Math','Tanta','Gharbia','Mostafa Yaqoub Platform','Tanta, Gharbia','Tanta Egypt',ARRAY['manasa','online','home'],4.6,4300,210,'Maths teacher with a simple, structured method: organised units, revisions and exams with model answers and analysis of recurring questions.','مدرس رياضيات بأسلوب علمي مبسط ومنظم: وحدات مرتبة ومراجعات وامتحانات بحلول نموذجية وتحليل لأهم الأسئلة المتكررة.','https://mostafayaqoup.com','https://mostafayaqoup.com',NULL,'[{"day":"Monday","times":["16:00","18:00"]},{"day":"Friday","times":["11:00"]}]'::jsonb,'from-teal-500 to-cyan-400',9,ARRAY['thanaweya'],ARRAY['prep3','sec1','sec2','sec3'],true),
('mahmoud-abdelkader','Mr. Mahmoud Abdelkader','أ. محمود عبدالقادر','Arabic','Shubra','Cairo','El Molhem fi Arabic','Shubra, Cairo','Shubra Cairo',ARRAY['center','manasa'],4.7,6100,190,'Arabic language teacher known as "El Molhem", running a platform covering all three secondary years with periodic exams and follow-up.','معلم لغة عربية يُعرف بـ"المُلهم في اللغة العربية" وصاحب منصة تغطي صفوف الثانوي الثلاثة بامتحانات ومتابعة دورية.','https://mahmoudabdelkader.online','https://mahmoudabdelkader.online',NULL,'[{"day":"Saturday","times":["18:00"]},{"day":"Wednesday","times":["17:00","19:00"]}]'::jsonb,'from-orange-500 to-amber-400',10,ARRAY['thanaweya','bakalorya'],ARRAY['sec1','sec2','sec3'],true),
('refaat-abouel-dahab','Mr. Refaat Abou El-Dahab','أ. رفعت أبو الدهب','Arabic','Zagazig','Sharqia','El Araby Gher','Zagazig, Sharqia','Zagazig Egypt',ARRAY['manasa','online'],4.6,50000,150,'Arabic teacher behind the "El Araby Gher" platform, dedicated to Egyptian Thanaweya Amma students with courses, questions and tests.','معلم لغة عربية صاحب منصة "العربي غير" المخصصة لطلبة الثانوية العامة في مصر بالدورات والأسئلة والاختبارات.','https://el3raby8er.com','https://el3raby8er.com',NULL,'[{"day":"Sunday","times":["19:00"]},{"day":"Thursday","times":["18:00","20:00"]}]'::jsonb,'from-fuchsia-500 to-rose-400',11,ARRAY['thanaweya'],ARRAY['sec1','sec2','sec3'],true),
('ahmed-saad-elazzawy','Mr. Ahmed Saad (Elazzawy)','مستر أحمد سعد العزاوي','English','Sidi Gaber','Alexandria','Elazzawy English','Sidi Gaber, Alexandria','Sidi Gaber Alexandria',ARRAY['center','manasa'],4.6,3900,170,'English teacher running the Elazzawy English platform with recorded lectures and night-before-the-exam revisions for Thanaweya Amma.','مدرس لغة إنجليزية صاحب منصة Elazzawy English بمحاضرات مسجلة ومراجعات ليلة الامتحان للثانوية العامة.','https://elazzawy.com','https://elazzawy.com',NULL,'[{"day":"Monday","times":["17:00"]},{"day":"Friday","times":["12:00","14:00"]}]'::jsonb,'from-blue-500 to-indigo-400',12,ARRAY['thanaweya'],ARRAY['sec1','sec2','sec3'],true);

INSERT INTO public.bundles (id, title, tagline, teacher_ids, discount, accent, sort) VALUES
('thanaweya-science','Thanaweya Amma — Science','Physics + Chemistry + Maths with top-rated teachers',ARRAY['mohamed-abdelmaaboud','abdullah-elshennawy','ali-eldein'],0.15,'from-sky-600 to-cyan-400',1),
('languages-boost','Languages Boost','Arabic + English together, one weekly plan',ARRAY['mohamed-salah','mahmoud-abdelkader'],0.12,'from-violet-600 to-fuchsia-400',2),
('manasa-only','Manasa Only','Fully online platforms, study from anywhere in Egypt',ARRAY['englishawy','mostafa-yaqoup','refaat-abouel-dahab'],0.2,'from-emerald-600 to-teal-400',3);

INSERT INTO public.reviews (teacher_id, student_name, rating, body, verified) VALUES
('mohamed-salah','Youssef A.',5,'His explanation made English finally click before Thanaweya Amma. The revisions are gold.',true),
('mohamed-abdelmaaboud','Nour H.',5,'Physics went from my worst subject to my highest grade. The practical examples help a lot.',true),
('englishawy','Malak S.',4,'Great platform, very organised lessons and the tests show your real level.',true),
('ali-eldein','Omar K.',5,'Weekly exams kept me on track all year. Highly recommend for maths.',true),
('mahmoud-abdelkader','Habiba M.',4,'Arabic nahw explained simply, and the follow-up is consistent.',true);