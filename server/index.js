import { execFile } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import cors from "cors";
import express from "express";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(__dirname, "send-iphone-sms.applescript");

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
	if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
	return `+${digits}`;
}

function smsReady() {
	return process.platform === "darwin";
}

function explainOsascript(error) {
	const text = `${error.stderr || ""} ${error.message || ""}`.toLowerCase();
	if (process.platform !== "darwin") {
		return "iPhone SMS only works on a Mac with Text Message Forwarding.";
	}
	if (text.includes("not authorized") || text.includes("-1743") || text.includes("1002")) {
		return "macOS blocked automation. System Settings → Privacy & Security → Automation → allow node/osascript to control Messages. Then retry.";
	}
	if (text.includes("sms") && (text.includes("account") || text.includes("service"))) {
		return "No SMS account in Messages. On iPhone: Settings → Messages → Text Message Forwarding → enable this Mac. Keep the iPhone nearby.";
	}
	return error.stderr?.toString().trim() || error.message || "Failed to send via Messages";
}

async function sendViaIPhone(phone, message) {
	if (!smsReady()) {
		const err = new Error("iPhone SMS only works on a Mac.");
		err.status = 400;
		throw err;
	}
	const e164 = toE164(phone);
	if (!e164) {
		const err = new Error("Invalid phone number");
		err.status = 400;
		throw err;
	}
	try {
		await execFileAsync("osascript", [SCRIPT, e164, message], { timeout: 25000 });
		return { sid: `iphone-${Date.now()}`, status: "sent", to: e164 };
	} catch (error) {
		const err = new Error(explainOsascript(error));
		err.status = 500;
		throw err;
	}
}

app.get("/api/health", (_req, res) => {
	res.json({
		ok: true,
		provider: "iphone-messages",
		smsReady: smsReady(),
		platform: process.platform,
	});
});

app.post("/api/sms/send", async (req, res) => {
	try {
		const { to, body, leadId, tableId, business } = req.body || {};
		const message = String(body || "").trim();
		if (!message) {
			return res.status(400).json({ ok: false, error: "Message is empty" });
		}
		const result = await sendViaIPhone(to, message);
		res.json({
			ok: true,
			sid: result.sid,
			status: result.status,
			to: result.to,
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

		const results = [];
		for (const recipient of recipients) {
			const phone = recipient.to || recipient.phone;
			try {
				const result = await sendViaIPhone(phone, message);
				results.push({
					ok: true,
					sid: result.sid,
					status: result.status,
					to: result.to,
					leadId: recipient.leadId || null,
					tableId: recipient.tableId || null,
					business: recipient.business || null,
					body: message,
				});
				await new Promise((resolve) => setTimeout(resolve, 700));
			} catch (error) {
				results.push({
					ok: false,
					to: toE164(phone),
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
	console.log(
		`SMS API http://127.0.0.1:${port} provider=iphone-messages ready=${smsReady()}`
	);
});
