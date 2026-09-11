import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "karyam-theme";
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
	const [theme, setTheme] = useState(() => {
		if (typeof window === "undefined") return "light";
		return localStorage.getItem(STORAGE_KEY) || "light";
	});

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		document.documentElement.setAttribute("data-theme", "notion");
		document.body.style.backgroundColor = "";
		localStorage.setItem(STORAGE_KEY, theme);
	}, [theme]);

	const value = useMemo(
		() => ({
			theme,
			toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
		}),
		[theme]
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
	return ctx;
}
