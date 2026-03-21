# Exam Module Production Refactor
✅ Plan approved by user

## Steps:
- [ ] 1. Install new dependencies (zod, @tanstack/react-query, rate-limiter-flexible)
- ✅ 2. Create Zod validation schemas (src/validations/examValidation.js)
- ✅ 3. Refactor Exam model & add indexes/middleware (src/models/Exam.js)
- ✅ 4. Enhance ExamSchedule & other models (collegeId, etc.)
- [ ] 5. Centralize passwords to User model, migrate logic
- ✅ 6. Fix NextAuth: single DB connect (cached), rate limiting (src/app/api/auth/[...nextauth]/route.js)
- [ ] 7. Enhance guards: requireCollegeRole (src/lib/)
- [ ] 8. Refactor API routes: add Zod, pagination, college filters (src/app/api/exams/route.js etc.)
- [ ] 9. Create examService.js (src/services/)
- [ ] 10. Frontend: Add React Query to exam pages/components
- [ ] 11. Add tests, env validation
- [ ] 12. Performance: Add Redis caching if needed
- [ ] 13. Review & complete

Current step: Starting #1

