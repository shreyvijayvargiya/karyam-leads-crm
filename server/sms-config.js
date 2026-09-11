/**
 * Paste your Twilio credentials here once. No .env files needed.
 * Console: https://console.twilio.com
 */
export const TWILIO_ACCOUNT_SID = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
export const TWILIO_AUTH_TOKEN = "paste_twilio_auth_token_here";
export const TWILIO_FROM = "+1XXXXXXXXXX";

export function twilioReady() {
	return (
		TWILIO_ACCOUNT_SID.startsWith("AC") &&
		!TWILIO_ACCOUNT_SID.includes("xxxx") &&
		TWILIO_AUTH_TOKEN.length > 20 &&
		!TWILIO_AUTH_TOKEN.includes("paste_") &&
		TWILIO_FROM.startsWith("+") &&
		!TWILIO_FROM.includes("XXXX")
	);
}
