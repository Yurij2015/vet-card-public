The following files should be deleted to resolve Next.js dynamic route conflicts:
- /pages/index.tsx
- /pages/my-appointments.tsx
- /pages/[slug]/index.tsx
- /pages/[slug]/appointment.tsx

All routes are now handled under /pages/[lang]/... for locale-prefixed URLs.
