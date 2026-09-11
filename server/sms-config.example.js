/**
 * Copy to server/sms-config.js (gitignored).
 * Key: Fast2SMS → Dev API → Authorization
 * https://docs.fast2sms.com/reference/authorization
 */
export const FAST2SMS_API_KEY = "PASTE_FAST2SMS_API_KEY";

export function smsReady() {
	const key = String(FAST2SMS_API_KEY || "").trim();
	return key.length > 20 && !key.includes("PASTE_");
}
