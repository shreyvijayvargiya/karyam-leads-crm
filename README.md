# Karyam Leads CRM

Vite + Tailwind + shadcn + Framer Motion CRM for manufacturer outreach. Notion tokens live on `:root` / `html[data-theme="notion"]`. Data lives in the browser. The only server process is Twilio SMS.

## Run

```bash
npm install
npm run dev
```

App: http://localhost:3002  
SMS API: http://127.0.0.1:8787

## Twilio (3 values, hardcoded)

Paste into `server/sms-config.js`:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM` (your Twilio number, E.164, e.g. `+1415…`)

No `.env` files. Restart `npm run dev` after editing.

India numbers in the table (`+91 …`) are normalized before send.

## Pages

- Dashboard
- Leads (nested tables in the sidebar, Excel import creates a new table)
- Messages (SMS templates)
- Logs (send history in localStorage)

Excel columns: Business / Category / City / Phone (header names are matched loosely).
