import * as React from "react";
import { cn } from "@/lib/utils";

// Adapted from shadcn/ui's new-york Textarea for the wall's square styling.
export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(
    "flex min-h-24 w-full border border-input bg-transparent px-3 py-2 text-base placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 md:text-sm",
    className,
  )} {...props} />;
}
