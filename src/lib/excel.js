import * as XLSX from "xlsx";

const HEADER_MAP = {
	business: ["business", "name", "company", "firm", "account"],
	category: ["category", "type", "industry", "segment"],
	city: ["city", "location", "place", "area"],
	phone: ["phone", "mobile", "contact", "number", "whatsapp", "cell"],
};

function normalizeHeader(value) {
	return String(value || "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ");
}

function pickField(row, keys) {
	for (const key of Object.keys(row)) {
		const normalized = normalizeHeader(key);
		if (keys.some((item) => normalized.includes(item))) {
			const value = row[key];
			if (value != null && String(value).trim()) return String(value).trim();
		}
	}
	return "";
}

export function parseLeadWorkbook(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(new Error("Could not read file"));
		reader.onload = (event) => {
			try {
				const workbook = XLSX.read(event.target.result, { type: "array" });
				const sheetName = workbook.SheetNames[0];
				if (!sheetName) {
					reject(new Error("Workbook has no sheets"));
					return;
				}
				const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
					defval: "",
				});
				const leads = rows
					.map((row) => ({
						business: pickField(row, HEADER_MAP.business),
						category: pickField(row, HEADER_MAP.category),
						city: pickField(row, HEADER_MAP.city),
						phone: pickField(row, HEADER_MAP.phone),
					}))
					.filter((row) => row.business || row.phone);
				if (!leads.length) {
					reject(
						new Error(
							"No rows found. Use columns like Business, Category, City, Phone."
						)
					);
					return;
				}
				resolve({
					name: file.name.replace(/\.(xlsx|xls|csv)$/i, ""),
					leads,
				});
			} catch (error) {
				reject(error);
			}
		};
		reader.readAsArrayBuffer(file);
	});
}
