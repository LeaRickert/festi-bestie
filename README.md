# Festi Besti - Festival Planning Made Easy

A modern web application for planning music festival schedules with friends. Built with React, Vite, and Supabase.

## Features

- 🎵 **Festival Discovery**: Browse upcoming music festivals
- 📅 **Smart Scheduling**: Filter and sort acts by day, stage, genre, and time
- ⭐ **5-Star Rating System**: Rate acts with half-star precision (0-5 scale)
- 📱 **Export & Share**: Export schedules as PDF or mobile lock screen images
- 🔐 **User Authentication**: Sign up/login to save your ratings
- 🎨 **Modern UI**: Beautiful, responsive design with dark theme

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Export**: html2canvas + jsPDF

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd festi-besti
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Create a `.env.local` file in the root directory:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

4. **Set up the database**
   Run the SQL commands from `supabase-setup.sql` in your Supabase SQL editor, or copy the commands below:

   ```sql
   -- Create festivals table
   CREATE TABLE festivals (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     start_date DATE NOT NULL,
     end_date DATE NOT NULL,
     location TEXT NOT NULL,
     image_url TEXT,
     description TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create acts table
   CREATE TABLE acts (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
     artist TEXT NOT NULL,
     day TEXT NOT NULL,
     start_time TIME NOT NULL,
     length_minutes INTEGER DEFAULT 60,
     stage TEXT NOT NULL,
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
   CREATE TABLE user_ratings (
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

   -- Create policies
   CREATE POLICY "Festivals are viewable by everyone" ON festivals FOR SELECT USING (true);
   CREATE POLICY "Acts are viewable by everyone" ON acts FOR SELECT USING (true);
   
   CREATE POLICY "Users can manage their own ratings" ON user_ratings 
     FOR ALL USING (auth.uid() = user_id);
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── LoginModal.jsx
│   └── StarRating.jsx
├── hooks/              # Custom React hooks
│   └── useAuth.jsx
├── pages/              # Page components
│   ├── LandingPage.jsx
│   └── FestivalDetailPage.jsx
├── types/              # TypeScript type definitions
│   └── index.js
├── utils/               # Utility functions
│   ├── supabase.js
│   ├── exportSchedule.js
│   └── csvImport.js
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## Usage

### For Festival Organizers

1. **Add Festivals**: Use the Supabase dashboard to add festival information
2. **Import Lineup**: Use the CSV import utility or manually add acts via Supabase
3. **Manage Acts**: Update set times, stages, YouTube links, and special notes

### For Festival Goers

1. **Browse Festivals**: View upcoming festivals on the landing page
2. **Plan Schedule**: Filter acts by day, stage, genre, and time
3. **Rate Acts**: Use the 5-star rating system to rate acts (0-5 with half-star precision)
4. **Export Schedule**: Download PDF or mobile lock screen images
5. **Share with Friends**: Export and share your personalized schedule

## Rating System

The app features a 5-star rating system with half-star precision:

- **0 stars**: Not rated
- **1 star**: Poor
- **2 stars**: Fair
- **3 stars**: Good
- **4 stars**: Very Good
- **5 stars**: Excellent

Users can click on stars to set ratings, and click again to toggle half-star ratings (e.g., 3 → 2.5).

## Data Format

The application expects CSV data with the following columns:
- Artist
- Day (Friday, Saturday, Sunday)
- Start Time
- Length (in minutes)
- Stage
- Special Notes
- Genre
- Category
- YouTube URL (optional)
- YouTube Title (optional)

## Database Schema

### Key Tables

- **festivals**: Festival information (name, dates, location, image)
- **acts**: Individual performances (artist, time, stage, genre, YouTube links)
- **user_ratings**: User ratings for acts (0-5 scale with half-star precision)

### Features

- **Row Level Security**: Users can only access their own ratings
- **Real-time Updates**: Ratings are saved immediately to Supabase
- **Conflict Resolution**: Proper upsert handling prevents duplicate key errors

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for music festival lovers everywhere.