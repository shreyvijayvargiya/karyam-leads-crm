import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCrm } from "@/context/CrmContext";

export function MessagesPage() {
	const { templates, saveTemplate, deleteTemplate } = useCrm();
	const [name, setName] = useState("");
	const [body, setBody] = useState("");

	function save() {
		if (!name.trim() || !body.trim()) {
			toast.error("Name and message are required");
			return;
		}
		saveTemplate(name.trim(), body.trim());
		setName("");
		setBody("");
		toast.success("Template saved");
	}

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Reusable SMS copy. Pick a template when sending from a leads table.
				</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>New template</CardTitle>
					<CardDescription>Stored locally, used by the SMS dialog.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="grid gap-1.5">
						<Label>Name</Label>
						<Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Follow up" />
					</div>
					<div className="grid gap-1.5">
						<Label>Message</Label>
						<Textarea
							rows={5}
							value={body}
							onChange={(event) => setBody(event.target.value)}
							placeholder="Write the SMS you will send in bulk…"
						/>
					</div>
					<Button onClick={save}>Save template</Button>
				</CardContent>
			</Card>
			<div className="grid gap-3 md:grid-cols-2">
				{templates.map((item) => (
					<Card key={item.id}>
						<CardHeader className="flex flex-row items-start justify-between">
							<div>
								<CardTitle>{item.name}</CardTitle>
								<CardDescription>{item.body.length} characters</CardDescription>
							</div>
							<Button variant="ghost" size="sm" onClick={() => deleteTemplate(item.id)}>
								Delete
							</Button>
						</CardHeader>
						<CardContent>
							<p className="whitespace-pre-wrap text-sm">{item.body}</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
