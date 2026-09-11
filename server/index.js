import cors from "cors";
import express from "express";
import twilio from "twilio";
import {
	TWILIO_ACCOUNT_SID,
	TWILIO_AUTH_TOKEN,
	TWILIO_FROM,
	twilioReady,
} from "./sms-config.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

function toE164(phone) {
	const raw = String(phone || "").trim();
	const digits = raw.replace(/\D/g, "");
	if (!digits) return null;
	if (raw.startsWith("+")) return `+${digits}`;
	if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
	if (digits.length === 10) return `+91${digits}`;
	return `+${digits}`;
}

function getClient() {
	if (!twilioReady()) {
		const err = new Error(
			"Paste Twilio Account SID, Auth Token, and From number in server/sms-config.js"
		);
		err.status = 400;
		throw err;
	}
	return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

app.get("/api/health", (_req, res) => {
	res.json({ ok: true, smsReady: twilioReady(), from: TWILIO_FROM });
});

app.post("/api/sms/send", async (req, res) => {
	try {
		const { to, body, leadId, tableId, business } = req.body || {};
		const message = String(body || "").trim();
		const e164 = toE164(to);
		if (!e164) {
			return res.status(400).json({ ok: false, error: "Missing phone number" });
		}
		if (!message) {
			return res.status(400).json({ ok: false, error: "Message is empty" });
		}
		const client = getClient();
		const result = await client.messages.create({
			to: e164,
			from: TWILIO_FROM,
			body: message,
		});
		res.json({
			ok: true,
			sid: result.sid,
			status: result.status,
			to: e164,
			leadId: leadId || null,
			tableId: tableId || null,
			business: business || null,
			body: message,
		});
	} catch (error) {
		res.status(error.status || 500).json({
			ok: false,
			error: error.message || "Failed to send SMS",
		});
	}
});

app.post("/api/sms/bulk", async (req, res) => {
	try {
		const { recipients, body } = req.body || {};
		const message = String(body || "").trim();
		if (!message) {
			return res.status(400).json({ ok: false, error: "Message is empty" });
		}
		if (!Array.isArray(recipients) || recipients.length === 0) {
			return res.status(400).json({ ok: false, error: "No recipients" });
		}
		const client = getClient();
		const results = [];
		for (const recipient of recipients) {
			const e164 = toE164(recipient.to || recipient.phone);
			if (!e164) {
				results.push({
					ok: false,
					leadId: recipient.leadId || null,
					error: "Invalid phone",
				});
				continue;
			}
			try {
				const result = await client.messages.create({
					to: e164,
					from: TWILIO_FROM,
					body: message,
				});
				results.push({
					ok: true,
					sid: result.sid,
					status: result.status,
					to: e164,
					leadId: recipient.leadId || null,
					tableId: recipient.tableId || null,
					business: recipient.business || null,
					body: message,
				});
			} catch (error) {
				results.push({
					ok: false,
					to: e164,
					leadId: recipient.leadId || null,
					error: error.message || "Send failed",
				});
			}
		}
		res.json({
			ok: results.every((item) => item.ok),
			sent: results.filter((item) => item.ok).length,
			failed: results.filter((item) => !item.ok).length,
			results,
		});
	} catch (error) {
		res.status(error.status || 500).json({
			ok: false,
			error: error.message || "Bulk SMS failed",
		});
	}
});

const port = 8787;
app.listen(port, () => {
	console.log(`SMS API http://127.0.0.1:${port} ready=${twilioReady()}`);
});
