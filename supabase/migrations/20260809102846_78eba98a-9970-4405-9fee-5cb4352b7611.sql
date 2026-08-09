-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'student' check (role in ('student','teacher')),
  avatar_url text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when coalesce(new.raw_user_meta_data ->> 'role','student') = 'teacher' then 'teacher' else 'student' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- teachers catalog
create table public.teachers (
  id text primary key,
  name text not null,
  subject text not null,
  area text not null,
  region text not null,
  center_name text not null,
  center_address text not null,
  map_query text not null,
  modes text[] not null default '{}',
  rating numeric(2,1) not null default 0,
  students integer not null default 0,
  price_per_session numeric(6,2) not null default 0,
  bio text not null default '',
  manasa text,
  youtube text,
  slots jsonb not null default '[]'::jsonb,
  accent text not null default 'from-sky-500 to-cyan-400',
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.teachers to anon, authenticated;
grant all on public.teachers to service_role;
alter table public.teachers enable row level security;
create policy "teachers_public_read" on public.teachers for select to anon, authenticated using (true);

-- bundles
create table public.bundles (
  id text primary key,
  title text not null,
  tagline text not null,
  teacher_ids text[] not null default '{}',
  discount numeric(3,2) not null default 0,
  accent text not null default 'from-sky-600 to-cyan-400',
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.bundles to anon, authenticated;
grant all on public.bundles to service_role;
alter table public.bundles enable row level security;
create policy "bundles_public_read" on public.bundles for select to anon, authenticated using (true);

-- reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  teacher_id text not null references public.teachers(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  student_name text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null check (char_length(body) <= 1000),
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
create index reviews_teacher_idx on public.reviews (teacher_id, created_at desc);
grant select on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "reviews_public_read" on public.reviews for select to anon, authenticated using (true);
create policy "reviews_insert_own" on public.reviews for insert to authenticated with check (auth.uid() = user_id);
create policy "reviews_update_own" on public.reviews for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reviews_delete_own" on public.reviews for delete to authenticated using (auth.uid() = user_id);

-- bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  teacher_id text not null references public.teachers(id) on delete cascade,
  day text not null,
  time text not null,
  bundle_id text references public.bundles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, day, time)
);
grant select, insert, update, delete on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
create policy "bookings_select_own" on public.bookings for select to authenticated using (auth.uid() = user_id);
create policy "bookings_insert_own" on public.bookings for insert to authenticated with check (auth.uid() = user_id);
create policy "bookings_delete_own" on public.bookings for delete to authenticated using (auth.uid() = user_id);

insert into public.teachers (id,name,subject,area,region,center_name,center_address,map_query,modes,rating,students,price_per_session,bio,manasa,youtube,slots,accent,sort) values
('t1','Ustaz Kareem Odeh','Math','Amman — Abdoun','Amman','Nexus Learning Center','Al Sa''ada St 14, Abdoun, Amman','Abdoun, Amman, Jordan',ARRAY['center','online']::text[],4.9,1240,12,'Tawjihi Math specialist for 11 years. Known for breaking down calculus and geometry into simple visual steps, with weekly exam-style drills.','https://manasa.example.com/kareem-odeh','https://youtube.com/@droosy-math','[{"day":"Sun","times":["16:00","18:00"]},{"day":"Mon","times":["17:00","19:30"]},{"day":"Tue","times":["16:00","18:00"]},{"day":"Wed","times":["17:00","19:30"]},{"day":"Thu","times":["16:00","18:00"]}]'::jsonb,'from-sky-500 to-cyan-400',0),
('t2','Ustaza Lina Haddad','Physics','Amman — Sweifieh','Amman','Orbit Academy','Wakalat St 3, Sweifieh, Amman','Sweifieh, Amman, Jordan',ARRAY['center','home','online']::text[],4.7,860,14,'Physics made intuitive — mechanics and electricity taught with real lab demos and a full recorded library on Manasa.','https://manasa.example.com/lina-haddad',null,'[{"day":"Sun","times":["15:00","17:30"]},{"day":"Mon","times":["16:30","20:00"]},{"day":"Tue","times":["15:00","17:30"]},{"day":"Wed","times":["16:30","20:00"]},{"day":"Thu","times":["15:00","17:30"]}]'::jsonb,'from-cyan-500 to-teal-400',1),
('t3','Ustaz Yousef Nabil','Chemistry','Amman — Tla'' Al Ali','Amman','Elements Center','Khalil Al Salem St 22, Tla'' Al Ali','Tla Al Ali, Amman, Jordan',ARRAY['center','online']::text[],4.8,990,13,'Organic chemistry that finally sticks. Colour-coded reaction maps and a monthly full mock exam with detailed correction.','https://manasa.example.com/yousef-nabil','https://youtube.com/@droosy-chem','[{"day":"Sun","times":["14:00","18:30"]},{"day":"Mon","times":["16:00","19:00"]},{"day":"Tue","times":["14:00","18:30"]},{"day":"Wed","times":["16:00","19:00"]},{"day":"Thu","times":["14:00","18:30"]}]'::jsonb,'from-teal-500 to-emerald-400',2),
('t4','Ustaza Rana Sami','English','Zarqa — Al Jadeeda','Zarqa','Fluent Hub','Al Jadeeda Main St 8, Zarqa','Zarqa, Jordan',ARRAY['home','online']::text[],4.6,540,10,'Grammar, essay writing and speaking confidence. Small groups of 6 students max, plus weekly writing feedback.','https://manasa.example.com/rana-sami',null,'[{"day":"Sun","times":["15:30","17:00"]},{"day":"Mon","times":["18:00","20:00"]},{"day":"Tue","times":["15:30","17:00"]},{"day":"Wed","times":["18:00","20:00"]},{"day":"Thu","times":["15:30","17:00"]}]'::jsonb,'from-sky-600 to-indigo-400',3),
('t5','Ustaz Mahmoud Ali','Arabic','Irbid — City Center','Irbid','Al Bayan Center','University St 40, Irbid','Irbid, Jordan',ARRAY['center']::text[],4.5,430,9,'Nahw and balagha with memorable rules and story-based examples. Tawjihi track since 2009.',null,null,'[{"day":"Sun","times":["13:00","16:00"]},{"day":"Mon","times":["15:00","18:00"]},{"day":"Tue","times":["13:00","16:00"]},{"day":"Wed","times":["15:00","18:00"]},{"day":"Thu","times":["13:00","16:00"]}]'::jsonb,'from-amber-500 to-orange-400',4),
('t6','Ustaza Dina Faris','Biology','Amman — Abdoun','Amman','BioLab Studio','Prince Hashem St 5, Abdoun','Abdoun, Amman, Jordan',ARRAY['center','home','online']::text[],4.9,1120,13,'Visual biology: every system drawn live, plus flashcard packs and quick revision streams before each exam.','https://manasa.example.com/dina-faris','https://youtube.com/@droosy-bio','[{"day":"Sun","times":["14:30","17:00"]},{"day":"Mon","times":["16:00","19:30"]},{"day":"Tue","times":["14:30","17:00"]},{"day":"Wed","times":["16:00","19:30"]},{"day":"Thu","times":["14:30","17:00"]}]'::jsonb,'from-emerald-500 to-teal-400',5),
('t7','Ustaz Omar Zaid','Math','Amman — Sweifieh','Amman','Nexus Learning Center','Wakalat St 19, Sweifieh, Amman','Sweifieh, Amman, Jordan',ARRAY['home','online']::text[],4.4,380,11,'Algebra and statistics coach focused on students who lost confidence — patient, step by step, zero pressure.','https://manasa.example.com/omar-zaid',null,'[{"day":"Sun","times":["17:00","19:00"]},{"day":"Mon","times":["15:30","18:30"]},{"day":"Tue","times":["17:00","19:00"]},{"day":"Wed","times":["15:30","18:30"]},{"day":"Thu","times":["17:00","19:00"]}]'::jsonb,'from-blue-500 to-sky-400',6),
('t8','Ustaza Sireen Qasem','Physics','Irbid — City Center','Irbid','Orbit Academy Irbid','Al Hussein St 12, Irbid','Irbid, Jordan',ARRAY['center','online']::text[],4.7,610,11,'Problem-solving marathons every Thursday, with a bank of 2,000 solved Tawjihi questions on her Manasa.','https://manasa.example.com/sireen-qasem',null,'[{"day":"Sun","times":["16:00","18:00"]},{"day":"Mon","times":["14:00","17:30"]},{"day":"Tue","times":["16:00","18:00"]},{"day":"Wed","times":["14:00","17:30"]},{"day":"Thu","times":["16:00","18:00"]}]'::jsonb,'from-cyan-600 to-sky-400',7);

insert into public.bundles (id,title,tagline,teacher_ids,discount,accent,sort) values
('b1','Scientific Stream Survival Kit','Math + Physics + Chemistry with the highest rated trio in Amman.',ARRAY['t1','t2','t3']::text[],0.2,'from-sky-600 via-cyan-500 to-teal-400',0),
('b2','Medical Track Bundle','Biology + Chemistry + English, built for future med students.',ARRAY['t6','t3','t4']::text[],0.15,'from-teal-600 via-cyan-500 to-sky-400',1),
('b3','Language Confidence Pack','Arabic + English together, two sessions a week each.',ARRAY['t5','t4']::text[],0.1,'from-indigo-500 via-sky-500 to-cyan-400',2);

insert into public.reviews (teacher_id,student_name,rating,body,verified,created_at) values
('t1','Rokaya M.',5,'Calculus finally made sense. His weekly drills are exactly the exam style.',true,now() - interval '3 days'),
('t1','Sama K.',5,'The Manasa recordings saved me when I missed a session.',true,now() - interval '4 days'),
('t1','Bashar A.',4,'Great teacher, but the center gets crowded on Mondays.',false,now() - interval '5 days'),
('t2','Haneen S.',5,'The lab demos made electricity so much easier to picture.',true,now() - interval '6 days'),
('t2','Layth F.',4,'Very organized. Wish there were more evening slots.',true,now() - interval '7 days'),
('t3','Sajda R.',5,'Reaction maps are genius. My chemistry mark went up 18 points.',true,now() - interval '8 days'),
('t6','Noor T.',5,'Her drawings are better than the textbook. Flashcards included!',true,now() - interval '9 days'),
('t4','Yara H.',4,'My essay writing improved a lot in one term.',true,now() - interval '10 days'),
('t5','Anas D.',5,'Nahw rules explained with stories — I actually remember them.',false,now() - interval '11 days'),
('t8','Malak Z.',5,'Thursday problem marathons are the reason I passed.',true,now() - interval '12 days');