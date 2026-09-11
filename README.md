# Karyam Leads CRM

Vite + Tailwind + shadcn CRM. Notion theme. Leads live in the browser.

## Run

```bash
npm install
npm run dev
```

App: http://localhost:3002  
SMS helper: http://127.0.0.1:8787 (Mac Messages → iPhone SIM)

## How to send SMS from your iPhone (free, local)

This uses **your Indian SIM**, not Twilio/Fast2SMS.

### 1. Turn on Text Message Forwarding

1. iPhone and this Mac signed into the **same Apple ID**.
2. iPhone nearby, Wi‑Fi or Bluetooth on.
3. iPhone → **Settings → Apps → Messages → Text Message Forwarding** (or **Settings → Messages → Text Message Forwarding** on older iOS).
4. Enable **this Mac**. Enter the code that appears on the Mac if asked.
5. Open **Messages** on the Mac. Send one test SMS (green bubble) to your own number. If that works, forwarding is on.

### 2. Allow the CRM to control Messages

1. Keep `npm run dev` running.
2. Send from the CRM once.
3. macOS will ask: **osascript / node wants to control Messages** → **OK**.
4. If you dismissed it: **System Settings → Privacy & Security → Automation** → enable Messages for `osascript` / `node`.

### 3. Send from the table

1. Open http://localhost:3002/leads
2. **Chat bubble** = WhatsApp Web (you send by hand).
3. **Message square** = SMS modal → type text → **Send SMS**.
4. The Mac Messages app sends it; the iPhone radios it out. Status becomes **send**.

Keep the iPhone unlocked or nearby. Bulk SMS goes one-by-one with a short pause.

## Pages

- Dashboard
- Leads (nested tables, Excel import)
- Messages (templates for the SMS modal)
- Logs
