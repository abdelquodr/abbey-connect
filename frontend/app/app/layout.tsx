import type { ReactNode } from "react";
import { Lexend } from "next/font/google";

import { DashboardSidebar } from "./components/DashboardSidebar";
import { DashboardTopbar } from "./components/DashboardTopbar";

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
});

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main
      className={`${lexend.className} min-h-screen bg-[#f7f8fc] p-4 lg:p-6`}
    >
      <div className="grid min-h-[calc(100vh-3rem)] grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
        <DashboardSidebar />

        <div className="min-w-0 space-y-6">
          <DashboardTopbar />
          {children}
        </div>
      </div>
    </main>
  );
}
