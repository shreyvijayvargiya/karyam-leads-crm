import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MessageCircle, MessageSquare, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_TABLE_ID, STATUSES, useCrm } from "@/context/CrmContext";
import { parseLeadWorkbook } from "@/lib/excel";
import { whatsappWebUrl } from "@/lib/utils";

const EMPTY_FORM = {
	business: "",
	category: "",
	city: "",
	phone: "",
	status: "pending",
	notes: "",
};

export function LeadsPage() {
	const { tableId } = useParams();
	const navigate = useNavigate();
	const fileRef = useRef(null);
	const {
		tables,
		getTable,
		addTable,
		addLead,
		updateLead,
		deleteLead,
		deleteTable,
		addLog,
		templates,
	} = useCrm();

	const activeId = tableId || tables[0]?.id;
	const table = getTable(activeId);

	useEffect(() => {
		if (!tableId && tables[0]) navigate(`/leads/${tables[0].id}`, { replace: true });
	}, [tableId, tables, navigate]);

	const [sorting, setSorting] = useState([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [cityFilter, setCityFilter] = useState("all");
	const [rowSelection, setRowSelection] = useState({});
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState(EMPTY_FORM);
	const [smsOpen, setSmsOpen] = useState(false);
	const [smsTargets, setSmsTargets] = useState([]);
	const [smsBody, setSmsBody] = useState("");
	const [sending, setSending] = useState(false);

	const cities = useMemo(
		() => [...new Set((table?.rows || []).map((row) => row.city).filter(Boolean))],
		[table]
	);

	const filteredRows = useMemo(() => {
		const rows = table?.rows || [];
		return rows.filter((row) => {
			if (statusFilter !== "all" && row.status !== statusFilter) return false;
			if (cityFilter !== "all" && row.city !== cityFilter) return false;
			return true;
		});
	}, [table, statusFilter, cityFilter]);

	function openWhatsApp(lead) {
		const url = whatsappWebUrl(lead.phone);
		if (!url) {
			toast.error("Invalid phone number");
			return;
		}
		window.open(url, "_blank", "noopener,noreferrer");
		addLog({
			ok: true,
			to: lead.phone,
			business: lead.business,
			body: "Opened WhatsApp Web",
			tableId: activeId,
			tableName: table?.name,
		});
	}

	const columns = useMemo(
		() => [
			{
				id: "select",
				header: ({ table: tbl }) => (
					<Checkbox
						checked={tbl.getIsAllPageRowsSelected()}
						onCheckedChange={(value) => tbl.toggleAllPageRowsSelected(!!value)}
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
					/>
				),
			},
			sortableCol("business", "Business"),
			sortableCol("category", "Category"),
			sortableCol("city", "City"),
			sortableCol("phone", "Phone"),
			{
				accessorKey: "status",
				header: ({ column }) => (
					<Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
						Status <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
					</Button>
				),
				cell: ({ row }) => (
					<Select
						value={row.original.status}
						onValueChange={(value) => updateLead(activeId, row.original.id, { status: value })}
					>
						<SelectTrigger className="h-8 w-[130px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{STATUSES.map((status) => (
								<SelectItem key={status} value={status}>
									{status}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				),
			},
			{
				id: "actions",
				header: "Actions",
				cell: ({ row }) => (
					<div className="flex items-center gap-1">
						<Button
							size="icon"
							variant="ghost"
							title="WhatsApp Web"
							onClick={() => openWhatsApp(row.original)}
						>
							<MessageCircle className="h-4 w-4" />
						</Button>
						<Button
							size="icon"
							variant="ghost"
							title="Send SMS"
							onClick={() => {
								setSmsTargets([row.original]);
								setSmsBody(templates[0]?.body || "");
								setSmsOpen(true);
							}}
						>
							<MessageSquare className="h-4 w-4" />
						</Button>
						<Button
							size="icon"
							variant="ghost"
							onClick={() => {
								setEditing(row.original);
								setForm({
									business: row.original.business,
									category: row.original.category,
									city: row.original.city,
									phone: row.original.phone,
									status: row.original.status,
									notes: row.original.notes || "",
								});
								setFormOpen(true);
							}}
						>
							<Pencil className="h-4 w-4" />
						</Button>
						<Button
							size="icon"
							variant="ghost"
							onClick={() => deleteLead(activeId, row.original.id)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				),
			},
		],
		[activeId, addLog, deleteLead, table?.name, templates, updateLead]
	);

	const reactTable = useReactTable({
		data: filteredRows,
		columns,
		state: { sorting, globalFilter, rowSelection },
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		onRowSelectionChange: setRowSelection,
		enableRowSelection: true,
		getRowId: (row) => row.id,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		globalFilterFn: (row, _columnId, filter) => {
			const q = String(filter).toLowerCase();
			return ["business", "category", "city", "phone", "status", "lastMessage"]
				.map((key) => String(row.original[key] || "").toLowerCase())
				.some((value) => value.includes(q));
		},
		initialState: { pagination: { pageSize: 10 } },
	});

	const selectedLeads = reactTable.getSelectedRowModel().rows.map((row) => row.original);

	async function onImport(event) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;
		try {
			const parsed = await parseLeadWorkbook(file);
			const created = addTable(parsed.name, parsed.leads);
			toast.success(`Imported ${parsed.leads.length} rows into ${created.name}`);
			navigate(`/leads/${created.id}`);
		} catch (error) {
			toast.error(error.message || "Import failed");
		}
	}

	function saveForm() {
		if (!form.business.trim() || !form.phone.trim()) {
			toast.error("Business and phone are required");
			return;
		}
		if (editing) {
			updateLead(activeId, editing.id, form);
			toast.success("Lead updated");
		} else {
			addLead(activeId, form);
			toast.success("Lead added");
		}
		setFormOpen(false);
		setEditing(null);
		setForm(EMPTY_FORM);
	}

	async function sendSms() {
		if (!smsBody.trim() || !smsTargets.length) return;
		setSending(true);
		try {
			const payload =
				smsTargets.length === 1
					? {
							path: "/api/sms/send",
							body: {
								to: smsTargets[0].phone,
								body: smsBody,
								leadId: smsTargets[0].id,
								tableId: activeId,
								business: smsTargets[0].business,
							},
						}
					: {
							path: "/api/sms/bulk",
							body: {
								body: smsBody,
								recipients: smsTargets.map((lead) => ({
									to: lead.phone,
									leadId: lead.id,
									tableId: activeId,
									business: lead.business,
								})),
							},
						};
			const response = await fetch(payload.path, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload.body),
			});
			const data = await response.json();
			if (!response.ok && !data.results) {
				throw new Error(data.error || "SMS failed");
			}
			const results = data.results || [
				{
					ok: data.ok,
					sid: data.sid,
					to: data.to,
					leadId: smsTargets[0].id,
					business: smsTargets[0].business,
					body: smsBody,
					error: data.error,
				},
			];
			results.forEach((result) => {
				addLog({
					ok: !!result.ok,
					to: result.to,
					business: result.business,
					body: smsBody,
					sid: result.sid || "",
					error: result.error || "",
					tableId: activeId,
					tableName: table?.name,
				});
				if (result.ok && result.leadId) {
					updateLead(activeId, result.leadId, {
						status: "send",
						lastMessage: smsBody,
					});
				}
			});
			const sent = results.filter((item) => item.ok).length;
			const failed = results.length - sent;
			if (sent) toast.success(`Sent ${sent} SMS`);
			if (failed) {
				const firstError = results.find((item) => !item.ok)?.error;
				toast.error(firstError || `${failed} failed`);
			}
			setSmsOpen(false);
			setRowSelection({});
		} catch (error) {
			toast.error(error.message || "SMS failed");
		} finally {
			setSending(false);
		}
	}

	if (!table) {
		return <p className="text-sm text-muted-foreground">No lead table selected.</p>;
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">{table.name}</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Sort, search, filter, edit rows. WhatsApp opens Web chat; SMS opens the send modal.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<input
						ref={fileRef}
						type="file"
						accept=".xlsx,.xls,.csv"
						className="hidden"
						onChange={onImport}
					/>
					<Button variant="outline" onClick={() => fileRef.current?.click()}>
						<Upload className="h-4 w-4" />
						Import Excel
					</Button>
					<Button
						variant="outline"
						disabled={!selectedLeads.length}
						onClick={() => {
							setSmsTargets(selectedLeads);
							setSmsBody(templates[0]?.body || "");
							setSmsOpen(true);
						}}
					>
						<MessageSquare className="h-4 w-4" />
						Bulk SMS ({selectedLeads.length})
					</Button>
					<Button
						onClick={() => {
							setEditing(null);
							setForm(EMPTY_FORM);
							setFormOpen(true);
						}}
					>
						<Plus className="h-4 w-4" />
						Add row
					</Button>
					{table.id !== DEFAULT_TABLE_ID ? (
						<Button
							variant="destructive"
							onClick={() => {
								deleteTable(table.id);
								navigate("/leads");
							}}
						>
							Delete table
						</Button>
					) : null}
				</div>
			</div>

			<div className="grid gap-2 md:grid-cols-4">
				<Input
					placeholder="Search business, city, phone…"
					value={globalFilter}
					onChange={(event) => setGlobalFilter(event.target.value)}
				/>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger>
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All statuses</SelectItem>
						{STATUSES.map((status) => (
							<SelectItem key={status} value={status}>
								{status}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select value={cityFilter} onValueChange={setCityFilter}>
					<SelectTrigger>
						<SelectValue placeholder="City" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All cities</SelectItem>
						{cities.map((city) => (
							<SelectItem key={city} value={city}>
								{city}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Badge variant="secondary">{filteredRows.length} rows</Badge>
				</div>
			</div>

			<div className="rounded-2xl border bg-card">
				<Table>
					<TableHeader>
						{reactTable.getHeaderGroups().map((group) => (
							<TableRow key={group.id}>
								{group.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{reactTable.getRowModel().rows.length ? (
							reactTable.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No leads match these filters.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
				<div className="flex items-center justify-between border-t px-4 py-3 text-sm">
					<span className="text-muted-foreground">
						Page {reactTable.getState().pagination.pageIndex + 1} of{" "}
						{reactTable.getPageCount() || 1}
					</span>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={!reactTable.getCanPreviousPage()}
							onClick={() => reactTable.previousPage()}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={!reactTable.getCanNextPage()}
							onClick={() => reactTable.nextPage()}
						>
							Next
						</Button>
					</div>
				</div>
			</div>

			<Dialog open={formOpen} onOpenChange={setFormOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{editing ? "Edit lead" : "Add lead"}</DialogTitle>
						<DialogDescription>Row stays in this table in the browser.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3">
						<Field
							label="Business"
							value={form.business}
							onChange={(value) => setForm((prev) => ({ ...prev, business: value }))}
						/>
						<Field
							label="Category"
							value={form.category}
							onChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
						/>
						<Field
							label="City"
							value={form.city}
							onChange={(value) => setForm((prev) => ({ ...prev, city: value }))}
						/>
						<Field
							label="Phone"
							value={form.phone}
							onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
						/>
						<div className="grid gap-1.5">
							<Label>Status</Label>
							<Select
								value={form.status}
								onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{STATUSES.map((status) => (
										<SelectItem key={status} value={status}>
											{status}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-1.5">
							<Label>Notes / last message</Label>
							<Textarea
								value={form.notes}
								onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setFormOpen(false)}>
							Cancel
						</Button>
						<Button onClick={saveForm}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={smsOpen} onOpenChange={setSmsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							Send SMS {smsTargets.length > 1 ? `to ${smsTargets.length} leads` : ""}
						</DialogTitle>
						<DialogDescription>
							Uses Fast2SMS for Indian mobiles. Successful sends mark status as{" "}
							<strong>send</strong>.
						</DialogDescription>
					</DialogHeader>
					{smsTargets.length === 1 ? (
						<p className="rounded-xl border bg-muted px-3 py-2 text-sm">
							{smsTargets[0].business} · {smsTargets[0].phone}
						</p>
					) : (
						<p className="text-sm text-muted-foreground">
							{smsTargets.map((lead) => lead.business).join(", ")}
						</p>
					)}
					{templates.length ? (
						<div className="grid gap-1.5">
							<Label>Template</Label>
							<Select
								onValueChange={(id) => {
									const found = templates.find((item) => item.id === id);
									if (found) setSmsBody(found.body);
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Insert a saved message" />
								</SelectTrigger>
								<SelectContent>
									{templates.map((item) => (
										<SelectItem key={item.id} value={item.id}>
											{item.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					) : null}
					<div className="grid gap-1.5">
						<Label>Message</Label>
						<Textarea
							value={smsBody}
							onChange={(event) => setSmsBody(event.target.value)}
							rows={5}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setSmsOpen(false)}>
							Cancel
						</Button>
						<Button disabled={sending || !smsBody.trim()} onClick={sendSms}>
							{sending ? "Sending…" : "Send SMS"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function sortableCol(key, label) {
	return {
		accessorKey: key,
		header: ({ column }) => (
			<Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
				{label} <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
			</Button>
		),
		cell: ({ getValue }) => <span>{getValue()}</span>,
	};
}

function Field({ label, value, onChange }) {
	return (
		<div className="grid gap-1.5">
			<Label>{label}</Label>
			<Input value={value} onChange={(event) => onChange(event.target.value)} />
		</div>
	);
}
