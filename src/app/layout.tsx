import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Wall — a little more connected",
  description: "An old-school wall for new thoughts. Share a short message with everyone, no account needed.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
