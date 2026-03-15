# TODO: Fix Admin Routing (/admin/#examenes → main page)

## Steps (to be checked off as completed):

- [ ] Step 1: Update src/App.jsx to support /admin/* subpaths without bypassing router
- [ ] Step 2: Refactor admin/AdminApp.jsx to use nested React Router Routes (path-based instead of hash)
- [   ] Step 3: Update admin/components/Sidebar.jsx to use useNavigate for path-based navigation
- [ ] Step 4: Add route handling for /admin/examenes, /admin/crear-examen, etc.
- [ ] Step 5: Handle legacy hash URLs (/admin/#examenes → redirect to /admin/examenes)
- [ ] Step 6: Test: npm run dev, login as admin, test URLs and sidebar
- [ ] Step 7: Update TODO.md with completion, attempt_completion

Current progress: Starting Step 1
