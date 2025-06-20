'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, BarChart, Building } from 'lucide-react';

export default function SuperAdminPage() {
  const [activeSection, setActiveSection] = useState('analytics');
  const router = useRouter();

  const mockCompanies = [
    { name: 'Acme Inc.', email: 'admin@acme.com', employees: 120 },
    { name: 'Globex Corp.', email: 'info@globex.com', employees: 80 },
    { name: 'PulseHR', email: 'contact@pulsehr.com', employees: 200 },
  ];

  const analyticsData = {
    totalTasks: 1200,
    completedTasks: 1000,
    pendingTasks: 200,
    avgSpeed: '2.5h/task',
    activeUsers: 38,
    performanceScore: '87%',
  };

  // Logout handler
  const handleLogout = () => {
    router.push('/login');
  };

  // Handle company card click
  const handleCompanyClick = () => {
    router.push('/homepage');
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
              onClick={() => setActiveSection('analytics')}
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
        {activeSection === 'analytics' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-semibold text-blue-700">Company Analytics</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card title="Completed Tasks" value={analyticsData.completedTasks} />
              <Card title="Pending Tasks" value={analyticsData.pendingTasks} />
              <Card title="Avg Task Speed" value={analyticsData.avgSpeed} />
              <Card title="Active Users" value={analyticsData.activeUsers} />
              <Card title="Performance Score" value={analyticsData.performanceScore} />
              <Card title="Total Tasks" value={analyticsData.totalTasks} />
            </div>
          </div>
        )}

        {activeSection === 'company' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-blue-700">Company Details</h1>
            {mockCompanies.map((company, idx) => (
              <div
                key={idx}
                className="p-6 bg-white rounded-xl shadow hover:shadow-md transition cursor-pointer"
                onClick={handleCompanyClick}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-1">{company.name}</h2>
                <p className="text-gray-600">📧 {company.email}</p>
                <p className="text-gray-600">👥 Employees: {company.employees}</p>
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

// Analytics card
const Card = ({ title, value }) => (
  <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition text-center">
    <div className="text-gray-500 text-sm mb-1">{title}</div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
  </div>
);