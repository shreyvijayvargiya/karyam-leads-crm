import { Toaster as Sonner } from "sonner";
import { useTheme } from "@/context/ThemeContext";
import { toastSurface } from "@/lib/themeTokens";
import { cn } from "@/lib/utils";

export function Toaster(props) {
	const { theme } = useTheme();
	return (
		<Sonner
			theme={theme === "dark" ? "dark" : "light"}
			className="toaster group"
			position="bottom-right"
			toastOptions={{
				classNames: {
					toast: cn("group toast group-[.toaster]:border-border", toastSurface),
					description: "group-[.toast]:text-muted-foreground",
				},
			}}
			{...props}
		/>
	);
}
