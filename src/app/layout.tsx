import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mark's Wall — a little more connected",
  description: "Leave a message or photo on Mark's Wall. A little corner of the internet, shared — no account needed.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
