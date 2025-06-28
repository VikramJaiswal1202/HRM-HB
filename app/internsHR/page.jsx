"use client";
import { useState, useEffect } from "react";

export default function InternsPage() {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    managerId: "",
  });
  const [message, setMessage] = useState("");

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepageHR" },
    { label: "Employees", icon: "👥", route: "/employeesHR" },
    { label: "Interns", icon: "🎓", route: "/internsHR" },
    {label: "managers", icon: "👔", route: "/MHR" },
    { label: "View Attendance", icon: "🗓️", route: "/viewattendanceHR" },
    { label: "View Reports", icon: "📊", route: "/reportingHR" },
  ];

  // Fetch interns from backend
  const fetchInterns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hr/users", {
        method: "GET",
        credentials: "include", // Include cookies for authentication
      });
      const data = await res.json();
      
      if (res.ok) {
        // Filter only interns from the users
        const internsOnly = data.users.filter(user => user.role === 'intern');
        setInterns(internsOnly);
        setMessage("");
      } else {
        setMessage(data.message || "Error fetching interns");
        setInterns([]);
      }
    } catch (error) {
      console.error("Error fetching interns:", error);
      setMessage("Error fetching interns");
      setInterns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add new intern
  const handleAddIntern = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.username || !formData.password) {
      setMessage("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/hr/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          role: "intern"
        }),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setMessage("Intern added successfully!");
        setAddMode(false);
        setFormData({
          name: "",
          email: "",
          username: "",
          password: "",
          managerId: "",
        });
        fetchInterns(); // Refresh the list
      } else {
        setMessage(result.message || "Error adding intern");
      }
    } catch (error) {
      console.error("Error adding intern:", error);
      setMessage("Error adding intern");
    } finally {
      setLoading(false);
    }
  };

  // Delete intern
  const handleDeleteIntern = async (internId) => {
    if (!confirm("Are you sure you want to delete this intern?")) return;

    try {
      setLoading(true);
      const res = await fetch("/api/hr/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId: internId }),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setMessage("Intern deleted successfully!");
        fetchInterns(); // Refresh the list
      } else {
        setMessage(result.message || "Error deleting intern");
      }
    } catch (error) {
      console.error("Error deleting intern:", error);
      setMessage("Error deleting intern");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (intern) => {
    setSelectedIntern(intern);
    setEditMode(true);
    setFormData({
      name: intern.name,
      email: intern.email,
      username: intern.username,
      password: "", // Don't prefill password for security
      managerId: intern.managerId || "",
    });
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen flex bg-[#f6f9fc]">
      {/* Sidebar */}
      <aside className="w-20 bg-[#0D1A33] text-white flex flex-col items-center py-6 justify-between h-screen">
        <div>
          <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-[#0D1A33] font-bold text-xl mb-8 shadow">
            R
          </div>
          <nav className="flex flex-col gap-3 w-full items-center">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                className={`flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors ${
                  item.label === "Interns" ? "bg-[#1a2b4c]" : ""
                }`}
                onClick={() => window.location.href = item.route}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={() => window.location.href = "/login"}
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
        <header className="bg-[#4267b2] shadow flex items-center px-8 h-16">
          <span className="text-white font-bold text-2xl tracking-wide">
            PulseHR
          </span>
        </header>
        <div className="w-full h-[2px] bg-[#e9eef6]" />
        
        <main className="flex-1 flex flex-col items-center justify-start w-full py-8">
          <div className="w-full max-w-6xl flex flex-col gap-8">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-[#0D1A33] flex items-center gap-2">
                  Interns
                </h2>
                <button
                  className="bg-[#4267b2] text-white px-4 py-1 rounded hover:bg-[#314d80] transition"
                  onClick={() => setAddMode(true)}
                >
                  Add Intern
                </button>
              </div>
              
              {message && (
                <div className={`mb-4 p-3 rounded-lg ${
                  message.includes("success") || message.includes("successfully") 
                    ? "bg-green-100 text-green-700 border border-green-200" 
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}>
                  {message}
                </div>
              )}
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4267b2]"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-[#e9eef6] rounded-lg text-base">
                    <thead>
                      <tr className="bg-[#f4f7fb] text-[#0D1A33]">
                        <th className="py-3 px-6 border-b text-left">User ID</th>
                        <th className="py-3 px-6 border-b text-left">Name</th>
                        <th className="py-3 px-6 border-b text-left">Email</th>
                        <th className="py-3 px-6 border-b text-left">Username</th>
                        <th className="py-3 px-6 border-b text-left">Role</th>
                        <th className="py-3 px-6 border-b text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interns.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-gray-400 py-6">
                            No interns found
                          </td>
                        </tr>
                      ) : (
                        interns.map((intern) => (
                          <tr
                            key={intern._id}
                            className="text-[#0D1A33] text-base hover:bg-[#f9fafb] transition"
                          >
                            <td className="py-3 px-6 border-b">{intern._id.slice(-8)}</td>
                            <td 
                              className="py-3 px-6 border-b cursor-pointer text-[#4267b2] hover:underline"
                              onClick={() => setSelectedIntern(intern)}
                            >
                              {intern.name}
                            </td>
                            <td className="py-3 px-6 border-b">{intern.email}</td>
                            <td className="py-3 px-6 border-b">{intern.username}</td>
                            <td className="py-3 px-6 border-b">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {intern.role}
                              </span>
                            </td>
                            <td className="py-3 px-6 border-b">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditClick(intern)}
                                  className="text-blue-600 hover:text-blue-800 p-1 rounded"
                                  title="Edit"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteIntern(intern._id)}
                                  className="text-red-600 hover:text-red-800 p-1 rounded"
                                  title="Delete"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Add Intern Modal */}
        {addMode && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(246,249,252,0.95)" }}>
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-[#4267b2] text-2xl"
                onClick={() => {
                  setAddMode(false);
                  setFormData({
                    name: "",
                    email: "",
                    username: "",
                    password: "",
                    managerId: "",
                  });
                }}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4 text-[#0D1A33]">
                Add New Intern
              </h3>
              <form onSubmit={handleAddIntern} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Name*
                  <input
                    type="text"
                    name="name"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2] focus:border-transparent"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Email*
                  <input
                    type="email"
                    name="email"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2] focus:border-transparent"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Username*
                  <input
                    type="text"
                    name="username"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2] focus:border-transparent"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Password*
                  <input
                    type="password"
                    name="password"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2] focus:border-transparent"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                  <span className="text-xs text-gray-500">Minimum 6 characters</span>
                </label>
                <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                  Manager ID (Optional)
                  <input
                    type="text"
                    name="managerId"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2] focus:border-transparent"
                    value={formData.managerId}
                    onChange={handleInputChange}
                    placeholder="Leave empty if no manager"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 bg-[#4267b2] hover:bg-[#314d80] text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Adding..." : "Add Intern"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* View/Edit Intern Modal */}
        {selectedIntern && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(246,249,252,0.95)" }}>
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-[#4267b2] text-2xl"
                onClick={() => {
                  setSelectedIntern(null);
                  setEditMode(false);
                  setFormData({
                    name: "",
                    email: "",
                    username: "",
                    password: "",
                    managerId: "",
                  });
                }}
                aria-label="Close"
              >
                &times;
              </button>
              
              <h3 className="text-xl font-bold mb-4 text-[#0D1A33]">
                {editMode ? "Edit Intern" : "Intern Details"}
              </h3>
              
              {editMode ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  // Note: Backend doesn't have update functionality, so we'll show a message
                  setMessage("Update functionality not implemented in backend yet");
                  setEditMode(false);
                }} className="flex flex-col gap-4">
                  <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                    Name*
                    <input
                      type="text"
                      name="name"
                      className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2] focus:border-transparent"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                    Email*
                    <input
                      type="email"
                      name="email"
                      className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2] focus:border-transparent"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                    Username*
                    <input
                      type="text"
                      name="username"
                      className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2] focus:border-transparent"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                    New Password (Leave empty to keep current)
                    <input
                      type="password"
                      name="password"
                      className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2] focus:border-transparent"
                      value={formData.password}
                      onChange={handleInputChange}
                      minLength={6}
                    />
                  </label>
                  <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
                    Manager ID
                    <input
                      type="text"
                      name="managerId"
                      className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb] focus:outline-none focus:ring-2 focus:ring-[#4267b2] focus:border-transparent"
                      value={formData.managerId}
                      onChange={handleInputChange}
                    />
                  </label>
                  <div className="flex gap-3 mt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#4267b2] hover:bg-[#314d80] text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? "Updating..." : "Update"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="flex-1 border border-[#4267b2] text-[#4267b2] font-medium py-2 rounded-lg hover:bg-[#f4f7fb] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="bg-gradient-to-r from-[#f4f7fb] to-[#e9eef6] rounded-lg p-6 shadow-sm">
                    <h4 className="font-semibold text-[#4267b2] text-lg mb-4 border-b pb-2 border-[#e9eef6]">
                      Basic Information
                    </h4>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg shadow-xs">
                        <p className="text-xs text-[#6b7280] uppercase tracking-wider">Name</p>
                        <p className="font-medium text-[#0D1A33] mt-1">{selectedIntern.name}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-xs">
                        <p className="text-xs text-[#6b7280] uppercase tracking-wider">Email</p>
                        <p className="font-medium text-[#0D1A33] mt-1">{selectedIntern.email}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-xs">
                        <p className="text-xs text-[#6b7280] uppercase tracking-wider">Username</p>
                        <p className="font-medium text-[#0D1A33] mt-1">{selectedIntern.username}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-xs">
                        <p className="text-xs text-[#6b7280] uppercase tracking-wider">Role</p>
                        <p className="font-medium text-[#0D1A33] mt-1 capitalize">{selectedIntern.role}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-xs col-span-2">
                        <p className="text-xs text-[#6b7280] uppercase tracking-wider">Manager ID</p>
                        <p className="font-medium text-[#0D1A33] mt-1">{selectedIntern.managerId || "No manager assigned"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-[#f4f7fb] to-[#e9eef6] rounded-lg p-6 shadow-sm">
                    <h4 className="font-semibold text-[#4267b2] text-lg mb-4 border-b pb-2 border-[#e9eef6]">
                      System Information
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg shadow-xs">
                        <p className="text-xs text-[#6b7280] uppercase tracking-wider">User ID</p>
                        <p className="font-mono text-sm text-[#0D1A33] mt-1">{selectedIntern._id}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-xs">
                        <p className="text-xs text-[#6b7280] uppercase tracking-wider">Company ID</p>
                        <p className="font-mono text-sm text-[#0D1A33] mt-1">{selectedIntern.companyId}</p>
                      </div>
                      {selectedIntern.createdBy && (
                        <div className="bg-white p-3 rounded-lg shadow-xs">
                          <p className="text-xs text-[#6b7280] uppercase tracking-wider">Created By</p>
                          <p className="font-mono text-sm text-[#0D1A33] mt-1">{selectedIntern.createdBy}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex-1 bg-[#4267b2] hover:bg-[#314d80] text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => setSelectedIntern(null)}
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