import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, MessageSquare, Table2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCrm } from "@/context/CrmContext";

export function DashboardPage() {
	const { tables, logs } = useCrm();
	const allRows = tables.flatMap((table) => table.rows);
	const sent = allRows.filter((row) => row.status === "send").length;
	const confirmed = allRows.filter((row) => row.status === "confirmed").length;
	const cities = new Set(allRows.map((row) => row.city).filter(Boolean)).size;

	const stats = [
		{ label: "Lead tables", value: tables.length, icon: Table2 },
		{ label: "Businesses", value: allRows.length, icon: Building2 },
		{ label: "SMS marked send", value: sent, icon: MessageSquare },
		{ label: "Confirmed", value: confirmed, icon: CheckCircle2 },
	];

	const recent = logs.slice(0, 6);
	const cityCounts = useMemo(() => {
		const map = {};
		allRows.forEach((row) => {
			const city = row.city || "Unknown";
			map[city] = (map[city] || 0) + 1;
		});
		return Object.entries(map).sort((a, b) => b[1] - a[1]);
	}, [allRows]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Kota / Jaipur manufacturer outreach. Import more tables and send SMS from Leads.
				</p>
			</div>
			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{stats.map((stat, index) => {
					const Icon = stat.icon;
					return (
						<motion.div
							key={stat.label}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
						>
							<Card>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle>{stat.label}</CardTitle>
									<Icon className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<p className="text-2xl font-semibold">{stat.value}</p>
									<p className="mt-1 text-xs text-muted-foreground">{cities} cities in current data</p>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>
			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Lead tables</CardTitle>
						<CardDescription>Nested under Leads in the sidebar</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						{tables.map((table) => (
							<Link
								key={table.id}
								to={`/leads/${table.id}`}
								className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm hover:bg-accent"
							>
								<span className="font-medium">{table.name}</span>
								<Badge variant="secondary">{table.rows.length} rows</Badge>
							</Link>
						))}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Cities</CardTitle>
						<CardDescription>Distribution across all tables</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						{cityCounts.map(([city, count]) => (
							<div key={city} className="flex items-center justify-between text-sm">
								<span>{city}</span>
								<span className="text-muted-foreground">{count}</span>
							</div>
						))}
					</CardContent>
				</Card>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Recent SMS logs</CardTitle>
					<CardDescription>Latest sends from this browser</CardDescription>
				</CardHeader>
				<CardContent>
					{recent.length === 0 ? (
						<p className="text-sm text-muted-foreground">No SMS yet. Open a leads table and send.</p>
					) : (
						<div className="space-y-2">
							{recent.map((log) => (
								<div key={log.id} className="rounded-xl border px-3 py-2 text-sm">
									<div className="flex items-center justify-between gap-2">
										<span className="font-medium">{log.business || log.to}</span>
										<Badge variant={log.ok ? "send" : "rejected"}>{log.ok ? "ok" : "failed"}</Badge>
									</div>
									<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{log.body}</p>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
