"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Settings, ChevronRight } from 'lucide-react';

const HomepageC = () => {
  const router = useRouter();
  const [managers, setManagers] = useState([]);
  const [hrs, setHrs] = useState([]);
  const [loading, setLoading] = useState(true);

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepageC" },
    { label: "Manager", icon: "👥", route: "/addM" },
    { label: "HR", icon: "👥", route: "/addHR" },
    { label: "empolyees", icon: "🎓", route: "/employeesC" },
  ];

  // Fetch both managers and HRs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch managers
        const managersRes = await fetch("/api/company/users?role=manager");
        const managersData = await managersRes.json();
        
        // Fetch HRs
        const hrsRes = await fetch("/api/company/users?role=hr");
        const hrsData = await hrsRes.json();

        if (managersRes.ok) setManagers(managersData.users || []);
        if (hrsRes.ok) setHrs(hrsData.users || []);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

        {/* Page Content */}
        <main className="flex-1 p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Managers</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {loading ? '--' : managers.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">HR Personnel</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {loading ? '--' : hrs.length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Managers */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Managers
              </h2>
              <button 
                onClick={() => router.push("/addM")}
                className="text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                See More <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : managers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No managers found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {managers.slice(0, 3).map((manager) => (
                  <div key={manager._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Settings className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {manager.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {manager.email}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent HRs */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                HR Personnel
              </h2>
              <button 
                onClick={() => router.push("/addHR")}
                className="text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                See More <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : hrs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No HR personnel found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {hrs.slice(0, 3).map((hr) => (
                  <div key={hr._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {hr.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {hr.email}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomepageC;