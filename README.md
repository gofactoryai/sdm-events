# Sales Events Portal

Admin portal for dealership Facebook sales events (replaces the Google Sheets).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

The database is a local SQLite file at `data/app.db`, created and filled with demo data on first run.
Delete the `data/` folder to start over. Uploaded reports live in `data/uploads/`. Ad copy and images are Google Doc / Google Drive links on each event.

## Roles

There is no login yet. Use **Viewing as** in the top-right to switch between:

- **Admin team** – spreadsheet grid of all events (paste Google Doc/Drive links right into the grid), dealerships + GHL/CloseBot setup queue, ad copy approval, reports
- **Client** – add dealerships and events, current and past events, approve ad copy (Google Doc), download reports. Sees "AI Bot" instead of CloseBot.
- **BDC team** – upcoming/running events only, one-page event summary with PDF download
- **Retargeting team** – active events only (Scheduled, Running, Paused), each with an "Open retargeting sheet" button

Role checks live in `src/lib/session.ts`; that's the one file to change when real logins are added.

## Where things are

- `src/lib/db.ts` – schema; `src/lib/seed.ts` – demo data
- `src/app/actions.ts` – every save/update
- `src/app/(app)/admin`, `client`, `bdc` – pages per role; `src/app/share` – login-free ad copy approval link
