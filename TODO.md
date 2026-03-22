# Fix NextAuth CLIENT_FETCH_ERROR - Online Student Record & Attendance

## Steps (0/6 complete)

### Prerequisites
- NextAuth v4 CLIENT_FETCH_ERROR \"Failed to fetch\" in Turbopack dev due to missing baseUrl

### Step-by-Step Plan

- [ ] **1. Environment Variables** (User Manual)
  Add to `.env.local`:
  ```
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=your-super-secret-key-here-generate-with-openssl-rand-hex-32-at-least-32-chars
  ```

- [x] **2. Update SessionProvider** (Auto: edit src/app/layout.js) ✅
  Add `baseUrl={process.env.NEXTAUTH_URL || 'http://localhost:3000'}` and `refetchInterval={60 * 1000}`

- [ ] **3. Clear Build Cache & Restart**
  ```
  rm -rf .next
  npm run dev
  ```

- [ ] **4. Test Client Fetch**
  - Open DevTools Network tab
  - Navigate to protected page
  - Verify `/api/auth/session` 200 OK, no \"Failed to fetch\"

- [ ] **5. Test Authentication Flow**
  - Login as admin/lecturer/principal/student
  - Check session data loads (useSession)

- [ ] **6. Complete**
  Remove/update TODO.md

## Progress Tracking
Updated when steps complete.

**Status:** Plan implemented. Step 1 pending user action.
