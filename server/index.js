import cors from "cors";
import express from "express";
import { FAST2SMS_API_KEY, smsReady } from "./sms-config.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

function toIndianMobile(phone) {
	const digits = String(phone || "").replace(/\D/g, "");
	if (!digits) return null;
	if (digits.length === 10) return digits;
	if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
	if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
	if (digits.length > 10 && digits.startsWith("91")) return digits.slice(-10);
	return null;
}

function requireKey() {
	if (!smsReady()) {
		const err = new Error(
			"Paste your Fast2SMS API key in server/sms-config.js (Dev API → Authorization)"
		);
		err.status = 400;
		throw err;
	}
}

function fast2smsMessage(payload, fallback) {
	if (!payload) return fallback;
	if (Array.isArray(payload.message)) return payload.message.filter(Boolean).join(" ");
	if (typeof payload.message === "string") return payload.message;
	return fallback;
}

async function sendFast2Sms({ numbers, message }) {
	requireKey();
	const mobiles = [...new Set(numbers.map(toIndianMobile).filter(Boolean))];
	if (!mobiles.length) {
		const err = new Error("No valid 10-digit Indian mobile numbers");
		err.status = 400;
		throw err;
	}

	const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
		method: "POST",
		headers: {
			Authorization: FAST2SMS_API_KEY,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			route: "q",
			message,
			numbers: mobiles.join(","),
			sms_details: "1",
		}),
	});

	const data = await response.json().catch(() => ({}));
	if (!response.ok || data.return === false) {
		const err = new Error(
			fast2smsMessage(data, `Fast2SMS error ${data.status_code || response.status}`)
		);
		err.status = response.status >= 400 ? response.status : 400;
		err.code = data.status_code || null;
		throw err;
	}

	return {
		sid: data.request_id || null,
		status: "sent",
		numbers: mobiles,
		raw: data,
	};
}

app.get("/api/health", (_req, res) => {
	res.json({ ok: true, provider: "fast2sms", smsReady: smsReady() });
});

app.post("/api/sms/send", async (req, res) => {
	try {
		const { to, body, leadId, tableId, business } = req.body || {};
		const message = String(body || "").trim();
		const mobile = toIndianMobile(to);
		if (!mobile) {
			return res.status(400).json({ ok: false, error: "Missing or invalid Indian mobile" });
		}
		if (!message) {
			return res.status(400).json({ ok: false, error: "Message is empty" });
		}
		const result = await sendFast2Sms({ numbers: [mobile], message });
		res.json({
			ok: true,
			sid: result.sid,
			status: result.status,
			to: mobile,
			leadId: leadId || null,
			tableId: tableId || null,
			business: business || null,
			body: message,
		});
	} catch (error) {
		res.status(error.status || 500).json({
			ok: false,
			error: error.message || "Failed to send SMS",
			code: error.code || null,
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

		const prepared = recipients.map((recipient) => {
			const mobile = toIndianMobile(recipient.to || recipient.phone);
			return { recipient, mobile };
		});
		const invalid = prepared.filter((item) => !item.mobile);
		const valid = prepared.filter((item) => item.mobile);

		if (!valid.length) {
			return res.status(400).json({ ok: false, error: "No valid Indian mobiles" });
		}

		const result = await sendFast2Sms({
			numbers: valid.map((item) => item.mobile),
			message,
		});

		const results = [
			...valid.map((item) => ({
				ok: true,
				sid: result.sid,
				status: result.status,
				to: item.mobile,
				leadId: item.recipient.leadId || null,
				tableId: item.recipient.tableId || null,
				business: item.recipient.business || null,
				body: message,
			})),
			...invalid.map((item) => ({
				ok: false,
				leadId: item.recipient.leadId || null,
				error: "Invalid phone",
			})),
		];

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
			code: error.code || null,
		});
	}
});

const port = 8787;
app.listen(port, () => {
	console.log(`SMS API http://127.0.0.1:${port} provider=fast2sms ready=${smsReady()}`);
});
