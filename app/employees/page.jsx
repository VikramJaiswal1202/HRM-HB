"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EmployeesPage() {
  const router = useRouter();

  const sidebarItems = [
    { label: "Employees", icon: "👥", route: "/employees" },
    { label: "Attendance and Timing", icon: "🗓" },
    { label: "Reporting", icon: "⏱", route: "/reporting" },
  ];

  // Fetch employees from backend API
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data.employees || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
                onClick={() => item.route && router.push(item.route)}
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
        {/* Employees Table */}
        <main className="flex-1 p-8 flex flex-col items-center">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-[#0D1A33] mb-4 flex items-center gap-2">
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="2" fill="#4267b2" opacity="0.12"/>
                <rect x="7" y="2" width="2" height="4" rx="1" fill="#4267b2"/>
                <rect x="15" y="2" width="2" height="4" rx="1" fill="#4267b2"/>
              </svg>
              Employees
            </h2>
            {loading ? (
              <div className="text-[#0D1A33] text-center py-8">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-[#e9eef6] rounded-lg">
                  <thead>
                    <tr className="bg-[#f4f7fb] text-[#0D1A33]">
                      <th className="py-2 px-4 border-b">Employee ID</th>
                      <th className="py-2 px-4 border-b">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length > 0 ? (
                      employees.map((emp, idx) => (
                        <tr key={emp.employeeId || idx} className="text-[#0D1A33] text-sm hover:bg-[#f6f9fc] transition">
                          <td className="py-2 px-4 border-b">{emp.employeeId}</td>
                          <td className="py-2 px-4 border-b">{emp.name}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="text-center text-gray-400 py-6">No employees found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}