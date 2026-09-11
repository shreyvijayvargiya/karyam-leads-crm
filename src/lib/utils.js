import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function uid(prefix = "id") {
	return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function toE164(phone) {
	const raw = String(phone || "").trim();
	const digits = raw.replace(/\D/g, "");
	if (!digits) return "";
	if (raw.startsWith("+")) return `+${digits}`;
	if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
	if (digits.length === 10) return `+91${digits}`;
	return `+${digits}`;
}
