'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, BarChart, Building } from 'lucide-react';

// Mock analytics for each company except PulseHR
const companyAnalytics = {
  'Acme Inc.': {
    completedTasks: 400,
    pendingTasks: 100,
    employees: 120,
  },
  'Globex Corp.': {
    completedTasks: 300,
    pendingTasks: 50,
    employees: 80,
  },
  // PulseHR will use real data
};

const DEFAULT_COMPANIES = [
  { name: 'Acme Inc.', email: 'admin@acme.com', employees: 120 },
  { name: 'Globex Corp.', email: 'info@globex.com', employees: 80 },
  { name: 'PulseHR', email: 'contact@pulsehr.com', employees: null }, // Will fetch real count
];

export default function SuperAdminPage() {
  const [activeSection, setActiveSection] = useState('analytics');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [pulseEmployees, setPulseEmployees] = useState([]);
  const [showPulseEmployees, setShowPulseEmployees] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Persistent companies state
  const [companies, setCompanies] = useState(DEFAULT_COMPANIES);
  const [newCompany, setNewCompany] = useState({ name: '', email: '', employees: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const router = useRouter();

  // Load companies from localStorage on mount
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('companies') : null;
    if (stored) {
      setCompanies(JSON.parse(stored));
    }
  }, []);

  // Save companies to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('companies', JSON.stringify(companies));
    }
  }, [companies]);

  // Logout handler
  const handleLogout = () => {
    router.push('/login');
  };

  // Handle company analytics card click
  const handleAnalyticsCompanyClick = async (company) => {
    setSelectedCompany(company);
    setActiveSection('analytics');
    setShowPulseEmployees(false);

    if (company.name === 'PulseHR') {
      setLoadingEmployees(true);
      try {
        const res = await fetch('/api/employees/seed', { method: 'POST' }); // Seed if needed
        await fetchEmployees();
      } catch {
        await fetchEmployees();
      }
      setLoadingEmployees(false);
    }
  };

  // Fetch employees for PulseHR
  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setPulseEmployees(data.employees || []);
      } else {
        setPulseEmployees([]);
      }
    } catch {
      setPulseEmployees([]);
    }
  };

  // Handle company details card click
  const handleCompanyClick = () => {
    router.push('/homepage');
  };

  // Add company handler
  const handleAddCompany = (e) => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.password || !newCompany.email || !newCompany.employees) return;
    setCompanies([
      ...companies,
      {
        name: newCompany.name,
        password: newCompany.password,
        email: newCompany.email,
        employees: parseInt(newCompany.employees, 10),
      },
    ]);
    setNewCompany({ name: '', email: '', employees: '', password: '' });
    setShowAddForm(false);
  };

  // Pie chart and bar chart rendering (simple SVGs for demo)
  const renderCharts = (analytics) => {
    const total = analytics.completedTasks + analytics.pendingTasks;
    const completedPercent = total ? (analytics.completedTasks / total) * 100 : 0;
    const pendingPercent = total ? (analytics.pendingTasks / total) * 100 : 0;

    // Pie chart angles
    const completedAngle = (completedPercent / 100) * 360;
    const pendingAngle = (pendingPercent / 100) * 360;

    return (
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center mt-8">
        {/* Pie Chart */}
        <div className="flex flex-col items-center">
          <svg width="120" height="120" viewBox="0 0 32 32">
            <circle r="16" cx="16" cy="16" fill="#f3f4f6" />
            <circle
              r="16"
              cx="16"
              cy="16"
              fill="transparent"
              stroke="#7d2ae8"
              strokeWidth="4"
              strokeDasharray={`${completedAngle / 360 * 100} ${100 - (completedAngle / 360 * 100)}`}
              strokeDashoffset="25"
              transform="rotate(-90 16 16)"
            />
            <circle
              r="16"
              cx="16"
              cy="16"
              fill="transparent"
              stroke="#4267b2"
              strokeWidth="4"
              strokeDasharray={`${pendingAngle / 360 * 100} ${100 - (pendingAngle / 360 * 100)}`}
              strokeDashoffset={25 + (completedAngle / 360 * 100)}
              transform="rotate(-90 16 16)"
            />
          </svg>
          <div className="mt-2 text-sm">
            <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: "#7d2ae8" }} /> Completed<br />
            <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: "#4267b2" }} /> Pending
          </div>
        </div>
        {/* Bar Chart */}
        <div className="flex flex-col items-center">
          <div className="flex gap-4 items-end h-32">
            <div className="flex flex-col items-center">
              <div
                className="w-10 bg-purple-500 rounded-t"
                style={{ height: `${completedPercent * 1.2}px` }}
                title="Completed Tasks"
              ></div>
              <span className="mt-2 text-xs text-gray-700">Completed</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className="w-10 bg-blue-500 rounded-t"
                style={{ height: `${pendingPercent * 1.2}px` }}
                title="Pending Tasks"
              ></div>
              <span className="mt-2 text-xs text-gray-700">Pending</span>
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="font-semibold">Total Tasks:</span> {total}
          </div>
        </div>
      </div>
    );
  };

  // PulseHR analytics (use real employee count)
  const pulseAnalytics = {
    completedTasks: 800,
    pendingTasks: 200,
    employees: pulseEmployees.length,
  };

  return (
    <div className="flex min-h-screen font-sans bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-lg flex flex-col justify-between">
        <div>
          <div className="p-5 text-2xl font-bold text-blue-600 border-b">SuperAdmin</div>
          <nav className="mt-4">
            <SidebarItem
              label="Analytics"
              icon={<BarChart size={18} className="mr-2" />}
              active={activeSection === 'analytics'}
              onClick={() => {
                setActiveSection('analytics');
                setSelectedCompany(null);
                setShowPulseEmployees(false);
              }}
            />
            <SidebarItem
              label="Company Details"
              icon={<Building size={18} className="mr-2" />}
              active={activeSection === 'company'}
              onClick={() => setActiveSection('company')}
            />
          </nav>
        </div>
        <button
          className="flex items-center gap-2 p-4 text-red-600 hover:bg-red-50 border-t transition"
          onClick={handleLogout}
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeSection === 'analytics' && !selectedCompany && (
          <div className="space-y-8">
            <h1 className="text-3xl font-semibold text-blue-700">Company Analytics</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company, idx) => {
                let analytics = companyAnalytics[company.name];
                let percent = 0;
                let employees = company.employees;

                // For PulseHR, use real employee count
                if (company.name === 'PulseHR') {
                  analytics = pulseAnalytics;
                  employees = pulseEmployees.length;
                }

                // For new companies, show 0 analytics if not present
                if (!analytics) {
                  analytics = { completedTasks: 0, pendingTasks: 0 };
                }

                const total = analytics.completedTasks + analytics.pendingTasks;
                percent = total
                  ? Math.round((analytics.completedTasks / total) * 100)
                  : 0;

                return (
                  <div
                    key={idx}
                    className="p-6 bg-white rounded-xl shadow hover:shadow-md transition cursor-pointer border-2 border-transparent hover:border-blue-400"
                    onClick={() => handleAnalyticsCompanyClick(company)}
                  >
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{company.name}</h2>
                    <p
                      className="text-gray-600 cursor-pointer underline"
                      onClick={e => {
                        e.stopPropagation();
                        if (company.name === 'PulseHR') setShowPulseEmployees(true);
                      }}
                    >
                      👥 Employees: {company.name === 'PulseHR' ? (loadingEmployees ? 'Loading...' : employees) : employees}
                    </p>
                    <p className="text-gray-600">✅ Tasks Done: {analytics.completedTasks}</p>
                    <p className="text-gray-600">⏳ Pending: {analytics.pendingTasks}</p>
                    <div className="mt-2">
                      <span className="text-blue-700 font-semibold">
                        Completion: {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSection === 'analytics' && selectedCompany && !showPulseEmployees && (
          <div>
            <button
              className="mb-6 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
              onClick={() => setSelectedCompany(null)}
            >
              ← Back to All Companies
            </button>
            <h1 className="text-3xl font-semibold text-blue-700 mb-4">
              {selectedCompany.name} Analytics
            </h1>
            <div className="mb-4 text-lg">
              <span className="font-semibold">Employees:</span>{" "}
              {selectedCompany.name === 'PulseHR'
                ? (loadingEmployees ? 'Loading...' : pulseEmployees.length)
                : selectedCompany.employees}
              {selectedCompany.name === 'PulseHR' && (
                <span
                  className="ml-2 text-blue-700 underline cursor-pointer"
                  onClick={() => setShowPulseEmployees(true)}
                >
                  (View Employees)
                </span>
              )}
            </div>
            <div className="mb-4 text-lg">
              <span className="font-semibold">Email:</span> {selectedCompany.email}
            </div>
            {/* Graphs and Pie Chart */}
            {renderCharts(
              selectedCompany.name === 'PulseHR'
                ? pulseAnalytics
                : companyAnalytics[selectedCompany.name] || { completedTasks: 0, pendingTasks: 0 }
            )}
          </div>
        )}

        {activeSection === 'analytics' && selectedCompany && showPulseEmployees && (
          <div>
            <button
              className="mb-6 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
              onClick={() => setShowPulseEmployees(false)}
            >
              ← Back to Analytics
            </button>
            <h2 className="text-2xl font-semibold mb-4">PulseHR Employees</h2>
            {loadingEmployees ? (
              <div>Loading employees...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {pulseEmployees.length === 0 && (
                  <div className="col-span-full text-gray-500">No employees found.</div>
                )}
                {pulseEmployees.map((emp, idx) => (
                  <div key={idx} className="p-4 bg-white rounded shadow text-sm">
                    <div><span className="font-semibold">ID:</span> {emp.employeeId}</div>
                    <div><span className="font-semibold">Name:</span> {emp.name}</div>
                    <div><span className="font-semibold">Email:</span> {emp.email}</div>
                    <div><span className="font-semibold">Department:</span> {emp.department}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'company' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-blue-700">Company Details</h1>
            <div className="mb-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => setShowAddForm(true)}
              >
                + Add Company
              </button>
            </div>
            {showAddForm && (
              <form
                className="mb-6 p-4 bg-white rounded shadow flex flex-col gap-3 max-w-md"
                onSubmit={handleAddCompany}
              >
                <input
                  className="border p-2 rounded"
                  placeholder="Company Name"
                  value={newCompany.name}
                  onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                  required
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Password"
                  value={newCompany.password}
                  onChange={e => setNewCompany({ ...newCompany, password: e.target.value })}
                  required
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Email"
                  type="email"
                  value={newCompany.email}
                  onChange={e => setNewCompany({ ...newCompany, email: e.target.value })}
                  required
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Employees"
                  type="number"
                  min="1"
                  value={newCompany.employees}
                  onChange={e => setNewCompany({ ...newCompany, employees: e.target.value })}
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {companies.map((company, idx) => (
              <div
                key={idx}
                className="p-6 bg-white rounded-xl shadow hover:shadow-md transition cursor-pointer"
                onClick={handleCompanyClick}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-1">{company.name}</h2>
                <p className="text-gray-600">📧 {company.email}</p>
                <p className="text-gray-600">👥 Employees: {company.name === 'PulseHR' ? pulseEmployees.length : company.employees}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Sidebar item with active highlighting
const SidebarItem = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-5 py-3 text-sm font-medium transition ${
      active
        ? 'bg-blue-100 text-blue-700 font-semibold'
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    {icon}
    {label}
  </button>
);

// Analytics card (not used in this version, but kept for completeness)
const Card = ({ title, value }) => (
  <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition text-center">
    <div className="text-gray-500 text-sm mb-1">{title}</div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
  </div>
);