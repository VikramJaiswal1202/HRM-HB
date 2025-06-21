'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function EmployeesPage() {
  const router = useRouter();

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepageM" },
    { label: "Employees", icon: "👥", route: "/employeesM" },
    { label: "Intern", icon: "👥", route: "/intern" },
    { label: "Attendance and timing", icon: "🗓️", route: "/attendance" },
    { label: "View Attendance", icon: "🗓️", route: "/presentEmployees" },
    { label: "Timing Reporting", icon: "⏱️", route: "/reporting" },
    { label: "Task Assign", icon: "📝",route: "/taskAssign"},
  ];

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);

  // Fetch all employees from backend
  const fetchEmployees = () => {
    setLoading(true);
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data.employees || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(employees.length / pageSize);
  const paginatedEmployees = employees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleRowClick = (emp) => {
    setSelectedEmployee(emp);
    setShowDetails(true);
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex bg-[#f6f9fc]">
      {/* Sidebar - sticky and logout floatable */}
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
        {/* Floatable logout button */}
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
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-[#4267b2] shadow flex items-center px-8 h-16">
          <span className="text-white font-bold text-2xl tracking-wide">
            PulseHR
          </span>
        </header>
        <div className="w-full h-[2px] bg-[#e9eef6]" />
        {/* Employee Table */}
        <main className="flex-1 flex flex-col items-center justify-start w-full py-8">
          <div className="w-full max-w-6xl flex flex-col gap-8">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-[#0D1A33] flex items-center gap-2">
                  Employees
                </h2>
              </div>
              {loading ? (
                <div className="text-[#0D1A33] text-center py-8">Loading...</div>
              ) : employees.length === 0 ? (
                <div className="text-gray-400 text-center py-4">No employees found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-[#e9eef6] rounded-lg text-base">
                    <thead>
                      <tr className="bg-[#f4f7fb] text-[#0D1A33]">
                        <th className="py-3 px-6 border-b">Employee ID</th>
                        <th className="py-3 px-6 border-b">Name</th>
                        <th className="py-3 px-6 border-b">Email</th>
                        <th className="py-3 px-6 border-b">Department</th>
                        <th className="py-3 px-6 border-b">Designation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEmployees.map((emp, idx) => (
                        <tr
                          key={emp.employeeId || idx}
                          className="text-[#0D1A33] text-base hover:bg-[#e9eef6] transition cursor-pointer"
                          onClick={() => handleRowClick(emp)}
                        >
                          <td className="py-3 px-6 border-b">{emp.employeeId}</td>
                          <td className="py-3 px-6 border-b">{emp.name}</td>
                          <td className="py-3 px-6 border-b">{emp.email || <span className="text-gray-400">-</span>}</td>
                          <td className="py-3 px-6 border-b">{emp.department || <span className="text-gray-400">-</span>}</td>
                          <td className="py-3 px-6 border-b">{emp.designation || <span className="text-gray-400">-</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Pagination */}
                  <div className="flex flex-wrap justify-between items-center gap-2 mt-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[#0D1A33] font-semibold">Rows per page:</span>
                      <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="border border-[#4267b2] rounded px-2 py-1 text-[#4267b2] font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#4267b2]"
                        style={{ minWidth: 60 }}
                      >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 rounded bg-[#e9eef6] text-[#0D1A33] font-bold"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>
                      <span className="mx-2 text-[#0D1A33] font-semibold">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="px-3 py-1 rounded bg-[#e9eef6] text-[#0D1A33] font-bold"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
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
              {/* Show existing details only */}
              <div className="mb-4 bg-[#e9eef6] rounded-lg p-4">
                <div className="mb-2 text-[#0D1A33]"><span className="font-semibold">Name:</span> {selectedEmployee.name}</div>
                <div className="mb-2 text-[#0D1A33]"><span className="font-semibold">Employee ID:</span> {selectedEmployee.employeeId}</div>
                <div className="mb-2 text-[#0D1A33]"><span className="font-semibold">Email:</span> {selectedEmployee.email || <span className="text-gray-400">-</span>}</div>
                <div className="mb-2 text-[#0D1A33]"><span className="font-semibold">Department:</span> {selectedEmployee.department || <span className="text-gray-400">-</span>}</div>
                <div className="mb-2 text-[#0D1A33]"><span className="font-semibold">Designation:</span> {selectedEmployee.designation || <span className="text-gray-400">-</span>}</div>
                {selectedEmployee.resumeUrl && (
                  <div className="mb-2 text-[#0D1A33]">
                    <span className="font-semibold">Resume:</span>{" "}
                    <a href={selectedEmployee.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                  </div>
                )}
                {selectedEmployee.documentsUrl && (
                  <div className="mb-2 text-[#0D1A33]">
                    <span className="font-semibold">Documents:</span>{" "}
                    <a href={selectedEmployee.documentsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="mt-2 bg-[#4267b2] hover:bg-[#314d80] text-white font-bold py-2 rounded-lg transition-colors w-full"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}