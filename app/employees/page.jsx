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

  // Modal state
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState({});

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => {
        // Add type, department, roll if not present
        const emps = (data.employees || []).map((emp) => ({
          ...emp,
          type: emp.type || "fulltime",
          department: emp.department || null,
          roll: emp.roll || null,
        }));
        setEmployees(emps);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Split employees by type
  const interns = employees.filter((e) => e.type === "intern");
  const fulltime = employees.filter((e) => e.type === "fulltime");

  // Open details modal
  const handleRowClick = (emp) => {
    setSelectedEmployee(emp);
    setShowDetails(true);
    setTimeout(() => {
      setDetails((prev) => ({
        ...prev,
        [emp.employeeId]: prev[emp.employeeId] || {
          resume: null,
          address: "",
          mobile: "",
          more: null,
        },
      }));
    }, 100);
  };

  // Handle detail change
  const handleDetailChange = (field, value) => {
    setDetails((prev) => ({
      ...prev,
      [selectedEmployee.employeeId]: {
        ...prev[selectedEmployee.employeeId],
        [field]: value,
      },
    }));
  };

  // Handle file upload
  const handleFileChange = (field, file) => {
    setDetails((prev) => ({
      ...prev,
      [selectedEmployee.employeeId]: {
        ...prev[selectedEmployee.employeeId],
        [field]: file,
      },
    }));
  };

  // Handle save (simulate API call)
  const handleSaveDetails = () => {
    setShowDetails(false);
  };

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
        {/* Employee Type Sections */}
        <main className="flex-1 flex flex-col items-center justify-start w-full py-8">
          <div className="w-full max-w-5xl flex flex-col gap-8">
            {/* Interns */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-bold text-[#0D1A33] mb-4 flex items-center gap-2">
                Interns
              </h2>
              {loading ? (
                <div className="text-[#0D1A33] text-center py-8">Loading...</div>
              ) : interns.length === 0 ? (
                <div className="text-gray-400 text-center py-4">No interns found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-[#e9eef6] rounded-lg">
                    <thead>
                      <tr className="bg-[#f4f7fb] text-[#0D1A33]">
                        <th className="py-2 px-4 border-b">Employee ID</th>
                        <th className="py-2 px-4 border-b">Name</th>
                        <th className="py-2 px-4 border-b">Department</th>
                        <th className="py-2 px-4 border-b">Roll</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interns.map((emp, idx) => (
                        <tr
                          key={emp.employeeId || idx}
                          className="text-[#0D1A33] text-sm hover:bg-[#e9eef6] transition cursor-pointer"
                          onClick={() => handleRowClick(emp)}
                        >
                          <td className="py-2 px-4 border-b">{emp.employeeId}</td>
                          <td className="py-2 px-4 border-b">{emp.name}</td>
                          <td className="py-2 px-4 border-b">{emp.department || <span className="text-gray-400">-</span>}</td>
                          <td className="py-2 px-4 border-b">{emp.roll || <span className="text-gray-400">-</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {/* Full Time */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-bold text-[#0D1A33] mb-4 flex items-center gap-2">
                Full Time
              </h2>
              {loading ? (
                <div className="text-[#0D1A33] text-center py-8">Loading...</div>
              ) : fulltime.length === 0 ? (
                <div className="text-gray-400 text-center py-4">No full time employees found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-[#e9eef6] rounded-lg">
                    <thead>
                      <tr className="bg-[#f4f7fb] text-[#0D1A33]">
                        <th className="py-2 px-4 border-b">Employee ID</th>
                        <th className="py-2 px-4 border-b">Name</th>
                        <th className="py-2 px-4 border-b">Department</th>
                        <th className="py-2 px-4 border-b">Roll</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fulltime.map((emp, idx) => (
                        <tr
                          key={emp.employeeId || idx}
                          className="text-[#0D1A33] text-sm hover:bg-[#e9eef6] transition cursor-pointer"
                          onClick={() => handleRowClick(emp)}
                        >
                          <td className="py-2 px-4 border-b">{emp.employeeId}</td>
                          <td className="py-2 px-4 border-b">{emp.name}</td>
                          <td className="py-2 px-4 border-b">{emp.department || <span className="text-gray-400">-</span>}</td>
                          <td className="py-2 px-4 border-b">{emp.roll || <span className="text-gray-400">-</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
        {/* Details Modal */}
        {showDetails && selectedEmployee && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(246,249,252,0.95)" }}>
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-[#4267b2] text-2xl"
                onClick={() => setShowDetails(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4 text-[#0D1A33]">
                Employee Details: {selectedEmployee.name}
              </h3>
              {/* Info Section */}
              <div className="mb-4 bg-[#f4f7fb] rounded-lg p-4">
                <div className="mb-2"><span className="font-semibold">Name:</span> {selectedEmployee.name}</div>
                <div className="mb-2"><span className="font-semibold">Employee ID:</span> {selectedEmployee.employeeId}</div>
                <div className="mb-2"><span className="font-semibold">Department:</span> {selectedEmployee.department || <span className="text-gray-400">-</span>}</div>
                <div className="mb-2"><span className="font-semibold">Roll:</span> {selectedEmployee.roll || <span className="text-gray-400">-</span>}</div>
              </div>
              <form
                className="flex flex-col gap-4"
                onSubmit={e => {
                  e.preventDefault();
                  setShowDetails(false);
                }}
              >
                {/* Resume */}
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Resume
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    onChange={e =>
                      handleFileChange("resume", e.target.files[0])
                    }
                  />
                  {details[selectedEmployee.employeeId]?.resume && (
                    <span className="text-xs text-green-600 mt-1">
                      {details[selectedEmployee.employeeId].resume.name}
                    </span>
                  )}
                </label>
                {/* Address */}
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Address
                  <input
                    type="text"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    value={details[selectedEmployee.employeeId]?.address || ""}
                    onChange={e =>
                      handleDetailChange("address", e.target.value)
                    }
                    placeholder="Enter address"
                  />
                </label>
                {/* Mobile Number */}
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Mobile Number
                  <input
                    type="tel"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    value={details[selectedEmployee.employeeId]?.mobile || ""}
                    onChange={e =>
                      handleDetailChange("mobile", e.target.value)
                    }
                    placeholder="Enter mobile number"
                  />
                </label>
                {/* More (file upload) */}
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  More (Upload)
                  <input
                    type="file"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    onChange={e =>
                      handleFileChange("more", e.target.files[0])
                    }
                  />
                  {details[selectedEmployee.employeeId]?.more && (
                    <span className="text-xs text-green-600 mt-1">
                      {details[selectedEmployee.employeeId].more.name}
                    </span>
                  )}
                </label>
                <button
                  type="submit"
                  className="mt-2 bg-[#4267b2] hover:bg-[#314d80] text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Save Details
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}