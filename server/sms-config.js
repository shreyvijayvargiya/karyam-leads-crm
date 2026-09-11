/**
 * Paste your Fast2SMS Authorization key from
 * https://www.fast2sms.com (Dev API). This file is gitignored.
 */
export const FAST2SMS_API_KEY = "pV9N0rvj4KFUs1tnMXiAlweQRbWG2kZgaDL6E3dCmJucIB5Yh7ECzl5q4vS1HcVsUkZwIJpQATjgW8FG";

export function smsReady() {
	const key = String(FAST2SMS_API_KEY || "").trim();
	return key.length > 20 && !key.includes("PASTE_");
}
