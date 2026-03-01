# OSRA

OSRA is a role-based college portal built with Next.js (App Router), NextAuth, MongoDB, and Tailwind CSS.

## Roles

- Lecturer: attendance and exam operations
- Principal: dashboard and institutional monitoring
- Student: attendance, results, and profile access

## Tech Stack

- Next.js 16
- React 19
- NextAuth (credentials providers)
- MongoDB + Mongoose
- Tailwind CSS 4

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with the required variables:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
```

3. Run the app:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Login Routes

- `/auth/login` - main entry page
- `/lecturer/login`
- `/principal/login`
- `/student/login`

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint codebase
