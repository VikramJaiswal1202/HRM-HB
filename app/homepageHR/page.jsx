"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function Homepage() {
  const router = useRouter();

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepageHR" },
    { label: "Employees", icon: "👥", route: "/employeesHR" },
    { label: "Interns", icon: "🎓", route: "/internsHR" },
    { label: "View Attendance", icon: "🗓️", route: "/viewattendanceHR" },
    { label: "View Reports", icon: "📊", route: "/reportingHR" },
  ];
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [showPresentList, setShowPresentList] = useState(false);
  const [showAbsentList, setShowAbsentList] = useState(false);
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [reportStats, setReportStats] = useState({ submitted: 0, pending: 0 });
  const [submittedEmployees, setSubmittedEmployees] = useState([]);
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [showSubmittedList, setShowSubmittedList] = useState(false);
  const [showPendingList, setShowPendingList] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data.employees || []);
        setLoading(false);
        fetchReportStats(data.employees || []);
      })
      .catch(() => setLoading(false));

    const today = new Date().toISOString().slice(0, 10);
    fetch(`/api/attendance?date=${today}&shift=Morning`)
      .then((res) => res.json())
      .then((data) => {
        setAttendance(data.data || []);
      });

    const todayDate = new Date();
    const weekDates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      weekDates.push(d.toISOString().slice(0, 10));
    }
    Promise.all(
      weekDates.map(date =>
        fetch(`/api/attendance?date=${date}&shift=Morning`)
          .then(res => res.json())
          .then(data => {
            const present = (data.data || []).filter(a => a.status === "Present").length;
            return {
              date,
              present,
              absent: Math.max(0, (employees.length || 0) - present)
            };
          })
      )
    ).then(setWeeklyAttendance);
  };

  const fetchReportStats = async (emps) => {
    const today = new Date().toISOString().split('T')[0];
    let submittedList = [];
    let pendingList = [];
    await Promise.all(
      emps.map(async (emp) => {
        try {
          const res = await fetch(`/api/reports?employeeId=${emp.employeeId}`);
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
    presentIds.includes(emp.employeeId)
  );
  const absentEmployees = employees.filter(
    (emp) => !presentIds.includes(emp.employeeId)
  );
  const presentCount = presentEmployees.length;
  const absentCount = absentEmployees.length;

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId?.toString().includes(searchTerm) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmployeeClick = async (emp) => {
    setSelectedEmployee(emp);
    try {
      const res = await fetch(`/api/employees/${emp._id}`);
      const data = await res.json();
      setEmployeeDetails(data.employee || emp);
    } catch {
      setEmployeeDetails(emp);
    }
  };

  const handleEditEmployee = (emp) => {
    setEditMode(true);
    setEditedEmployee({...emp});
  };

  const handleDeleteEmployee = async (id) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await fetch(`/api/employees/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setEmployees(employees.filter(emp => emp._id !== id));
          alert("Employee deleted successfully");
        } else {
          alert("Failed to delete employee");
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Error deleting employee");
      }
    }
  };

  const handleSaveEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${editedEmployee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedEmployee),
      });
      
      if (response.ok) {
        const updatedEmployee = await response.json();
        setEmployees(employees.map(emp => 
          emp._id === updatedEmployee._id ? updatedEmployee : emp
        ));
        setEditMode(false);
        setEditedEmployee(null);
        setEmployeeDetails(updatedEmployee);
        alert("Employee updated successfully");
      } else {
        alert("Failed to update employee");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Error updating employee");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEmployee(prev => ({
      ...prev,
      [name]: value
    }));
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
                      <li key={emp.employeeId} className="text-[#0D1A33]">
                        {emp.name} <span className="text-xs text-gray-400">({emp.employeeId})</span>
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
                      <li key={emp.employeeId} className="text-[#0D1A33]">
                        {emp.name} <span className="text-xs text-gray-400">({emp.employeeId})</span>
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
                      <li key={emp.employeeId} className="text-[#0D1A33]">
                        {emp.name} <span className="text-xs text-gray-400">({emp.employeeId})</span>
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
                      <li key={emp.employeeId} className="text-[#0D1A33]">
                        {emp.name} <span className="text-xs text-gray-400">({emp.employeeId})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <div className="w-80 min-w-[250px] bg-white rounded-xl shadow p-4 h-fit">
            <h3 className="text-lg font-bold text-[#0D1A33] mb-4">Employees</h3>
            <input
              type="text"
              placeholder="Search by name, ID, or department"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded-lg border border-[#e9eef6] bg-[#f4f7fb] text-[#0D1A33] focus:outline-none"
            />
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : employees.length === 0 ? (
              <div className="text-gray-400">No employees found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-[#e9eef6]">
                      <th className="text-left py-2 text-sm font-medium text-[#64748b]">Name</th>
                      <th className="text-left py-2 text-sm font-medium text-[#64748b]">ID</th>
                      <th className="text-left py-2 text-sm font-medium text-[#64748b]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.employeeId} className="border-b border-[#e9eef6] hover:bg-[#f4f7fb]">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-block rounded-full w-7 h-7 flex items-center justify-center font-bold bg-[#4267b2] text-white">
                              {emp.name?.[0]?.toUpperCase() || "?"}
                            </span>
                            <span 
                              className="font-medium cursor-pointer hover:text-blue-600"
                              onClick={() => handleEmployeeClick(emp)}
                            >
                              {emp.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-[#64748b]">{emp.employeeId}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditEmployee(emp)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteEmployee(emp._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {selectedEmployee && employeeDetails && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-[#4267b2] text-2xl"
                  onClick={() => {
                    setSelectedEmployee(null);
                    setEmployeeDetails(null);
                    setEditMode(false);
                  }}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h3 className="text-xl font-bold mb-4 text-[#0D1A33]">
                  {editMode ? "Edit Employee" : "Employee Details"}: {employeeDetails.name}
                </h3>
                <div className="mb-4 bg-[#e9eef6] rounded-lg p-4 text-[#0D1A33]">
                  {editMode ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block font-semibold mb-1">Name:</label>
                        <input
                          type="text"
                          name="name"
                          value={editedEmployee.name || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Employee ID:</label>
                        <input
                          type="text"
                          name="employeeId"
                          value={editedEmployee.employeeId || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Email:</label>
                        <input
                          type="email"
                          name="email"
                          value={editedEmployee.email || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Department:</label>
                        <input
                          type="text"
                          name="department"
                          value={editedEmployee.department || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Designation:</label>
                        <input
                          type="text"
                          name="designation"
                          value={editedEmployee.designation || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded border border-gray-300"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2"><span className="font-semibold">Name:</span> {employeeDetails.name}</div>
                      <div className="mb-2"><span className="font-semibold">Employee ID:</span> {employeeDetails.employeeId}</div>
                      <div className="mb-2"><span className="font-semibold">Email:</span> {employeeDetails.email || <span className="text-gray-400">-</span>}</div>
                      <div className="mb-2"><span className="font-semibold">Department:</span> {employeeDetails.department || <span className="text-gray-400">-</span>}</div>
                      <div className="mb-2"><span className="font-semibold">Designation:</span> {employeeDetails.designation || <span className="text-gray-400">-</span>}</div>
                      {employeeDetails.resumeUrl && (
                        <div className="mb-2">
                          <span className="font-semibold">Resume:</span>{" "}
                          <a href={employeeDetails.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                        </div>
                      )}
                      {employeeDetails.documentsUrl && (
                        <div className="mb-2">
                          <span className="font-semibold">Documents:</span>{" "}
                          <a href={employeeDetails.documentsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  {editMode ? (
                    <>
                      <button
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEmployee}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditEmployee(employeeDetails)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}