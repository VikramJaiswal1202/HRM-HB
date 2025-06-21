'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function EmployeesPage() {
  const router = useRouter();

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepageHR" },
    { label: "Employees", icon: "👥", route: "/employeesHR" },
    { label: "Interns", icon: "🎓", route: "/internsHR" },
    { label: "View Attendance", icon: "🗓️", route: "/viewattendanceHR" },
    { label: "View Reports", icon: "📊", route: "/reports" },
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
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    department: "",
    designation: "",
    employeeId: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [message, setMessage] = useState("");

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

  const handleEditInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
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
      setMessage("");
      const res = await fetch("/api/employees", {
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
        setMessage("✅ Employee added!");
        fetchEmployees();
      } else {
        setMessage(data.error || "❌ Failed to add employee.");
      }
    } catch (err) {
      setMessage("❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Edit employee
  const handleEditEmployee = (emp) => {
    setSelectedEmployee(emp);
    setEditForm({
      name: emp.name || "",
      email: emp.email || "",
      mobileNumber: emp.mobileNumber || "",
      department: emp.department || "",
      designation: emp.designation || "",
      employeeId: emp.employeeId || "",
    });
    setShowDetails(true);
  };

  // Update employee details
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/employees/${selectedEmployee._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowDetails(false);
        fetchEmployees();
      } else {
        alert(data.error || "Failed to update employee.");
      }
    } catch (err) {
      alert("Failed to update employee.");
    } finally {
      setLoading(false);
    }
  };

  // Delete employee
  const handleDeleteEmployee = async (id) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchEmployees();
      } else {
        alert(data.error || "Failed to delete employee.");
      }
    } catch (err) {
      alert("Failed to delete employee.");
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
                <div className={`mb-4 ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
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
                        <th className="py-3 px-6 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEmployees.map((emp, idx) => (
                        <tr
                          key={emp.employeeId || idx}
                          className="text-[#0D1A33] text-base hover:bg-[#e9eef6] transition"
                        >
                          <td className="py-3 px-6 border-b">{emp.employeeId}</td>
                          <td 
                            className="py-3 px-6 border-b cursor-pointer"
                            onClick={() => handleRowClick(emp)}
                          >
                            {emp.name}
                          </td>
                          <td className="py-3 px-6 border-b">{emp.email || <span className="text-gray-400">-</span>}</td>
                          <td className="py-3 px-6 border-b">{emp.department || <span className="text-gray-400">-</span>}</td>
                          <td className="py-3 px-6 border-b">{emp.designation || <span className="text-gray-400">-</span>}</td>
                          <td className="py-3 px-6 border-b">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditEmployee(emp)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(emp._id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </td>
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

        {/* Details/Edit Modal */}
       {/* Details/Edit Modal */}
{showDetails && selectedEmployee && (
  <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(246,249,252,0.95)" }}>
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
      <button
        className="absolute top-3 right-3 text-gray-400 hover:text-[#4267b2] text-2xl"
        onClick={() => {
          setShowDetails(false);
          setEditForm({});
        }}
        aria-label="Close"
      >
        &times;
      </button>
      
      <h3 className="text-xl font-bold mb-4 text-[#0D1A33]">
        {editForm.name ? "Edit Employee" : "Employee Details"}
      </h3>
      
      {editForm.name ? (
        // Edit Form (keep existing)
        <form className="flex flex-col gap-4" onSubmit={handleUpdateEmployee}>
          {/* Keep all existing edit form fields */}
        </form>
      ) : (
        // View Details (updated styling)
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-r from-[#f4f7fb] to-[#e9eef6] rounded-lg p-6 shadow-sm">
            <h4 className="font-semibold text-[#4267b2] text-lg mb-4 border-b pb-2 border-[#e9eef6]">
              Basic Information
            </h4>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg shadow-xs">
                <p className="text-xs text-[#6b7280] uppercase tracking-wider">Name</p>
                <p className="font-medium text-[#0D1A33] mt-1">{selectedEmployee.name}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-xs">
                <p className="text-xs text-[#6b7280] uppercase tracking-wider">Email</p>
                <p className="font-medium text-[#0D1A33] mt-1">{selectedEmployee.email || "-"}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-xs">
                <p className="text-xs text-[#6b7280] uppercase tracking-wider">Employee ID</p>
                <p className="font-medium text-[#0D1A33] mt-1">{selectedEmployee.employeeId || "-"}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-xs">
                <p className="text-xs text-[#6b7280] uppercase tracking-wider">Mobile</p>
                <p className="font-medium text-[#0D1A33] mt-1">{selectedEmployee.mobileNumber || "-"}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-xs">
                <p className="text-xs text-[#6b7280] uppercase tracking-wider">Department</p>
                <p className="font-medium text-[#0D1A33] mt-1">{selectedEmployee.department || "-"}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-xs">
                <p className="text-xs text-[#6b7280] uppercase tracking-wider">Designation</p>
                <p className="font-medium text-[#0D1A33] mt-1">{selectedEmployee.designation || "-"}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-[#f4f7fb] to-[#e9eef6] rounded-lg p-6 shadow-sm">
            <h4 className="font-semibold text-[#4267b2] text-lg mb-4 border-b pb-2 border-[#e9eef6]">
              Documents
            </h4>
            <div className="space-y-3">
              {selectedEmployee.resumeUrl && (
                <div className="bg-white p-3 rounded-lg flex justify-between items-center shadow-xs">
                  <div>
                    <p className="text-xs text-[#6b7280] uppercase tracking-wider">Resume</p>
                    <a 
                      href={selectedEmployee.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#4267b2] hover:underline font-medium text-sm"
                    >
                      Download Document
                    </a>
                  </div>
                  <span className="bg-[#e9eef6] text-[#4267b2] p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              )}
              {selectedEmployee.documentsUrl && (
                <div className="bg-white p-3 rounded-lg flex justify-between items-center shadow-xs">
                  <div>
                    <p className="text-xs text-[#6b7280] uppercase tracking-wider">Additional Documents</p>
                    <a 
                      href={selectedEmployee.documentsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#4267b2] hover:underline font-medium text-sm"
                    >
                      Download Document
                    </a>
                  </div>
                  <span className="bg-[#e9eef6] text-[#4267b2] p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              )}
              {!selectedEmployee.resumeUrl && !selectedEmployee.documentsUrl && (
                <div className="text-center text-gray-400 py-4">No documents available</div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => handleEditEmployee(selectedEmployee)}
              className="flex-1 bg-[#4267b2] hover:bg-[#314d80] text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => setShowDetails(false)}
              className="flex-1 border border-[#4267b2] text-[#4267b2] font-medium py-2 rounded-lg hover:bg-[#f4f7fb] transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
)}
      </div>
    </div>
  );
}