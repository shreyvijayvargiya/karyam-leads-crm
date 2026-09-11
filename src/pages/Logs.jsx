import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCrm } from "@/context/CrmContext";
import { useMemo, useState } from "react";

export function LogsPage() {
	const { logs, clearLogs } = useCrm();
	const [query, setQuery] = useState("");
	const [okFilter, setOkFilter] = useState("all");

	const rows = useMemo(() => {
		return logs.filter((log) => {
			if (okFilter === "ok" && !log.ok) return false;
			if (okFilter === "failed" && log.ok) return false;
			const q = query.trim().toLowerCase();
			if (!q) return true;
			return [log.business, log.to, log.body, log.tableName, log.error]
				.join(" ")
				.toLowerCase()
				.includes(q);
		});
	}, [logs, query, okFilter]);

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Logs</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						SMS attempts stored in this browser. No database.
					</p>
				</div>
				<Button variant="outline" onClick={clearLogs} disabled={!logs.length}>
					Clear logs
				</Button>
			</div>
			<div className="flex flex-col gap-2 sm:flex-row">
				<Input
					placeholder="Search business, phone, message…"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
				/>
				<div className="flex gap-2">
					{["all", "ok", "failed"].map((item) => (
						<Button
							key={item}
							size="sm"
							variant={okFilter === item ? "default" : "outline"}
							onClick={() => setOkFilter(item)}
						>
							{item}
						</Button>
					))}
				</div>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Activity</CardTitle>
					<CardDescription>{rows.length} entries</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2">
					{rows.length === 0 ? (
						<p className="text-sm text-muted-foreground">Nothing logged yet.</p>
					) : (
						rows.map((log) => (
							<div key={log.id} className="rounded-xl border p-3">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<p className="text-sm font-medium">
										{log.business || "Unknown"}{" "}
										<span className="font-normal text-muted-foreground">{log.to}</span>
									</p>
									<Badge variant={log.ok ? "send" : "rejected"}>{log.ok ? "send" : "failed"}</Badge>
								</div>
								<p className="mt-1 text-sm">{log.body}</p>
								<p className="mt-1 text-xs text-muted-foreground">
									{new Date(log.at).toLocaleString()} · {log.tableName || "table"}
									{log.sid ? ` · ${log.sid}` : ""}
									{log.error ? ` · ${log.error}` : ""}
								</p>
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}
