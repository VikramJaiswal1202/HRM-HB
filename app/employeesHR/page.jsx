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
    {label: "managers", icon: "👔", route: "/MHR" },
    { label: "View Attendance", icon: "🗓️", route: "/viewattendanceHR" },
    { label: "View Reports", icon: "📊", route: "/reportingHR" },
  ];

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    managerId: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    username: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [message, setMessage] = useState("");

  // Fetch all employees from backend
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hr/users", {
        method: "GET",
        credentials: 'include',
      });
      const data = await res.json();
      
      if (res.ok) {
        // Filter only employees (not interns)
        const employeeList = data.users?.filter(user => user.role === 'employee') || [];
        setEmployees(employeeList);
        setMessage("");
      } else {
        setMessage(data.message || "Failed to fetch employees");
        setEmployees([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("Error connecting to server");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
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

  const handleEditInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add employee and refresh list from backend
  const handleAddEmployee = async (e) => {
    e.preventDefault();

    if (!addForm.name || !addForm.email || !addForm.username || !addForm.password) {
      setMessage("❌ All fields are required.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      
      const res = await fetch("/api/hr/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          ...addForm,
          role: "employee", // Set role as employee
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setShowAdd(false);
        setAddForm({
          name: "",
          email: "",
          username: "",
          password: "",
          managerId: "",
        });
        setMessage("✅ Employee added successfully!");
        fetchEmployees();
      } else {
        setMessage(`❌ ${data.message || "Failed to add employee"}`);
      }
    } catch (err) {
      console.error("Add employee error:", err);
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
      username: emp.username || "",
    });
    setShowDetails(true);
  };

  // Note: Update functionality would need a separate PUT endpoint in your backend
  // Your current backend only has POST, DELETE, and GET
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setMessage("❌ Update functionality not implemented in backend API");
    // TODO: Implement PUT endpoint in backend for updates
  };

  // Delete employee
  const handleDeleteEmployee = async (id) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      setLoading(true);
      
      const res = await fetch("/api/hr/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: id,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage("✅ Employee deleted successfully!");
        fetchEmployees();
      } else {
        setMessage(`❌ ${data.message || "Failed to delete employee"}`);
      }
    } catch (err) {
      console.error("Delete employee error:", err);
      setMessage("❌ Failed to delete employee.");
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
                <div className={`mb-4 p-3 rounded ${message.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
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
                        <th className="py-3 px-6 border-b">Username</th>
                        <th className="py-3 px-6 border-b">Name</th>
                        <th className="py-3 px-6 border-b">Email</th>
                        <th className="py-3 px-6 border-b">Role</th>
                        <th className="py-3 px-6 border-b">Created Date</th>
                        <th className="py-3 px-6 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEmployees.map((emp, idx) => (
                        <tr
                          key={emp._id || idx}
                          className="text-[#0D1A33] text-base hover:bg-[#e9eef6] transition"
                        >
                          <td className="py-3 px-6 border-b">{emp.username}</td>
                          <td 
                            className="py-3 px-6 border-b cursor-pointer hover:text-[#4267b2]"
                            onClick={() => handleRowClick(emp)}
                          >
                            {emp.name}
                          </td>
                          <td className="py-3 px-6 border-b">{emp.email || <span className="text-gray-400">-</span>}</td>
                          <td className="py-3 px-6 border-b">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                              {emp.role}
                            </span>
                          </td>
                          <td className="py-3 px-6 border-b">
                            {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : "-"}
                          </td>
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
                        className="px-3 py-1 rounded bg-[#e9eef6] text-[#0D1A33] font-bold disabled:opacity-50"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>
                      <span className="mx-2 text-[#0D1A33] font-semibold">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="px-3 py-1 rounded bg-[#e9eef6] text-[#0D1A33] font-bold disabled:opacity-50"
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
              <form className="flex flex-col gap-4" onSubmit={handleAddEmployee}>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Name *
                  <input
                    type="text"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2]"
                    value={addForm.name}
                    onChange={e => handleAddInputChange("name", e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Email *
                  <input
                    type="email"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2]"
                    value={addForm.email}
                    onChange={e => handleAddInputChange("email", e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Username *
                  <input
                    type="text"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2]"
                    value={addForm.username}
                    onChange={e => handleAddInputChange("username", e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Password *
                  <input
                    type="password"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2]"
                    value={addForm.password}
                    onChange={e => handleAddInputChange("password", e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Manager ID (Optional)
                  <input
                    type="text"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2]"
                    value={addForm.managerId}
                    onChange={e => handleAddInputChange("managerId", e.target.value)}
                    placeholder="Leave blank if no manager"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 bg-[#4267b2] hover:bg-[#314d80] disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  {loading ? "Adding..." : "Add Employee"}
                </button>
              </form>
            </div>
          </div>
        )}

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
                // Edit Form
                <form className="flex flex-col gap-4" onSubmit={handleUpdateEmployee}>
                  <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                    Name
                    <input
                      type="text"
                      className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2]"
                      value={editForm.name}
                      onChange={e => handleEditInputChange("name", e.target.value)}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                    Email
                    <input
                      type="email"
                      className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2]"
                      value={editForm.email}
                      onChange={e => handleEditInputChange("email", e.target.value)}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                    Username
                    <input
                      type="text"
                      className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2]"
                      value={editForm.username}
                      onChange={e => handleEditInputChange("username", e.target.value)}
                      required
                    />
                  </label>
                  <div className="flex gap-3 mt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-[#4267b2] hover:bg-[#314d80] text-white font-medium py-2 rounded-lg transition-colors"
                    >
                      Update Employee
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({})}
                      className="flex-1 border border-[#4267b2] text-[#4267b2] font-medium py-2 rounded-lg hover:bg-[#f4f7fb] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // View Details
                <div className="flex flex-col gap-4">
                  <div className="bg-gradient-to-r from-[#f4f7fb] to-[#e9eef6] rounded-lg p-6 shadow-sm">
                    <h4 className="font-semibold text-[#4267b2] text-lg mb-4 border-b pb-2 border-[#e9eef6]">
                      Employee Information
                    </h4>
                    <div className="mt-2 grid grid-cols-1 gap-4">
                      <div className="bg-white p-3 rounded-lg shadow-xs">
                        <p className="text-xs text-[#6b7280] uppercase tracking-wider">Name</p>
                        <p className="font-medium text-[#0D1A33] mt-1">{selectedEmployee.name}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-xs">
                        <p className="text-xs text-[#6b7280] uppercase tracking-wider">Email</p>
                        <p className="font-medium text-[#0D1A33] mt-1">{selectedEmployee.email || "-"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-xs">
                        <p className="text-xs text-[#6b7280] uppercase tracking-wider">Username</p>
                        <p className="font-medium text-[#0D1A33] mt-1">{selectedEmployee.username || "-"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-xs">
                        <p className="text-xs text-[#6b7280] uppercase tracking-wider">Role</p>
                        <p className="font-medium text-[#0D1A33] mt-1">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {selectedEmployee.role}
                          </span>
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-xs">
                        <p className="text-xs text-[#6b7280] uppercase tracking-wider">Created Date</p>
                        <p className="font-medium text-[#0D1A33] mt-1">
                          {selectedEmployee.createdAt ? new Date(selectedEmployee.createdAt).toLocaleDateString() : "-"}
                        </p>
                      </div>
                      {selectedEmployee.managerId && (
                        <div className="bg-white p-3 rounded-lg shadow-xs">
                          <p className="text-xs text-[#6b7280] uppercase tracking-wider">Manager ID</p>
                          <p className="font-medium text-[#0D1A33] mt-1">{selectedEmployee.managerId}</p>
                        </div>
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