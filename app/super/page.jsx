'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, BarChart, Building, Users } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function SuperAdminPage() {
  const [activeSection, setActiveSection] = useState('analytics');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingCompanies, setFetchingCompanies] = useState(true);
  const [error, setError] = useState('');
  const [companyEmployees, setCompanyEmployees] = useState({});
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const sidebarItems = [
    { label: "Analytics", icon: <BarChart size={18} className="mr-2" />, section: "analytics" },
    { label: "Company Details", icon: <Building size={18} className="mr-2" />, section: "company" },
  ];

  // Fetch companies from backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setFetchingCompanies(true);
        const response = await fetch('/api/companies');
        
        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }
        
        const data = await response.json();
        setCompanies(data.companies || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching companies:', err);
      } finally {
        setFetchingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch employees for a specific company
  const fetchEmployees = async (companyId) => {
    setLoadingEmployees(true);
    try {
      const res = await fetch(`/api/companies/${companyId}/employees`, {
        method: "GET",
        credentials: 'include',
      });
      const data = await res.json();
      
      if (res.ok) {
        setCompanyEmployees(prev => ({
          ...prev,
          [companyId]: data.employees || []
        }));
        setMessage("");
      } else {
        setMessage(data.message || "Failed to fetch employees");
        setCompanyEmployees(prev => ({
          ...prev,
          [companyId]: []
        }));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("Error connecting to server");
      setCompanyEmployees(prev => ({
        ...prev,
        [companyId]: []
      }));
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Handle company selection
  const handleCompanyClick = async (company) => {
    setSelectedCompany(company);
    if (!companyEmployees[company._id]) {
      await fetchEmployees(company._id);
    }
  };

  // Handle adding a new company
  const handleAddCompany = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCompany),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add company');
      }

      // Refresh companies list after adding new one
      const refreshResponse = await fetch('/api/companies');
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setCompanies(refreshData.companies || []);
      }

      // Reset form
      setNewCompany({ name: '', email: '', password: '' });
      setShowAddForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  // Get paginated employees for current company
  const getPaginatedEmployees = () => {
    if (!selectedCompany || !companyEmployees[selectedCompany._id]) return [];
    const employees = companyEmployees[selectedCompany._id];
    return employees.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  };

  // Get total pages for current company's employees
  const getTotalPages = () => {
    if (!selectedCompany || !companyEmployees[selectedCompany._id]) return 0;
    return Math.ceil(companyEmployees[selectedCompany._id].length / pageSize);
  };

  // Analytics data calculation
  const getCompanyAnalytics = (company) => {
    const employees = companyEmployees[company._id] || [];
    const completedTasks = employees.reduce((sum, emp) => sum + (emp.completedTasks || 0), 0);
    const pendingTasks = employees.reduce((sum, emp) => sum + (emp.pendingTasks || 0), 0);
    
    return {
      employees: employees.length,
      completedTasks,
      pendingTasks,
      totalTasks: completedTasks + pendingTasks,
      completionRate: completedTasks + pendingTasks > 0 
        ? Math.round((completedTasks / (completedTasks + pendingTasks)) * 100)
        : 0
    };
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
                className={`flex flex-col items-center gap-1 rounded py-2 w-16 transition-colors ${
                  activeSection === item.section ? 'bg-[#4267b2]' : 'hover:bg-[#1a2b4c]'
                }`}
                onClick={() => {
                  setActiveSection(item.section);
                  setSelectedCompany(null);
                }}
              >
                {React.cloneElement(item.icon, { className: "text-2xl" })}
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
              <LogOut size={22} />
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
            PulseHR - SuperAdmin
          </span>
        </header>
        <div className="w-full h-[2px] bg-[#e9eef6]" />

        {/* Page Content */}
        <main className="flex-1 p-8">
          {activeSection === 'analytics' && !selectedCompany && (
            <div className="space-y-8">
              <h1 className="text-3xl font-semibold text-[#0D1A33]">Company Analytics</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => {
                  const analytics = getCompanyAnalytics(company);
                  return (
                    <div
                      key={company._id}
                      className="p-6 bg-white rounded-xl shadow hover:shadow-md transition cursor-pointer border-2 border-transparent hover:border-blue-400"
                      onClick={() => handleCompanyClick(company)}
                    >
                      <h2 className="text-xl font-bold text-gray-900 mb-1">{company.name}</h2>
                      <p className="text-gray-600">👥 Employees: {analytics.employees}</p>
                      <p className="text-gray-600">✅ Tasks Done: {analytics.completedTasks}</p>
                      <p className="text-gray-600">⏳ Pending: {analytics.pendingTasks}</p>
                      <div className="mt-2">
                        <span className="text-blue-700 font-semibold">
                          Completion: {analytics.completionRate}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === 'analytics' && selectedCompany && (
            <div className="space-y-6">
              <button
                className="mb-6 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                onClick={() => setSelectedCompany(null)}
              >
                ← Back to All Companies
              </button>
              
              <h1 className="text-3xl font-semibold text-[#0D1A33] mb-4">
                {selectedCompany.name} Analytics
              </h1>
              
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-[#f4f7fb] p-4 rounded-lg">
                    <h3 className="font-semibold text-[#4267b2] mb-2">Company Information</h3>
                    <p><span className="font-medium">Email:</span> {selectedCompany.email}</p>
                    <p><span className="font-medium">Employees:</span> {companyEmployees[selectedCompany._id]?.length || 0}</p>
                  </div>
                  
                  <div className="bg-[#f4f7fb] p-4 rounded-lg">
                    <h3 className="font-semibold text-[#4267b2] mb-2">Performance Summary</h3>
                    {companyEmployees[selectedCompany._id] ? (
                      <>
                        <p><span className="font-medium">Total Tasks:</span> {getCompanyAnalytics(selectedCompany).totalTasks}</p>
                        <p><span className="font-medium">Completion Rate:</span> {getCompanyAnalytics(selectedCompany).completionRate}%</p>
                      </>
                    ) : (
                      <p>Loading performance data...</p>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-[#0D1A33] mb-4">Employees</h3>
                
                {loadingEmployees ? (
                  <div className="text-center py-8">Loading employees...</div>
                ) : companyEmployees[selectedCompany._id]?.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">No employees found.</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-[#e9eef6] rounded-lg text-base">
                        <thead>
                          <tr className="bg-[#f4f7fb] text-[#0D1A33]">
                            <th className="py-3 px-6 border-b">Name</th>
                            <th className="py-3 px-6 border-b">Email</th>
                            <th className="py-3 px-6 border-b">Role</th>
                            <th className="py-3 px-6 border-b">Completed Tasks</th>
                            <th className="py-3 px-6 border-b">Pending Tasks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getPaginatedEmployees().map((emp) => (
                            <tr
                              key={emp._id}
                              className="text-[#0D1A33] text-base hover:bg-[#e9eef6] transition"
                            >
                              <td className="py-3 px-6 border-b">{emp.name}</td>
                              <td className="py-3 px-6 border-b">{emp.email || <span className="text-gray-400">-</span>}</td>
                              <td className="py-3 px-6 border-b">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                  {emp.role}
                                </span>
                              </td>
                              <td className="py-3 px-6 border-b">{emp.completedTasks || 0}</td>
                              <td className="py-3 px-6 border-b">{emp.pendingTasks || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
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
                          Page {currentPage} of {getTotalPages()}
                        </span>
                        <button
                          className="px-3 py-1 rounded bg-[#e9eef6] text-[#0D1A33] font-bold disabled:opacity-50"
                          onClick={() => setCurrentPage((p) => Math.min(getTotalPages(), p + 1))}
                          disabled={currentPage === getTotalPages()}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeSection === 'company' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-semibold text-[#0D1A33]">Company Details</h1>
              
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-[#4267b2] text-white rounded hover:bg-[#314d80] transition"
              >
                + Add Company
              </button>

              {showAddForm && (
                <form onSubmit={handleAddCompany} className="p-6 bg-white rounded-xl shadow mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-[#0D1A33]">Add New Company</h2>
                  
                  {error && <div className="text-red-500 mb-4">{error}</div>}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#0D1A33] mb-1">Company Name</label>
                      <input
                        type="text"
                        value={newCompany.name}
                        onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                        className="w-full p-2 border border-[#e9eef6] rounded-lg focus:ring-2 focus:ring-[#4267b2] focus:outline-none"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#0D1A33] mb-1">Email</label>
                      <input
                        type="email"
                        value={newCompany.email}
                        onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
                        className="w-full p-2 border border-[#e9eef6] rounded-lg focus:ring-2 focus:ring-[#4267b2] focus:outline-none"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#0D1A33] mb-1">Password</label>
                      <input
                        type="password"
                        value={newCompany.password}
                        onChange={(e) => setNewCompany({...newCompany, password: e.target.value})}
                        className="w-full p-2 border border-[#e9eef6] rounded-lg focus:ring-2 focus:ring-[#4267b2] focus:outline-none"
                        required
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-[#4267b2] text-white rounded-lg hover:bg-[#314d80] transition disabled:opacity-50"
                      >
                        {isLoading ? 'Adding...' : 'Add Company'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 bg-[#e9eef6] text-[#0D1A33] rounded-lg hover:bg-[#d0d9e8] transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {fetchingCompanies ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4267b2]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {companies.map((company) => (
                    <div
                      key={company._id}
                      className="p-6 bg-white rounded-xl shadow hover:shadow-md transition cursor-pointer"
                      onClick={() => router.push('/homepageC')}
                    >
                      <h2 className="text-xl font-bold text-[#0D1A33] mb-1">{company.name}</h2>
                      <p className="text-[#0D1A33]">📧 {company.email}</p>
                      <p className="text-[#0D1A33]">👥 Employees: {companyEmployees[company._id]?.length || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}