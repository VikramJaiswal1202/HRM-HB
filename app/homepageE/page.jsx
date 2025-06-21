"use client";
import { useRouter } from "next/navigation";

const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepageE" },
    { label: "View Attendance", icon: "📅", route: "/viewattendanceE" },
    { label: "Task Assign", icon: "📝", route: "/taskassignE" },
    { label: "Reporting", icon: "📊", route: "/reportingE" },
  ];

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex bg-[#f6f9fc]">
      <aside className="sticky top-0 h-screen w-20 bg-[#0D1A33] text-white flex flex-col items-center py-6 justify-between z-40">
        <div className="w-full">
          <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-[#0D1A33] font-bold text-xl mb-8 shadow mx-auto">
            R
          </div>
          <nav className="flex flex-col gap-3 w-full items-center">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                className="flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors"
                onClick={() => item.route && router.push(item.route)}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="w-full flex justify-center">
          <button
            onClick={() => router.push("/login")}
            className="fixed bottom-6 left-6 flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors z-50"
            style={{ color: "#fff", fontSize: "13px" }}
          >
            <span style={{ fontSize: "22px" }}>🚪</span>
            <span style={{ fontSize: "11px" }}>Logout</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-[#0D1A33] shadow flex items-center px-8 h-16">
          <span className="text-white font-bold text-2xl tracking-wide">PulseHR</span>
        </header>
        <div className="w-full h-[2px] bg-[#e9eef6]" />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
