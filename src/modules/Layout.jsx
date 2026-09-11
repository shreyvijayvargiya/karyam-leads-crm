import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/modules/Navbar";
import { Sidebar } from "@/modules/Sidebar";
import { cn } from "@/lib/utils";

export function Layout() {
	const [open, setOpen] = useState(true);
	const [drawerOpen, setDrawerOpen] = useState(false);

	return (
		<div className="flex min-h-screen gap-2 md:p-2">
			<Sidebar open={open} />
			{drawerOpen ? (
				<div className="fixed inset-0 z-50 md:hidden">
					<button
						type="button"
						className="absolute inset-0 bg-black/50"
						onClick={() => setDrawerOpen(false)}
					/>
					<div className="absolute left-2 top-2 w-60 rounded-xl border bg-background p-2">
						<Sidebar open forceVisible />
					</div>
				</div>
			) : null}
			<main
				className={cn(
					"flex min-h-screen flex-1 flex-col overflow-hidden border bg-background md:h-[98vh] md:min-h-0 md:rounded-2xl"
				)}
			>
				<Navbar open={open} setOpen={setOpen} setDrawerOpen={setDrawerOpen} />
				<div className="hidescrollbar flex-1 overflow-y-auto p-4 md:p-6">
					<Outlet />
				</div>
			</main>
			<Toaster />
		</div>
	);
}
