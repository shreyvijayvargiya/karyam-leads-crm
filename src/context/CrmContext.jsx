import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { KOTA_LEADS } from "@/data/kotaLeads";
import { uid } from "@/lib/utils";

const STORAGE_KEY = "karyam-crm-store";
export const DEFAULT_TABLE_ID = "kota-jaipur-manufacturers";
export const STATUSES = ["pending", "send", "confirmed", "rejected"];

function makeLead(row, index = 0) {
	return {
		id: uid("lead"),
		business: row.business || "",
		category: row.category || "",
		city: row.city || "",
		phone: row.phone || "",
		status: row.status || "pending",
		lastMessage: row.lastMessage || "",
		notes: row.notes || "",
		order: index,
	};
}

function seedTables() {
	return [
		{
			id: DEFAULT_TABLE_ID,
			name: "Kota & Jaipur manufacturers",
			createdAt: new Date().toISOString(),
			rows: KOTA_LEADS.map((lead, index) => makeLead(lead, index)),
		},
	];
}

function loadStore() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { tables: seedTables(), logs: [], templates: defaultTemplates() };
		const parsed = JSON.parse(raw);
		if (!parsed.tables?.length) parsed.tables = seedTables();
		if (!Array.isArray(parsed.logs)) parsed.logs = [];
		if (!Array.isArray(parsed.templates)) parsed.templates = defaultTemplates();
		return parsed;
	} catch {
		return { tables: seedTables(), logs: [], templates: defaultTemplates() };
	}
}

function defaultTemplates() {
	return [
		{
			id: "intro",
			name: "Intro",
			body: "Namaste, this is Karyam. We supply industrial materials and would like to connect regarding your requirements. Please reply if we can share details.",
		},
	];
}

const CrmContext = createContext(null);

export function CrmProvider({ children }) {
	const [store, setStore] = useState(() =>
		typeof window === "undefined"
			? { tables: seedTables(), logs: [], templates: defaultTemplates() }
			: loadStore()
	);

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
	}, [store]);

	const value = useMemo(() => {
		const updateTable = (tableId, updater) => {
			setStore((prev) => ({
				...prev,
				tables: prev.tables.map((table) =>
					table.id === tableId ? updater(table) : table
				),
			}));
		};

		return {
			tables: store.tables,
			logs: store.logs,
			templates: store.templates,
			getTable: (id) => store.tables.find((table) => table.id === id),
			addTable: (name, leads) => {
				const table = {
					id: uid("table"),
					name,
					createdAt: new Date().toISOString(),
					rows: leads.map((lead, index) => makeLead(lead, index)),
				};
				setStore((prev) => ({ ...prev, tables: [...prev.tables, table] }));
				return table;
			},
			renameTable: (tableId, name) =>
				updateTable(tableId, (table) => ({ ...table, name })),
			deleteTable: (tableId) => {
				if (tableId === DEFAULT_TABLE_ID) return;
				setStore((prev) => ({
					...prev,
					tables: prev.tables.filter((table) => table.id !== tableId),
				}));
			},
			addLead: (tableId, lead) =>
				updateTable(tableId, (table) => ({
					...table,
					rows: [...table.rows, makeLead(lead, table.rows.length)],
				})),
			updateLead: (tableId, leadId, patch) =>
				updateTable(tableId, (table) => ({
					...table,
					rows: table.rows.map((row) =>
						row.id === leadId ? { ...row, ...patch } : row
					),
				})),
			deleteLead: (tableId, leadId) =>
				updateTable(tableId, (table) => ({
					...table,
					rows: table.rows.filter((row) => row.id !== leadId),
				})),
			addLog: (entry) =>
				setStore((prev) => ({
					...prev,
					logs: [
						{
							id: uid("log"),
							at: new Date().toISOString(),
							...entry,
						},
						...prev.logs,
					].slice(0, 500),
				})),
			clearLogs: () => setStore((prev) => ({ ...prev, logs: [] })),
			saveTemplate: (name, body) =>
				setStore((prev) => ({
					...prev,
					templates: [...prev.templates, { id: uid("tpl"), name, body }],
				})),
			deleteTemplate: (id) =>
				setStore((prev) => ({
					...prev,
					templates: prev.templates.filter((item) => item.id !== id),
				})),
		};
	}, [store]);

	return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
	const ctx = useContext(CrmContext);
	if (!ctx) throw new Error("useCrm must be used inside CrmProvider");
	return ctx;
}
