"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function Homepage() {
  const router = useRouter();

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepageHR" },
    { label: "Employees", icon: "👥", route: "/employeesHR" },
    { label: "Interns", icon: "🎓", route: "/internsHR" },
    {label: "managers", icon: "👔", route: "/MHR" },
    { label: "View Attendance", icon: "🗓️", route: "/viewattendanceHR" },
    { label: "View Reports", icon: "📊", route: "/reportingHR" },
  ];

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllEmployees, setShowAllEmployees] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [showPresentList, setShowPresentList] = useState(false);
  const [showAbsentList, setShowAbsentList] = useState(false);
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [reportStats, setReportStats] = useState({ submitted: 0, pending: 0 });

  // For report status
  const [submittedEmployees, setSubmittedEmployees] = useState([]);
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [showSubmittedList, setShowSubmittedList] = useState(false);
  const [showPendingList, setShowPendingList] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch employees from the same endpoint as employees page
      const employeesRes = await fetch("/api/hr/users", {
        method: "GET",
        credentials: 'include',
      });
      const employeesData = await employeesRes.json();
      
      if (employeesRes.ok && employeesData.users) {
        // Filter only employees (not interns) and transform data structure
        const employeeList = employeesData.users
          .filter(user => user.role === 'employee')
          .map(user => ({
            ...user,
            employeeId: user._id, // Use _id as employeeId for consistency
            name: user.name,
            email: user.email,
            department: user.department || 'Not specified',
            designation: user.designation || 'Not specified'
          }));
        
        setEmployees(employeeList);
        
        // Fetch report stats with the updated employee list
        await fetchReportStats(employeeList);
      } else {
        console.error("Failed to fetch employees:", employeesData.message);
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    }

    // Fetch attendance data
    try {
      const today = new Date().toISOString().slice(0, 10);
      const attendanceRes = await fetch(`/api/attendance?date=${today}&shift=Morning`);
      const attendanceData = await attendanceRes.json();
      setAttendance(attendanceData.data || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendance([]);
    }

    // Fetch weekly attendance data
    try {
      const todayDate = new Date();
      const weekDates = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(todayDate);
        d.setDate(todayDate.getDate() - i);
        weekDates.push(d.toISOString().slice(0, 10));
      }
      
      const weeklyData = await Promise.all(
        weekDates.map(async date => {
          try {
            const res = await fetch(`/api/attendance?date=${date}&shift=Morning`);
            const data = await res.json();
            const present = (data.data || []).filter(a => a.status === "Present").length;
            return {
              date,
              present,
              absent: Math.max(0, employees.length - present)
            };
          } catch {
            return { date, present: 0, absent: 0 };
          }
        })
      );
      setWeeklyAttendance(weeklyData);
    } catch (error) {
      console.error("Error fetching weekly attendance:", error);
    }

    setLoading(false);
  };

  const fetchReportStats = async (emps) => {
    const today = new Date().toISOString().split('T')[0];
    let submittedList = [];
    let pendingList = [];
    
    await Promise.all(
      emps.map(async (emp) => {
        try {
          const res = await fetch(`/api/reports?employeeId=${emp._id}`);
          const data = await res.json();
          if (
            Array.isArray(data.reports) &&
            data.reports.some(
              (rep) =>
                rep.date &&
                new Date(rep.date).toISOString().split('T')[0] === today
            )
          ) {
            submittedList.push(emp);
          } else {
            pendingList.push(emp);
          }
        } catch {
          pendingList.push(emp);
        }
      })
    );
    
    setReportStats({ submitted: submittedList.length, pending: pendingList.length });
    setSubmittedEmployees(submittedList);
    setPendingEmployees(pendingList);
  };

  const presentIds = attendance
    .filter((a) => a.status === "Present")
    .map((a) => a.employeeId);

  const presentEmployees = employees.filter((emp) =>
    presentIds.includes(emp._id) || presentIds.includes(emp.employeeId)
  );
  const absentEmployees = employees.filter(
    (emp) => !presentIds.includes(emp._id) && !presentIds.includes(emp.employeeId)
  );
  const presentCount = presentEmployees.length;
  const absentCount = absentEmployees.length;

  const employeesToShow = showAllEmployees ? employees : employees.slice(0, 5);

  const filteredEmployees = employeesToShow.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp._id?.toString().includes(searchTerm) ||
    emp.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmployeeClick = async (emp) => {
    setSelectedEmployee(emp);
    try {
      // Try to fetch additional details if needed
      const res = await fetch(`/api/hr/users/${emp._id}`);
      if (res.ok) {
        const data = await res.json();
        setEmployeeDetails(data.user || emp);
      } else {
        setEmployeeDetails(emp);
      }
    } catch {
      setEmployeeDetails(emp);
    }
  };

  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const presentGraphData = useMemo(() => {
    return weeklyAttendance.map((entry, idx) => ({
      day: days[idx],
      value: entry.present
    }));
  }, [weeklyAttendance]);
  
  const absentGraphData = useMemo(() => {
    return weeklyAttendance.map((entry, idx) => ({
      day: days[idx],
      value: entry.absent
    }));
  }, [weeklyAttendance]);

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
            <span style={{ fontSize: "22px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            <span style={{ fontSize: "11px" }}>Logout</span>
          </button>
        </div>
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
            <h2 className="text-xl font-bold text-[#0D1A33]">📋 Report Submitting Status</h2>
            <div className="flex gap-6">
              <div
                className={`bg-green-100 text-green-800 border-l-4 border-green-500 p-4 rounded-xl shadow flex-1 cursor-pointer ${
                  showSubmittedList ? "ring-2 ring-green-400" : ""
                }`}
                onClick={() => {
                  setShowSubmittedList(!showSubmittedList);
                  setShowPendingList(false);
                }}
              >
                <h4 className="font-semibold text-lg">Submitted</h4>
                <p className="text-3xl font-bold">{reportStats.submitted}</p>
              </div>
              <div
                className={`bg-red-100 text-red-800 border-l-4 border-red-500 p-4 rounded-xl shadow flex-1 cursor-pointer ${
                  showPendingList ? "ring-2 ring-red-400" : ""
                }`}
                onClick={() => {
                  setShowPendingList(!showPendingList);
                  setShowSubmittedList(false);
                }}
              >
                <h4 className="font-semibold text-lg">Pending</h4>
                <p className="text-3xl font-bold">{reportStats.pending}</p>
              </div>
            </div>
            {showSubmittedList && (
              <div className="bg-white rounded-xl shadow p-6 mt-4">
                <h3 className="text-lg font-bold text-[#0D1A33] mb-4">Submitted Employees</h3>
                {submittedEmployees.length === 0 ? (
                  <div className="text-gray-400">No one submitted today.</div>
                ) : (
                  <ul className="space-y-1 mb-6">
                    {submittedEmployees.map((emp) => (
                      <li key={emp._id} className="text-[#0D1A33]">
                        {emp.name} <span className="text-xs text-gray-400">({emp.username})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {showPendingList && (
              <div className="bg-white rounded-xl shadow p-6 mt-4">
                <h3 className="text-lg font-bold text-[#0D1A33] mb-4">Pending Employees</h3>
                {pendingEmployees.length === 0 ? (
                  <div className="text-gray-400">No one pending today.</div>
                ) : (
                  <ul className="space-y-1 mb-6">
                    {pendingEmployees.map((emp) => (
                      <li key={emp._id} className="text-[#0D1A33]">
                        {emp.name} <span className="text-xs text-gray-400">({emp.username})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <h2 className="text-xl font-bold text-[#0D1A33] mt-8">🗓 Attendance</h2>

            <div className="flex gap-8 mb-4">
              <div
                className="flex-1 bg-green-100 border-l-4 border-green-500 p-6 rounded-xl shadow flex flex-row items-center justify-between cursor-pointer"
                onClick={() => {
                  setShowPresentList(!showPresentList);
                  setShowAbsentList(false);
                }}
              >
                <div className="flex flex-col items-center justify-center min-w-[90px]">
                  <span className="text-2xl font-bold text-green-700 mb-2">Present</span>
                  <span className="text-4xl font-extrabold text-green-700">{presentCount}</span>
                </div>
                <div className="flex-1 flex items-center justify-end">
                  <svg width="220" height="80" style={{ background: "transparent" }}>
                    <polyline
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="4"
                      points={presentGraphData
                        .map((d, i) => `${30 + i * 30},${70 - (d.value * 1.5)}`)
                        .join(" ")}
                    />
                    {presentGraphData.map((d, i) => (
                      <circle
                        key={d.day + i}
                        cx={30 + i * 30}
                        cy={70 - (d.value * 1.5)}
                        r="5"
                        fill="#22c55e"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                    ))}
                    {presentGraphData.map((d, i) => (
                      <text
                        key={d.day + "label" + i}
                        x={30 + i * 30}
                        y={78}
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {d.day}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>
              <div
                className="flex-1 bg-red-100 border-l-4 border-red-500 p-6 rounded-xl shadow flex flex-row items-center justify-between cursor-pointer"
                onClick={() => {
                  setShowAbsentList(!showAbsentList);
                  setShowPresentList(false);
                }}
              >
                <div className="flex flex-col items-center justify-center min-w-[90px]">
                  <span className="text-2xl font-bold text-red-700 mb-2">Absent</span>
                  <span className="text-4xl font-extrabold text-red-700">{absentCount}</span>
                </div>
                <div className="flex-1 flex items-center justify-end">
                  <svg width="220" height="80" style={{ background: "transparent" }}>
                    <polyline
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="4"
                      points={absentGraphData
                        .map((d, i) => `${30 + i * 30},${70 - (d.value * 1.5)}`)
                        .join(" ")}
                    />
                    {absentGraphData.map((d, i) => (
                      <circle
                        key={d.day + i}
                        cx={30 + i * 30}
                        cy={70 - (d.value * 1.5)}
                        r="5"
                        fill="#ef4444"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                    ))}
                    {absentGraphData.map((d, i) => (
                      <text
                        key={d.day + "label" + i}
                        x={30 + i * 30}
                        y={78}
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {d.day}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>
            </div>
            {showPresentList && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-bold text-[#0D1A33] mb-4">Present Employees</h3>
                {presentEmployees.length === 0 ? (
                  <div className="text-gray-400">No one present today.</div>
                ) : (
                  <ul className="space-y-1 mb-6">
                    {presentEmployees.map((emp) => (
                      <li key={emp._id} className="text-[#0D1A33]">
                        {emp.name} <span className="text-xs text-gray-400">({emp.username})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {showAbsentList && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-bold text-[#0D1A33] mb-4">Absent Employees</h3>
                {absentEmployees.length === 0 ? (
                  <div className="text-gray-400">No one absent today.</div>
                ) : (
                  <ul className="space-y-1 mb-6">
                    {absentEmployees.map((emp) => (
                      <li key={emp._id} className="text-[#0D1A33]">
                        {emp.name} <span className="text-xs text-gray-400">({emp.username})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <div className="w-64 min-w-[200px] bg-white rounded-xl shadow p-4 h-fit">
            <h3 className="text-lg font-bold text-[#0D1A33] mb-4">
              Employees ({employees.length})
            </h3>
            <input
              type="text"
              placeholder="Search by name, username, email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded-lg border border-[#e9eef6] bg-[#f4f7fb] text-[#0D1A33] focus:outline-none"
            />
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : employees.length === 0 ? (
              <div className="text-gray-400">No employees found.</div>
            ) : (
              <>
                <ul className="space-y-2">
                  {filteredEmployees.map((emp) => (
                    <li
                      key={emp._id}
                      className="flex items-center gap-2 px-2 py-1 rounded transition cursor-pointer hover:bg-[#f4f7fb] text-[#0D1A33]"
                      onClick={() => handleEmployeeClick(emp)}
                    >
                      <span className="inline-block rounded-full w-7 h-7 flex items-center justify-center font-bold bg-[#4267b2] text-white">
                        {emp.name?.[0]?.toUpperCase() || "?"}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{emp.name}</span>
                        <span className="text-xs text-gray-500">{emp.username}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                {!showAllEmployees && employees.length > 5 && (
                  <button
                    className="mt-4 w-full text-[#4267b2] font-semibold hover:underline"
                    onClick={() => setShowAllEmployees(true)}
                  >
                    See more ({employees.length - 5} more)
                  </button>
                )}
                {showAllEmployees && employees.length > 5 && (
                  <button
                    className="mt-4 w-full text-[#4267b2] font-semibold hover:underline"
                    onClick={() => setShowAllEmployees(false)}
                  >
                    Show less
                  </button>
                )}
              </>
            )}
            
            {/* Quick Action to Add Employee */}
            <button
              onClick={() => router.push("/employeesHR")}
              className="w-full mt-4 bg-[#4267b2] text-white px-3 py-2 rounded-lg hover:bg-[#314d80] transition text-sm font-medium"
            >
              Manage Employees
            </button>
          </div>
          
          {/* Employee Details Modal */}
          {selectedEmployee && employeeDetails && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-[#4267b2] text-2xl"
                  onClick={() => {
                    setSelectedEmployee(null);
                    setEmployeeDetails(null);
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
                  <div className="mb-2"><span className="font-semibold">Username:</span> {employeeDetails.username}</div>
                  <div className="mb-2"><span className="font-semibold">Email:</span> {employeeDetails.email || <span className="text-gray-400">-</span>}</div>
                  <div className="mb-2"><span className="font-semibold">Role:</span> 
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {employeeDetails.role}
                    </span>
                  </div>
                  <div className="mb-2"><span className="font-semibold">Created:</span> {employeeDetails.createdAt ? new Date(employeeDetails.createdAt).toLocaleDateString() : '-'}</div>
                  {employeeDetails.managerId && (
                    <div className="mb-2"><span className="font-semibold">Manager ID:</span> {employeeDetails.managerId}</div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push("/employeesHR")}
                    className="flex-1 bg-[#4267b2] hover:bg-[#314d80] text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    View All Employees
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEmployee(null);
                      setEmployeeDetails(null);
                    }}
                    className="flex-1 border border-[#4267b2] text-[#4267b2] font-medium py-2 rounded-lg hover:bg-[#f4f7fb] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}