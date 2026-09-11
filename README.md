# Karyam Leads CRM

Vite + Tailwind + shadcn + Framer Motion CRM for manufacturer outreach. Notion tokens live on `:root` / `html[data-theme="notion"]`. Data lives in the browser. The only server process is Fast2SMS.

## Run

```bash
npm install
npm run dev
```

App: http://localhost:3002  
SMS API: http://127.0.0.1:8787

## Fast2SMS (1 key)

Copy `server/sms-config.example.js` to `server/sms-config.js` (gitignored) and paste:

- `FAST2SMS_API_KEY` from [Fast2SMS Dev API](https://www.fast2sms.com) → Authorization header ([docs](https://docs.fast2sms.com/reference/authorization))

Restart `npm run dev` after editing. Quick SMS uses `route=q` on `POST https://www.fast2sms.com/dev/bulkV2`. Numbers are sent as 10-digit Indian mobiles.

## Pages

- Dashboard
- Leads (nested tables in the sidebar, Excel import creates a new table)
- Messages (SMS templates)
- Logs (send history in localStorage)

Excel columns: Business / Category / City / Phone (header names are matched loosely).
