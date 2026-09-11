import * as React from "react";
import { cn } from "@/lib/utils";
import { focusRing, inputBase } from "@/lib/themeTokens";

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
	<input
		type={type}
		className={cn(
			"flex h-ui w-full px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
			inputBase,
			focusRing,
			className
		)}
		ref={ref}
		{...props}
	/>
));
Input.displayName = "Input";

export { Input };
