# Festi Besti - Project Summary

## Overview

**Festi Besti** is a modern web application designed to revolutionize music festival planning and scheduling. Built with React and Supabase, it provides festival-goers with an intuitive platform to discover festivals, plan their schedules, rate artists, and share their personalized experiences with friends.

## Core Purpose

The application addresses the common challenges faced by festival attendees:
- **Schedule Management**: Easily filter and organize festival lineups by day, stage, genre, and time
- **Personal Preferences**: Rate artists with a sophisticated 5-star system to track interests
- **Social Sharing**: Export personalized schedules for sharing with friends
- **Mobile Integration**: Generate lock screen images for easy festival day access

## Key Features

### 🎵 Festival Discovery
- Browse upcoming music festivals with rich visual cards
- Festival status tracking (announced → lineup → stages → schedule → times → complete)
- Detailed festival information including dates, location, and descriptions

### 📅 Smart Scheduling System
- **Multiple View Modes**:
  - Lineup View: Alphabetical artist listing
  - Schedule View: Time-based scheduling
  - Stages View: Stage-grouped organization
  - Schedule by Day: Day-filtered stage grouping
- Advanced filtering by day, stage, genre, and time
- Interactive day selection with dynamic content updates

### ⭐ Advanced Rating System
- 5-star rating system (1-5 stars)
- Interactive star component with hover effects
- Descriptive rating labels (Not for Me, Meh, Interested, Hyped, Must See!!)
- Real-time rating persistence to Supabase database

### 🔐 User Authentication & Role Management
- **Three-tier role system**:
  - **Viewer**: Can view festivals, acts, and rate artists
  - **Editor**: Can view, rate, and edit act information
  - **Admin**: Full access including user role management
- Secure authentication via Supabase Auth
- Row Level Security (RLS) policies for data protection

### 📱 Export & Sharing Capabilities
- PDF schedule generation
- Mobile lock screen image creation
- Social sharing functionality
- Personalized schedule export

## Technical Architecture

### Frontend Stack
- **React 18** with Vite for fast development
- **React Router** for client-side routing
- **Tailwind CSS** for responsive, modern styling
- **Lucide React** for consistent iconography
- **date-fns** for date manipulation
- **html2canvas** for image generation

### Backend & Database
- **Supabase** as Backend-as-a-Service
- **PostgreSQL** database with Row Level Security
- **Real-time subscriptions** for live updates
- **Authentication** with email/password

### Database Schema

#### Core Tables
1. **festivals**: Festival metadata (name, dates, location, status, image)
2. **acts**: Individual performances (artist, time, stage, genre, YouTube links)
3. **user_ratings**: User-specific ratings (1-5 stars)
4. **user_profiles**: User information with role-based access control

#### Key Features
- **Festival Status Enum**: Tracks festival progression from announcement to completion
- **User Role Enum**: Implements three-tier permission system
- **Automatic Timestamps**: Created/updated timestamps with triggers
- **Performance Indexes**: Optimized queries for filtering and sorting

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AnnouncedView.jsx    # Festival announcement display
│   ├── LineupView.jsx       # Alphabetical artist listing
│   ├── LoginModal.jsx       # Authentication interface
│   ├── RoleBasedExample.jsx # Role system demonstration
│   ├── ScheduleByDayView.jsx # Day-filtered scheduling
│   ├── ScheduleView.jsx     # Time-based scheduling
│   ├── StagesView.jsx       # Stage-grouped organization
│   └── StarRating.jsx       # Interactive rating component
├── hooks/              # Custom React hooks
│   └── useAuth.jsx     # Authentication and role management
├── pages/              # Main application pages
│   ├── ExportPage.jsx      # Schedule export functionality
│   ├── FestivalDetailPage.jsx # Individual festival view
│   └── LandingPage.jsx      # Homepage with festival grid
├── types/              # TypeScript definitions
│   └── index.js
├── utils/               # Utility functions
│   ├── csvImport.js         # CSV data import
│   ├── exportSchedule.js    # Schedule export logic
│   ├── scheduleUtils.js     # Scheduling utilities
│   └── supabase.js          # Database configuration
├── App.jsx             # Main application component
└── main.jsx            # Application entry point
```

## Data Management

### CSV Import System
The application supports importing festival data via CSV files with standardized columns:
- Artist, Day, Start Time, Length, Stage, Special Notes, Genre, Category
- YouTube URLs and titles for artist discovery
- User rating columns for collaborative rating

### Sample Data
- **EDC Orlando 2024**: Complete festival with full schedule and ratings
- **EDC Orlando 2025**: Upcoming festival with lineup data
- Multiple festival examples (Ultra, Tomorrowland)

## User Experience

### Landing Page
- Hero section with value proposition
- Festival grid with status indicators
- Feature highlights (Smart Scheduling, Personal Preferences, Export & Share)
- Authentication integration

### Festival Detail Pages
- Dynamic view switching (Lineup, Schedule, Stages, Schedule by Day)
- Interactive filtering and sorting
- Real-time rating system
- Export functionality

### Authentication Flow
- Modal-based login/signup
- Role-based UI adaptation
- Secure session management
- Profile management with username updates

## Security & Permissions

### Row Level Security (RLS)
- **Festivals**: Public read access
- **Acts**: Public read, role-based write access
- **User Ratings**: User-specific access only
- **User Profiles**: Self-management with admin override

### Role-Based Access Control
- Database-level permission enforcement
- Frontend UI adaptation based on user role
- Admin-only user role management
- Secure function-based permission checking

## Development & Deployment

### Environment Setup
- Node.js 18+ requirement
- Supabase project configuration
- Environment variables for API keys
- Database schema initialization

### Build Process
- Vite-based development server
- Production build optimization
- Static asset management
- Progressive Web App capabilities

## Future Enhancements

### Planned Features
- Real-time collaboration on festival schedules
- Social features for friend groups
- Advanced filtering and search capabilities
- Mobile app development
- Integration with music streaming services

### Scalability Considerations
- Database indexing for performance
- Caching strategies for festival data
- CDN integration for images
- Real-time subscription optimization

## Business Value

### For Festival Organizers
- Centralized festival information management
- User engagement tracking through ratings
- Community building around festivals
- Data insights on artist popularity

### For Festival Goers
- Streamlined festival planning experience
- Personalized schedule creation
- Social sharing capabilities
- Mobile-optimized access

## Technical Highlights

### Performance Optimizations
- Lazy loading of festival data
- Efficient database queries with proper indexing
- Optimized image loading and caching
- Minimal bundle size with tree shaking

### User Experience Features
- Responsive design for all device sizes
- Smooth animations and transitions
- Intuitive navigation and filtering
- Accessibility considerations

### Code Quality
- Component-based architecture
- Custom hooks for reusable logic
- TypeScript integration for type safety
- Comprehensive error handling

---

**Festi Besti** represents a modern approach to festival planning, combining intuitive user experience with robust technical architecture to create a platform that serves both festival organizers and attendees effectively.
