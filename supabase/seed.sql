-- Seed data for local development. Runs after migrations on `supabase db reset`.
-- 2024 acts: sample data with times. 2025 acts: a few from data/edc-orlando-2025/acts.csv (no times yet). Full data: data:import.

insert into public.festivals (id, name, start_date, end_date, location, image_url, description, status) values
  ('00000000-0000-4000-8000-000000002024', 'EDC Orlando 2024', '2024-11-15', '2024-11-17', 'Orlando, FL', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop', 'Electric Daisy Carnival Orlando - The ultimate electronic dance music experience', 'complete'),
  ('00000000-0000-4000-8000-000000002025', 'EDC Orlando 2025', '2025-11-07', '2025-11-09', 'Orlando, FL', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop', 'Electric Daisy Carnival Orlando - Lineup and stages announced, times to come', 'stages'),
  ('00000000-0000-4000-8000-000000000042', 'Ultra Music Festival 2024', '2024-03-22', '2024-03-24', 'Miami, FL', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop', 'Ultra Music Festival - Where electronic music meets the ocean', 'lineup'),
  ('00000000-0000-4000-8000-000000000043', 'Tomorrowland 2024', '2024-07-19', '2024-07-21', 'Boom, Belgium', 'https://images.unsplash.com/photo-1571266028243-e68c785c3b73?w=800&h=400&fit=crop', 'Tomorrowland - The magical electronic music festival', 'announced');

insert into public.acts (festival_id, artist, day, start_time, length_minutes, stage, special_notes, genre, category, youtube_url, youtube_title, avg_rating) values
  ('00000000-0000-4000-8000-000000002024', 'Alex Kennon', 'Friday', '20:00', 60, 'Neon Garden', null, 'Tech House', 'Techno', 'https://youtube.com/watch?v=example1', 'Alex Kennon - Ibiza 2023', 3.6),
  ('00000000-0000-4000-8000-000000002024', 'Avision', 'Friday', '21:00', 60, 'Neon Garden', null, 'Techno', 'House', 'https://youtube.com/watch?v=example2', 'Avision - Club 2023', 4.0),
  ('00000000-0000-4000-8000-000000002024', 'Black Tiger Sex Machine', 'Friday', '22:00', 60, 'Circuit Grounds', null, 'Dubstep', 'Bass', 'https://youtube.com/watch?v=example3', 'BTSM - WAMU 2024', 4.2),
  ('00000000-0000-4000-8000-000000002024', 'Carl Cox B2B Vintage Culture', 'Friday', '23:00', 90, 'Neon Garden', 'Worldwide Debut', 'Tech House', 'Pop EDM', 'https://youtube.com/watch?v=example4', 'Carl Cox B2B Vintage Culture - Exit 2024', 4.0),
  ('00000000-0000-4000-8000-000000002024', 'Deorro B2B Timmy Trumpet', 'Friday', '00:30', 90, 'Kinetic Field', 'Worldwide Debut', 'House / Hardstyle', 'Pop EDM', 'https://youtube.com/watch?v=example5', 'Deorro B2B Timmy Trumpet - UMF 2023', 3.6),
  ('00000000-0000-4000-8000-000000002024', 'Diplo', 'Friday', '02:00', 60, 'Kinetic Field', 'Sunset Set', 'Pop', 'Pop EDM', 'https://youtube.com/watch?v=example6', 'Diplo - Rio 2024', 2.5),
  ('00000000-0000-4000-8000-000000002024', 'Fisher', 'Friday', '03:00', 60, 'Kinetic Field', null, 'House', 'Pop EDM', 'https://youtube.com/watch?v=example7', 'Fisher - Outside Lands 2023', 3.8),
  ('00000000-0000-4000-8000-000000002024', 'Hedex', 'Friday', '19:00', 60, 'Circuit Grounds', null, 'Drum & Bass', 'Bass', 'https://youtube.com/watch?v=example8', 'Hedex - EDCLV 2024', 3.3),
  ('00000000-0000-4000-8000-000000002024', 'Kaskade B2B Alison Wonderland', 'Friday', '01:00', 90, 'Kinetic Field', null, 'Big Room / Trap', 'Pop EDM', 'https://youtube.com/watch?v=example9', 'Kaskade B2B Alison Wonderland - Coachella 2024', 4.1),
  ('00000000-0000-4000-8000-000000002024', 'Lost Frequencies', 'Friday', '20:30', 60, 'Kinetic Field', null, 'House', 'Pop EDM', 'https://youtube.com/watch?v=example10', 'Lost Frequencies - Tomorrowland 2024', 3.7),
  ('00000000-0000-4000-8000-000000002025', 'Adam Beyer', 'Friday', null, null, 'Neon Garden', null, 'Techno', 'Techno', null, null, null),
  ('00000000-0000-4000-8000-000000002025', 'Armin van Buuren', 'Friday', null, null, 'Kinetic Field', null, 'Trance', 'Trance', null, null, null),
  ('00000000-0000-4000-8000-000000002025', 'AYYBO', 'Friday', null, null, 'Stereo Bloom', null, 'House', 'House', null, null, null),
  ('00000000-0000-4000-8000-000000002025', 'Bart Skils', 'Friday', null, null, 'Neon Garden', null, 'Techno', 'Techno', null, null, null),
  ('00000000-0000-4000-8000-000000002025', 'Canabliss', 'Friday', null, null, 'Circuit Grounds', null, 'Dubstep', 'Bass', null, null, null),
  ('00000000-0000-4000-8000-000000002025', 'Chris Lake', 'Friday', null, null, 'Kinetic Field', null, 'Tech House', 'House', null, null, null),
  ('00000000-0000-4000-8000-000000002025', 'DJ Circle K', 'Friday', null, null, 'Circuit Grounds', null, 'Electronic', 'EDM', null, null, null),
  ('00000000-0000-4000-8000-000000002025', 'Gorgon City', 'Friday', null, null, 'Stereo Bloom', null, 'Deep House', 'House', null, null, null);
