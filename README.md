# User Management Dashboard

A beginner-friendly React app for managing and browsing users from JSONPlaceholder.

## Project Overview

- Search users by name
- Sort users A → Z or Z → A
- Open a user detail card
- Click the website to visit the user site
- Light and dark theme support
- Responsive layout for mobile, tablet, and desktop
- Pagination for easier browsing

## Technologies Used

- React
- Vite
- Context API
- Plain CSS

## Setup Instructions

```bash
npm install
npm run dev
```

## Features Implemented

- Fetches users from `https://jsonplaceholder.typicode.com/users`
- Search and sort controls
- Custom React routing for home and detail views
- Loading, error, and empty states
- Website link in user details
- Responsive UI

## Deployment on Vercel

This project includes `vercel.json` for SPA routing support on Vercel.

### Deploy Steps

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Keep the default build command as `npm run build`.
4. Set the output directory to `dist` if Vercel does not detect it automatically.
5. Deploy the app.

### Notes

- `vercel.json` handles client-side routes like `/users/1`.

## Live Deployment Link

https://user-dash-board-nu.vercel.app/
