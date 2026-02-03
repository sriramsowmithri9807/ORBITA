import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SpaceAmbient from "@/components/SpaceAmbient";
import Starfield from "@/components/Starfield";

const jetbrains = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ORBITA – Autonomous Space Mission Planner",
    description: "AI-powered autonomous mission control for satellite operations. Real-time telemetry, intelligent anomaly detection, and automated decision-making for LEO, MEO, and GEO missions.",
    keywords: "space mission, satellite, AI, autonomous, mission control, telemetry, orbit",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                {/* next/font handles preconnect automatically */}
            </head>
            <body className={jetbrains.className}>
                <SpaceAmbient />
                <Starfield />
                {children}
            </body>
        </html>
    );
}
