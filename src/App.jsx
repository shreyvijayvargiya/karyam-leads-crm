import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CrmProvider } from "@/context/CrmContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Layout } from "@/modules/Layout";
import { DashboardPage } from "@/pages/Dashboard";
import { LeadsPage } from "@/pages/Leads";
import { LogsPage } from "@/pages/Logs";
import { MessagesPage } from "@/pages/Messages";

export default function App() {
	return (
		<ThemeProvider>
			<CrmProvider>
				<BrowserRouter>
					<Routes>
						<Route element={<Layout />}>
							<Route path="/" element={<DashboardPage />} />
							<Route path="/leads" element={<LeadsPage />} />
							<Route path="/leads/:tableId" element={<LeadsPage />} />
							<Route path="/messages" element={<MessagesPage />} />
							<Route path="/logs" element={<LogsPage />} />
							<Route path="*" element={<Navigate to="/" replace />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</CrmProvider>
		</ThemeProvider>
	);
}
