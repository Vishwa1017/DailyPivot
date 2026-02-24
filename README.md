# Daily Pivot

A minimal daily accountability tracker built with:

- Next.js (App Router)
- TypeScript
- Supabase (Auth + Postgres + RLS)
- TailwindCSS
- React Day Picker

## Features

- Email/password authentication
- One entry per day (enforced)
- Edit existing entry
- Calendar view with:
  - Completed days
  - Missed days
- History viewer
- Password reset
- Secure Row-Level Security

## Tech Highlights

- RLS enforced per user
- Upsert pattern for idempotent writes
- Optimistic UI updates
- Clean component separation

## Future Ideas

- AI scoring
- Streak logic
- Reminder notifications
- Export data