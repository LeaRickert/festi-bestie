-- Supabase Database Setup for Festi Besti
-- Run these commands in your Supabase SQL editor

-- Create festival status enum type
CREATE TYPE festival_status AS ENUM (
  'announced', 'lineup', 'stages', 'schedule', 'times', 'complete'
);

-- Create festivals table
CREATE TABLE IF NOT EXISTS festivals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  status festival_status DEFAULT 'announced',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create acts table
CREATE TABLE IF NOT EXISTS acts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  artist TEXT NOT NULL,
  day TEXT,
  start_time TIME,
  length_minutes INTEGER DEFAULT 60,
  stage TEXT,
  special_notes TEXT,
  genre TEXT,
  category TEXT,
  youtube_url TEXT,
  youtube_title TEXT,
  avg_rating DECIMAL(3,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user ratings table
CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  act_id UUID REFERENCES acts(id) ON DELETE CASCADE,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, act_id)
);

-- Enable Row Level Security
ALTER TABLE festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE acts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for festivals
CREATE POLICY "Festivals are viewable by everyone" ON festivals 
  FOR SELECT USING (true);

-- Create policies for acts
CREATE POLICY "Acts are viewable by everyone" ON acts 
  FOR SELECT USING (true);

-- Create policies for user ratings
CREATE POLICY "Users can view their own ratings" ON user_ratings 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ratings" ON user_ratings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON user_ratings 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" ON user_ratings 
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_acts_festival_id ON acts(festival_id);
CREATE INDEX IF NOT EXISTS idx_acts_day ON acts(day);
CREATE INDEX IF NOT EXISTS idx_acts_stage ON acts(stage);
CREATE INDEX IF NOT EXISTS idx_acts_genre ON acts(genre);
CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_act_id ON user_ratings(act_id);

-- Insert sample festival data
INSERT INTO festivals (name, start_date, end_date, location, image_url, description, status) VALUES
('EDC Orlando 2024', '2024-11-15', '2024-11-17', 'Orlando, FL', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop', 'Electric Daisy Carnival Orlando - The ultimate electronic dance music experience', 'complete'),
('Ultra Music Festival 2024', '2024-03-22', '2024-03-24', 'Miami, FL', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop', 'Ultra Music Festival - Where electronic music meets the ocean', 'lineup'),
('Tomorrowland 2024', '2024-07-19', '2024-07-21', 'Boom, Belgium', 'https://images.unsplash.com/photo-1571266028243-e68c785c3b73?w=800&h=400&fit=crop', 'Tomorrowland - The magical electronic music festival', 'announced');

-- Insert sample acts data (using the EDC Orlando 2024 festival)
INSERT INTO acts (festival_id, artist, day, start_time, length_minutes, stage, special_notes, genre, category, youtube_url, youtube_title, avg_rating) VALUES
((SELECT id FROM festivals WHERE name = 'EDC Orlando 2024'), 'Alex Kennon', 'Friday', '20:00', 60, 'Neon Garden', '', 'Tech House', 'Techno', 'https://youtube.com/watch?v=example1', 'Alex Kennon - Ibiza 2023', 3.6),
((SELECT id FROM festivals WHERE name = 'EDC Orlando 2024'), 'Avision', 'Friday', '21:00', 60, 'Neon Garden', '', 'Techno', 'House', 'https://youtube.com/watch?v=example2', 'Avision - Club 2023', 4.0),
((SELECT id FROM festivals WHERE name = 'EDC Orlando 2024'), 'Black Tiger Sex Machine', 'Friday', '22:00', 60, 'Circuit Grounds', '', 'Dubstep', 'Bass', 'https://youtube.com/watch?v=example3', 'BTSM - WAMU 2024', 4.2),
((SELECT id FROM festivals WHERE name = 'EDC Orlando 2024'), 'Carl Cox B2B Vintage Culture', 'Friday', '23:00', 90, 'Neon Garden', 'Worldwide Debut', 'Tech House', 'Pop EDM', 'https://youtube.com/watch?v=example4', 'Carl Cox B2B Vintage Culture - Exit 2024', 8.0),
((SELECT id FROM festivals WHERE name = 'EDC Orlando 2024'), 'Deorro B2B Timmy Trumpet', 'Friday', '00:30', 90, 'Kinetic Field', 'Worldwide Debut', 'House / Hardstyle', 'Pop EDM', 'https://youtube.com/watch?v=example5', 'Deorro B2B Timmy Trumpet - UMF 2023', 7.2),
((SELECT id FROM festivals WHERE name = 'EDC Orlando 2024'), 'Diplo', 'Friday', '02:00', 60, 'Kinetic Field', 'Sunset Set', 'Pop', 'Pop EDM', 'https://youtube.com/watch?v=example6', 'Diplo - Rio 2024', 5.0),
((SELECT id FROM festivals WHERE name = 'EDC Orlando 2024'), 'Fisher', 'Friday', '03:00', 60, 'Kinetic Field', '', 'House', 'Pop EDM', 'https://youtube.com/watch?v=example7', 'Fisher - Outside Lands 2023', 7.6),
((SELECT id FROM festivals WHERE name = 'EDC Orlando 2024'), 'Hedex', 'Friday', '19:00', 60, 'Circuit Grounds', '', 'Drum & Bass', 'Bass', 'https://youtube.com/watch?v=example8', 'Hedex - EDCLV 2024', 6.6),
((SELECT id FROM festivals WHERE name = 'EDC Orlando 2024'), 'Kaskade B2B Alison Wonderland', 'Friday', '01:00', 90, 'Kinetic Field', '', 'Big Room / Trap', 'Pop EDM', 'https://youtube.com/watch?v=example9', 'Kaskade B2B Alison Wonderland - Coachella 2024', 8.2),
((SELECT id FROM festivals WHERE name = 'EDC Orlando 2024'), 'Lost Frequencies', 'Friday', '20:30', 60, 'Kinetic Field', '', 'House', 'Pop EDM', 'https://youtube.com/watch?v=example10', 'Lost Frequencies - Tomorrowland 2024', 7.4);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_festivals_updated_at BEFORE UPDATE ON festivals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_acts_updated_at BEFORE UPDATE ON acts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ratings_updated_at BEFORE UPDATE ON user_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
