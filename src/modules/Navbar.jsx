import { Menu, Moon, PanelLeft, Search, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCrm } from "@/context/CrmContext";
import { useTheme } from "@/context/ThemeContext";

const iconBtn =
	"h-9 w-9 shrink-0 rounded-xl border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground";

export function Navbar({ open, setOpen, setDrawerOpen }) {
	const { theme, toggleTheme } = useTheme();
	const { tables } = useCrm();
	const location = useLocation();
	const navigate = useNavigate();
	const [query, setQuery] = useState("");

	const title = useMemo(() => {
		if (location.pathname === "/") return "Dashboard";
		if (location.pathname.startsWith("/leads")) return "Leads";
		if (location.pathname.startsWith("/logs")) return "Logs";
		if (location.pathname.startsWith("/messages")) return "Messages";
		return "Karyam";
	}, [location.pathname]);

	const matches = query.trim()
		? tables.filter((table) =>
				table.name.toLowerCase().includes(query.trim().toLowerCase())
			)
		: [];

	return (
		<header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b bg-background/90 px-3 py-2 backdrop-blur md:px-4">
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="icon"
					className="md:hidden"
					onClick={() => setDrawerOpen(true)}
				>
					<Menu className="h-4 w-4" />
				</Button>
				<Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setOpen(!open)}>
					<PanelLeft className="h-4 w-4" />
				</Button>
				<div>
					<p className="text-sm font-semibold">{title}</p>
					<p className="text-[11px] text-muted-foreground">Notion theme</p>
				</div>
			</div>
			<div className="relative hidden max-w-md flex-1 md:block">
				<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Search lead tables…"
					className="pl-9"
				/>
				{matches.length ? (
					<div className="absolute top-11 z-30 w-full rounded-xl border bg-popover p-1 shadow-lg">
						{matches.map((table) => (
							<button
								key={table.id}
								type="button"
								className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
								onClick={() => {
									navigate(`/leads/${table.id}`);
									setQuery("");
								}}
							>
								{table.name}
							</button>
						))}
					</div>
				) : null}
			</div>
			<Button className={iconBtn} variant="ghost" size="icon" onClick={toggleTheme}>
				{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
			</Button>
		</header>
	);
}
