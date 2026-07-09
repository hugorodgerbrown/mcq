# Review synthesis — Phase 2 · 06 · Course management UI

**Verdict: APPROVED (clean).** No blocking findings. Browser confirmation of
criteria 2–4 in verify.

## Scope
Branch `factory/0007-…`. Backend: `course_list` POST (create) + 3 tests. Frontend:
`src/api.js` (+3 fns), `src/App.jsx` (+377, additions — new `CreateCourse`/
`UploadCourse` components + shell `view` wiring). `StudyApp` signature unchanged;
diff confined to import line, `styles` append, new components, and the outer `App`
render gates.

## Acceptance trace
1. create 201/403/400 — `CourseCreateTests` (anon 403, owned-by-caller 201,
   name-required 400). ✓
2. create in browser → upload screen — verify (browser).
3. upload valid CSV → preview → import → study — verify (browser).
4. invalid CSV → errors block import — verify (browser).
5. tox green (28) + `npm run build` exit 0. ✓
6. scope: create endpoint + create/upload screens, StudyApp untouched. ✓

## Structural walk
`App` shell: `view` state (null|create|upload). Empty state / picker → "New
course" → `view=create` → `CreateCourse` (POST create) → set course + `view=upload`
→ `UploadCourse` (importPreview → summary+errors; importCommit disabled while
errors) → "Study now" → `view=null` + `setCourse({...c})` (clone forces the 0006
content-load effect to re-fire post-import). The clone deviation is correct — a
same-ref setCourse would not reload. `importCommit`/`importPreview` use FormData
without an explicit Content-Type (browser sets the multipart boundary); `req`
attaches `X-CSRFToken`.

## Non-blocking notes
- Logout swapped from `<a>` to a button (`window.location.href`) — behavior same.
- Create/delete/rename beyond create+import deferred (spec non-goal).
