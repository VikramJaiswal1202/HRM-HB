'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function EmployeesPage() {
  const router = useRouter();

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepage" },
    { label: "Employees", icon: "👥", route: "/employees" },
    { label: "Interns", icon: "👥", route: "/intern" },
    { label: "Attendance", icon: "🗓", route: "/attendance" },
    { label: "View Attendance", icon: "🗓", route: "/presentEmployees" },
    { label: "Reporting", icon: "⏱", route: "/reporting" },
  ];

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    department: "",
    designation: "",
    employeeId: "",
    resume: null,
    documents: null,
  });
  const [detailsForm, setDetailsForm] = useState({
    email: "",
    department: "",
    designation: "",
    resume: null,
    documents: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [message, setMessage] = useState("");

  // Fetch all employees from backend
  const fetchEmployees = () => {
    setLoading(true);
    fetch("/api/staff")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data.staffList || []);
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
    setDetailsForm({
      email: emp.email || "",
      department: emp.department || "",
      designation: emp.designation || "",
      resume: null,
      documents: null,
    });
  };

  const handleAddInputChange = (field, value) => {
    setAddForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddFileChange = (field, file) => {
    setAddForm((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleDetailsInputChange = (field, value) => {
    setDetailsForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDetailsFileChange = (field, file) => {
    setDetailsForm((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  // Add employee and refresh list from backend
  const handleAddEmployee = async (e) => {
    e.preventDefault();

    if (!addForm.resume || !addForm.documents) {
      setMessage("Please upload both resume and documents.");
      return;
    }

    const formData = new FormData();
    formData.append("name", addForm.name);
    formData.append("email", addForm.email);
    formData.append("mobileNumber", addForm.mobileNumber);
    formData.append("department", addForm.department);
    formData.append("designation", addForm.designation);
    formData.append("employeeId", addForm.employeeId);
    formData.append("resume", addForm.resume);
    formData.append("documents", addForm.documents);

    try {
      setLoading(true);
      const res = await fetch("/api/staff", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setShowAdd(false);
        setAddForm({
          name: "",
          email: "",
          mobileNumber: "",
          department: "",
          designation: "",
          employeeId: "",
          resume: null,
          documents: null,
        });
        setMessage("Staff added successfully!");
        fetchEmployees();
      } else {
        setMessage("Error: " + data.error);
      }
    } catch (err) {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Update employee details (email, department, designation, resume, documents)
  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    const formData = new FormData();
    formData.append("email", detailsForm.email);
    formData.append("department", detailsForm.department);
    formData.append("designation", detailsForm.designation);
    if (detailsForm.resume) formData.append("resume", detailsForm.resume);
    if (detailsForm.documents) formData.append("documents", detailsForm.documents);

    try {
      setLoading(true);
      const res = await fetch(`/api/staff/${selectedEmployee._id}`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setShowDetails(false);
        fetchEmployees();
      } else {
        alert(data.error || "Failed to update details.");
      }
    } catch (err) {
      alert("Failed to update details.");
    } finally {
      setLoading(false);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex bg-[#f6f9fc]">
      {/* Sidebar */}
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
                <button
                  className="bg-[#4267b2] text-white px-4 py-1 rounded hover:bg-[#314d80] transition"
                  onClick={() => setShowAdd(true)}
                >
                  Add Employee
                </button>
              </div>
              {message && (
                <div className={`mb-4 ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {message}
                </div>
              )}
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
        {/* Add Employee Modal */}
        {showAdd && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(246,249,252,0.95)" }}>
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-[#4267b2] text-2xl"
                onClick={() => setShowAdd(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4 text-[#0D1A33]">
                Add Employee
              </h3>
              <form
                className="flex flex-col gap-4"
                onSubmit={handleAddEmployee}
                encType="multipart/form-data"
              >
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Name
                  <input
                    type="text"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    value={addForm.name}
                    onChange={e => handleAddInputChange("name", e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Email
                  <input
                    type="email"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    value={addForm.email}
                    onChange={e => handleAddInputChange("email", e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Mobile Number
                  <input
                    type="text"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    value={addForm.mobileNumber}
                    onChange={e => handleAddInputChange("mobileNumber", e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Department
                  <input
                    type="text"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    value={addForm.department}
                    onChange={e => handleAddInputChange("department", e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Designation
                  <input
                    type="text"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    value={addForm.designation}
                    onChange={e => handleAddInputChange("designation", e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Employee ID
                  <input
                    type="text"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    value={addForm.employeeId}
                    onChange={e => handleAddInputChange("employeeId", e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Resume
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    onChange={e => handleAddFileChange("resume", e.target.files[0])}
                    required
                  />
                  {addForm.resume && (
                    <span className="text-xs text-green-600 mt-1">
                      {addForm.resume.name}
                    </span>
                  )}
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Documents
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    onChange={e => handleAddFileChange("documents", e.target.files[0])}
                    required
                  />
                  {addForm.documents && (
                    <span className="text-xs text-green-600 mt-1">
                      {addForm.documents.name}
                    </span>
                  )}
                </label>
                <button
                  type="submit"
                  className="mt-2 bg-[#4267b2] hover:bg-[#314d80] text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Add Employee
                </button>
              </form>
            </div>
          </div>
        )}
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
              {/* Show existing details */}
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
              {/* Form to update details */}
              <form className="flex flex-col gap-4" onSubmit={handleSaveDetails}>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Email
                  <input
                    type="email"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    value={detailsForm.email}
                    onChange={e => handleDetailsInputChange("email", e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Department
                  <input
                    type="text"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    value={detailsForm.department}
                    onChange={e => handleDetailsInputChange("department", e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Designation
                  <input
                    type="text"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    value={detailsForm.designation}
                    onChange={e => handleDetailsInputChange("designation", e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Resume
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    onChange={e => handleDetailsFileChange("resume", e.target.files[0])}
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Documents
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    onChange={e => handleDetailsFileChange("documents", e.target.files[0])}
                  />
                </label>
                <button
                  type="submit"
                  className="mt-2 bg-[#4267b2] hover:bg-[#314d80] text-white font-bold py-2 rounded-lg transition-colors w-full"
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