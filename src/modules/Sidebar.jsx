import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
	ChevronDown,
	LayoutDashboard,
	MessageSquare,
	ScrollText,
	Table2,
	Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCrm } from "@/context/CrmContext";
import { cn } from "@/lib/utils";

export function Sidebar({ open, forceVisible = false }) {
	const { tables } = useCrm();
	const location = useLocation();
	const navigate = useNavigate();
	const leadsOpen = location.pathname.startsWith("/leads");
	const [expanded, setExpanded] = useState(true);

	const items = useMemo(
		() => [
			{ to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
			{ to: "/messages", label: "Messages", icon: MessageSquare },
			{ to: "/logs", label: "Logs", icon: ScrollText },
		],
		[]
	);

	return (
		<aside
			className={cn(
				"h-[98vh] rounded-xl border bg-background transition-all duration-200",
				forceVisible ? "flex flex-col" : "hidden md:flex md:flex-col",
				open ? "w-60" : "w-[68px]"
			)}
		>
			<div className="flex items-center gap-2 border-b px-3 py-3">
				<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
					K
				</div>
				{open ? (
					<div className="min-w-0">
						<p className="truncate text-sm font-semibold">Karyam CRM</p>
						<p className="truncate text-[11px] text-muted-foreground">Leads & SMS</p>
					</div>
				) : null}
			</div>
			<nav className="flex-1 overflow-y-auto hidescrollbar px-2 py-2">
				{items.slice(0, 1).map((item) => (
					<NavButton key={item.to} item={item} open={open} />
				))}
				<div className="mt-1">
					<Button
						variant={leadsOpen ? "default" : "ghost"}
						size="sm"
						className={cn("w-full justify-start gap-2 px-3", !open && "px-2")}
						onClick={() => {
							setExpanded(true);
							navigate("/leads");
						}}
					>
						<Table2 className="h-4 w-4 shrink-0" />
						{open ? <span className="flex-1 text-left">Leads</span> : null}
						{open ? (
							<ChevronDown
								className={cn("h-4 w-4 transition", expanded ? "rotate-0" : "-rotate-90")}
								onClick={(event) => {
									event.stopPropagation();
									setExpanded((value) => !value);
								}}
							/>
						) : null}
					</Button>
					{open && expanded
						? tables.map((table) => (
								<NavLink
									key={table.id}
									to={`/leads/${table.id}`}
									className={({ isActive }) =>
										cn(
											"mt-0.5 flex w-full items-center rounded-lg px-3 py-1.5 pl-8 text-xs hover:bg-accent",
											isActive && "bg-primary/10 text-primary"
										)
									}
								>
									<span className="truncate">{table.name}</span>
								</NavLink>
							))
						: null}
					{open && expanded ? (
						<NavLink
							to="/leads"
							className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 pl-8 text-xs text-muted-foreground hover:bg-accent"
						>
							<Upload className="h-3.5 w-3.5" />
							Import table
						</NavLink>
					) : null}
				</div>
				{items.slice(1).map((item) => (
					<NavButton key={item.to} item={item} open={open} />
				))}
			</nav>
		</aside>
	);
}

function NavButton({ item, open }) {
	const Icon = item.icon;
	return (
		<NavLink
			to={item.to}
			end={item.end}
			className={({ isActive }) =>
				cn(
					"my-0.5 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium",
					isActive
						? "bg-primary text-primary-foreground"
						: "hover:bg-accent hover:text-accent-foreground",
					!open && "justify-center px-2"
				)
			}
		>
			<Icon className="h-4 w-4 shrink-0" />
			{open ? item.label : null}
		</NavLink>
	);
}
