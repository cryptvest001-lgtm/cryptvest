import type { Metadata } from "next";
import "./globals.css";
import GlobalChatWrapper from "@/components/GlobalChatWrapper";

export const metadata: Metadata = {
  title: "Cryptvest",
  description: "Crypto staking platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <GlobalChatWrapper />
      </body>
    </html>
  );
}
