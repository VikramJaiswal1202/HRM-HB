"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Homepage() {
  const router = useRouter();

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepage" },
    { label: "Employees", icon: "👥", route: "/employees" },
    { label: "Intern", icon: "👥", route: "/intern" },
    { label: "Attendance", icon: "🗓️", route: "/attendance" },
    { label: "Timing Reporting", icon: "⏱️", route: "/reporting" },
  ];

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [activeEmpId, setActiveEmpId] = useState(null);
  const [showAllEmployees, setShowAllEmployees] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data.employees || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    fetch("/api/attendance")
      .then((res) => res.json())
      .then((data) => {
        setAttendance(data.data || []);
      });
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayAttendance = attendance.filter(
    (a) => a.date && a.date.slice(0, 10) === today
  );
  const presentIds = todayAttendance.filter((a) => a.status === "Present").map((a) => a.employeeId);
  const absentIds = todayAttendance.filter((a) => a.status === "Absent").map((a) => a.employeeId);

  const presentEmployees = employees.filter((emp) => presentIds.includes(emp.employeeId));
  const absentEmployees = employees.filter((emp) => absentIds.includes(emp.employeeId));

  const presentCount = presentEmployees.length;
  const absentCount = absentEmployees.length;

  const handleEmployeeClick = async (emp) => {
    setSelectedEmployee(emp);
    setActiveEmpId(emp.employeeId);
    setEmployeeDetails(null);
    try {
      const res = await fetch(`/api/employees/${emp._id}`);
      const data = await res.json();
      setEmployeeDetails(data.employee || emp);
    } catch {
      setEmployeeDetails(emp);
    }
  };

  const EmployeeDetailsModal = () =>
    selectedEmployee && employeeDetails ? (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-[#4267b2] text-2xl"
            onClick={() => {
              setSelectedEmployee(null);
              setActiveEmpId(null);
            }}
            aria-label="Close"
          >
            &times;
          </button>
          <h3 className="text-xl font-bold mb-4 text-[#0D1A33]">
            Employee Details: {employeeDetails.name}
          </h3>
          <div className="mb-4 bg-[#e9eef6] rounded-lg p-4 text-[#0D1A33]">
            <div className="mb-2"><span className="font-semibold">Name:</span> {employeeDetails.name}</div>
            <div className="mb-2"><span className="font-semibold">Employee ID:</span> {employeeDetails.employeeId}</div>
            <div className="mb-2"><span className="font-semibold">Email:</span> {employeeDetails.email || <span className="text-gray-400">-</span>}</div>
            <div className="mb-2"><span className="font-semibold">Department:</span> {employeeDetails.department || <span className="text-gray-400">-</span>}</div>
            <div className="mb-2"><span className="font-semibold">Role:</span> {employeeDetails.role || <span className="text-gray-400">-</span>}</div>
            {employeeDetails.resumeUrl && (
              <div className="mb-2">
                <span className="font-semibold">Resume:</span>{" "}
                <a href={employeeDetails.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
              </div>
            )}
            {employeeDetails.moreFileUrl && (
              <div className="mb-2">
                <span className="font-semibold">More File:</span>{" "}
                <a href={employeeDetails.moreFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
              </div>
            )}
          </div>
        </div>
      </div>
    ) : null;

  const employeesToShow = showAllEmployees ? employees : employees.slice(0, 5);

  return (
    <div className="min-h-screen flex bg-[#f6f9fc]">
      <aside className="w-20 bg-[#0D1A33] text-white flex flex-col items-center py-6 justify-between h-screen">
        <div>
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
        <button
          onClick={() => router.push("/login")}
          className="mb-4 flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors"
          style={{ color: "#fff", fontSize: "13px" }}
        >
          <span style={{ fontSize: "22px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <span style={{ fontSize: "11px" }}>Logout</span>
        </button>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-[#0D1A33] shadow flex items-center px-8 h-16">
          <span className="text-white font-bold text-2xl tracking-wide">
            PulseHR
          </span>
        </header>
        <div className="w-full h-[2px] bg-[#e9eef6]" />
        <main className="flex-1 flex flex-row gap-8 p-8">
          <div className="flex-1 flex flex-col gap-8">
            <div className="flex gap-8 mb-4">
              <div className="flex-1 bg-green-100 border-l-4 border-green-500 p-6 rounded-xl shadow flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-green-700 mb-2">Present</span>
                <span className="text-4xl font-extrabold text-green-700">{presentCount}</span>
              </div>
              <div className="flex-1 bg-red-100 border-l-4 border-red-500 p-6 rounded-xl shadow flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-red-700 mb-2">Absent</span>
                <span className="text-4xl font-extrabold text-red-700">{absentCount}</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold text-[#0D1A33] mb-4">Today's Attendance</h3>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                    <svg width="18" height="18" fill="none"><path d="M3 9l4 4L13 5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Present
                  </h4>
                  {presentEmployees.length === 0 ? (
                    <div className="text-gray-400">No one present today.</div>
                  ) : (
                    <ul className="space-y-1 mb-6">
                      {presentEmployees.map((emp) => (
                        <li key={emp.employeeId} className="text-[#0D1A33]">
                          {emp.name} <span className="text-xs text-gray-400">({emp.employeeId})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-1">
                    <svg width="18" height="18" fill="none"><path d="M13 7l-4 4-4-4" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Absent
                  </h4>
                  {absentEmployees.length === 0 ? (
                    <div className="text-gray-400">No one absent today.</div>
                  ) : (
                    <ul className="space-y-1 mb-6">
                      {absentEmployees.map((emp) => (
                        <li key={emp.employeeId} className="text-[#0D1A33]">
                          {emp.name} <span className="text-xs text-gray-400">({emp.employeeId})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            <div className="rounded-xl shadow p-6 bg-transparent" style={{ marginTop: "-16px" }}>
              <h3 className="text-lg font-bold text-[#0D1A33] mb-6">Attendance Graph for Today</h3>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 flex flex-col items-center">
                  <svg width="900" height="100" style={{ background: "transparent" }}>
                    <defs>
                      <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f87171" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polyline
                      fill="none"
                      stroke="#4ade80"
                      strokeWidth="5"
                      points={`0,80 150,${80 - presentCount * 3} 300,${80 - presentCount * 4} 450,${80 - presentCount * 3.5} 600,${80 - presentCount * 5} 750,${80 - presentCount * 3} 900,${80 - presentCount * 4}`}
                      opacity="0.7"
                    />
                    <polygon
                      points={`0,80 150,${80 - presentCount * 3} 300,${80 - presentCount * 4} 450,${80 - presentCount * 3.5} 600,${80 - presentCount * 5} 750,${80 - presentCount * 3} 900,${80 - presentCount * 4} 900,100 0,100`}
                      fill="url(#presentGradient)"
                    />
                    <polyline
                      fill="none"
                      stroke="#f87171"
                      strokeWidth="5"
                      points={`0,80 150,${80 - absentCount * 3} 300,${80 - absentCount * 4} 450,${80 - absentCount * 3.5} 600,${80 - absentCount * 5} 750,${80 - absentCount * 3} 900,${80 - absentCount * 4}`}
                      opacity="0.7"
                    />
                    <polygon
                      points={`0,80 150,${80 - absentCount * 3} 300,${80 - absentCount * 4} 450,${80 - absentCount * 3.5} 600,${80 - absentCount * 5} 750,${80 - absentCount * 3} 900,${80 - absentCount * 4} 900,100 0,100`}
                      fill="url(#absentGradient)"
                    />
                  </svg>
                  <div className="flex gap-8 mt-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded-full" style={{ background: "#4ade80" }}></span>
                      <span className="text-green-700 font-semibold">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded-full" style={{ background: "#f87171" }}></span>
                      <span className="text-red-500 font-semibold">Absent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-64 min-w-[200px] bg-white rounded-xl shadow p-4 h-fit">
            <h3 className="text-lg font-bold text-[#0D1A33] mb-4">Employees</h3>
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : employees.length === 0 ? (
              <div className="text-gray-400">No employees found.</div>
            ) : (
              <>
                <ul className="space-y-2">
                  {employeesToShow.map((emp) => (
                    <li
                      key={emp.employeeId}
                      className={`flex items-center gap-2 px-2 py-1 rounded transition cursor-pointer ${
                        activeEmpId === emp.employeeId
                          ? "bg-[#4267b2] text-white"
                          : "hover:bg-[#f4f7fb] text-[#0D1A33]"
                      }`}
                      onClick={() => handleEmployeeClick(emp)}
                    >
                      <span className={`inline-block rounded-full w-7 h-7 flex items-center justify-center font-bold ${
                        activeEmpId === emp.employeeId ? "bg-white text-[#4267b2]" : "bg-[#4267b2] text-white"
                      }`}>
                        {emp.name?.[0]?.toUpperCase() || "?"}
                      </span>
                      <span className="font-medium">{emp.name}</span>
                    </li>
                  ))}
                </ul>
                {!showAllEmployees && employees.length > 5 && (
                  <button
                    className="mt-4 w-full text-[#4267b2] font-semibold hover:underline"
                    onClick={() => setShowAllEmployees(true)}
                  >
                    See more
                  </button>
                )}
              </>
            )}
          </div>
          {EmployeeDetailsModal()}
        </main>
      </div>
    </div>
  );
}