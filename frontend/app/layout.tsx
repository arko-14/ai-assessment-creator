import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
    title: "AI Assessment Creator",
    description: "AI Assessment Creator for teachers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <Script
                    src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
                    strategy="beforeInteractive"
                />
            </head>
            <body className="bg-gray-50 text-gray-900">{children}</body>
        </html>
    );
}