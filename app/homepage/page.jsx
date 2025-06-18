"use client";
import { useRouter } from "next/navigation";

export default function Homepage() {
  const router = useRouter();

  const sidebarItems = [
    { label: "Employees", icon: "👥", route: "/employees" }, // Added route here
    { label: "Attendance", icon: "🗓️" },
    { label: "Timing Reporting", icon: "⏱️", route: "/reporting" },
  ];

  const navTabs = [
    "DASHBOARD",
    "APPROVALS",
    "SHIFTS/WEEKLY OFFS & PTO",
    "TIME TRACKING",
    "OVERTIME",
    "TIME OFF",
    "REPORTS",
    "SETTINGS",
  ];

  return (
    <div className="min-h-screen flex bg-[#f6f9fc]">
      {/* Sidebar */}
      <aside className="w-20 bg-[#0D1A33] text-white flex flex-col items-center py-6 justify-between h-screen">
        <div>
          {/* Top left logo */}
          <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-[#0D1A33] font-bold text-xl mb-8 shadow">
            R
          </div>
          <nav className="flex flex-col gap-8 w-full items-center">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                className="flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors"
                onClick={() => item.route && router.push(item.route)} // Enable navigation
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        {/* Bottom left logout button with SVG icon */}
        <button
          onClick={() => router.push("/login")}
          className="mb-4 flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors"
          style={{ color: "#fff", fontSize: "13px" }}
        >
          <span style={{ fontSize: "22px" }}>
            {/* SVG logout icon */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <span style={{ fontSize: "11px" }}>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* App Name Heading */}
        <header className="bg-[#4267b2] shadow flex items-center px-8 h-16">
          <span className="text-white font-bold text-2xl tracking-wide">
            PulseHR
          </span>
        </header>
        {/* Divider line */}
        <div className="w-full h-[2px] bg-[#e9eef6]" />
        {/* Navbar Tabs below the heading */}
        <nav className="bg-white shadow flex gap-6 px-8 h-14 items-center">
          {navTabs.map((tab, idx) => (
            <button
              key={tab}
              className={`uppercase text-xs font-semibold pb-2 border-b-2 ${
                idx === 0
                  ? "border-[#0D1A33] text-[#0D1A33]"
                  : "border-transparent text-gray-500 hover:text-[#0D1A33]"
              } transition-colors`}
            >
              {tab}
            </button>
          ))}
          <div className="relative ml-auto">
            <input
              type="text"
              placeholder="Search.."
              className="bg-[#e9eef6] rounded-full px-4 py-1 text-sm outline-none w-48"
            />
            <span className="absolute right-3 top-1.5 text-gray-400">🔍</span>
          </div>
        </nav>
        {/* Main content area placeholder */}
        <main className="flex-1 p-8">
          {/* Your dashboard content goes here */}
        </main>
      </div>
    </div>
  );
}