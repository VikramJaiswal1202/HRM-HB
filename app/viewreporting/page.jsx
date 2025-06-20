"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ViewReporting() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [employeeReports, setEmployeeReports] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepage" },
    { label: "Employees", icon: "👥", route: "/employees" },
    { label: "Intern", icon: "👥", route: "/intern" },
    { label: "Attendance and timing", icon: "🗓️", route: "/attendance" },
    { label: "View Attendance", icon: "🗓️", route: "/presentEmployees" },
    { label: "Timing Reporting", icon: "⏱️", route: "/reporting" },
    { label: "View Reporting", icon: "📋", route: "/viewreporting" },
  ];

  function formatDate(d) {
    return new Date(d).toISOString().split('T')[0];
  }

  useEffect(() => {
    async function fetchData() {
      const empRes = await fetch("/api/employees");
      const empData = await empRes.json();
      setEmployees(empData.employees || []);

      const allReports = [];
      for (const emp of empData.employees || []) {
        const res = await fetch(`/api/reports?employeeId=${emp.employeeId}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          allReports.push({ employeeId: emp.employeeId, reports: data });
        }
      }
      setReports(allReports);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetch(`/api/reports?employeeId=${selectedEmployeeId}`)
        .then(res => res.json())
        .then(data => setEmployeeReports(data));
    } else {
      setEmployeeReports([]);
    }
  }, [selectedEmployeeId]);

  const submittedIds = reports
    .filter(r => r.reports.some(rep => formatDate(rep.date) === selectedDate))
    .map(r => r.employeeId);

  const submittedEmployees = employees.filter(e => submittedIds.includes(e.employeeId));
  const notSubmittedEmployees = employees.filter(e => !submittedIds.includes(e.employeeId));

  return (
    <div className="min-h-screen flex bg-[#f6f9fc]">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-20 bg-[#0D1A33] text-white flex flex-col items-center py-6 justify-between z-40">
        <div>
          <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-[#0D1A33] font-bold text-xl mb-8 shadow">R</div>
          <nav className="flex flex-col gap-5 w-full items-center">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                className="flex flex-col items-center gap-0.5 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors"
                onClick={() => router.push(item.route)}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[11px] font-medium text-center">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="mb-4 flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 19C7.58 19 4 15.42 4 11C4 6.58 7.58 3 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-[11px]">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-[#0D1A33] shadow px-8 h-16 flex items-center">
          <h1 className="text-white text-2xl font-bold">PulseHR</h1>
        </header>

        <main className="p-8 flex flex-col gap-8">
          {/* Date Selector */}
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-[#0D1A33]">📋 Select Date to View Reports</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedEmployeeId(null); // Reset employee report view
              }}
              className="border p-2 rounded bg-[#eef3ff] text-[#0D1A33] font-medium shadow"
            />
          </div>

          {!selectedDate ? (
            <p className="text-gray-600 text-lg mt-6">Please select a date to view employee reports.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Submitted Reports */}
              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-xl font-semibold text-green-700 mb-4">Submitted Reports ✅</h3>
                <ul className="space-y-2">
                  {submittedEmployees.length === 0 ? (
                    <p className="text-gray-500">No reports submitted.</p>
                  ) : (
                    submittedEmployees.map(emp => (
                      <li key={emp.employeeId}>
                        <button
                          onClick={() =>
                            setSelectedEmployeeId(prev =>
                              prev === emp.employeeId ? null : emp.employeeId
                            )
                          }
                          className={`w-full text-left px-3 py-2 rounded text-[#0D1A33] ${
                            selectedEmployeeId === emp.employeeId
                              ? "bg-[#c5ebd6]"
                              : "bg-[#e0f7ea] hover:bg-[#bdf0d4]"
                          }`}
                        >
                          {emp.name} <span className="text-sm text-gray-500">({emp.employeeId})</span>
                        </button>

                        {/* Toggle Report View */}
                        {selectedEmployeeId === emp.employeeId && (
                          <div className="mt-3">
                            {employeeReports
                              .filter(rep => formatDate(rep.date) === selectedDate)
                              .sort((a, b) => new Date(b.date) - new Date(a.date))
                              .map((report, index) => (
                                <div
                                  key={index}
                                  className="border rounded-xl bg-[#f0f4ff] p-4 mb-4 shadow-sm"
                                >
                                  <div className="text-[#0D1A33] mb-2">
                                    <span className="font-semibold">📅 Date:</span> {formatDate(report.date)}
                                  </div>
                                  <div className="text-[#0D1A33] mb-2">
                                    <span className="font-semibold">📝 Notes:</span>{" "}
                                    {report.notes || "N/A"}
                                  </div>
                                  {report.imagePath && (
                                    <div className="mt-2">
                                      <a
                                        href={report.imagePath}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <img
                                          src={report.imagePath}
                                          alt="Report"
                                          className="w-40 border-2 border-[#0D1A33] rounded shadow"
                                        />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Not Submitted */}
              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-xl font-semibold text-red-600 mb-4">Not Submitted ❌</h3>
                <ul className="space-y-2">
                  {notSubmittedEmployees.length === 0 ? (
                    <p className="text-gray-500">All employees have submitted.</p>
                  ) : (
                    notSubmittedEmployees.map(emp => (
                      <li key={emp.employeeId} className="px-3 py-2 bg-[#fbeaea] rounded text-[#0D1A33]">
                        {emp.name} <span className="text-sm text-gray-500">({emp.employeeId})</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
