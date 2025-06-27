"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, Settings, ChevronRight } from "lucide-react";

export default function HomepageC() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");

  const [managers, setManagers] = useState([]);
  const [hrs, setHrs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepageC" },
    { label: "Manager", icon: "👥", route: "/addM" },
    { label: "HR", icon: "👥", route: "/addHR" },
    { label: "Employees", icon: "🎓", route: "/employeesC" },
  ];

  // Fetch all users: managers, HRs, employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch Managers
        const managersRes = await fetch("/api/hr/users?role=manager");
        const managersData = await managersRes.json();
        if (managersRes.ok) setManagers(managersData.users || []);

        // Fetch HRs
        const hrsRes = await fetch("/api/hr/users?role=hr");
        const hrsData = await hrsRes.json();
        if (hrsRes.ok) setHrs(hrsData.users || []);

        // Fetch Employees/Interns
        if (companyId) {
          const empRes = await fetch(`/api/hr/users?companyId=${companyId}`);
          const empData = await empRes.json();
          if (empRes.ok) setEmployees(empData.users || []);
        }
      } catch (error) {
        console.error("❌ Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

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
                <path
                  d="M16 17L21 12L16 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
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

        <main className="flex-1 p-8">
          {/* HR / Manager Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <InfoCard
              title="Managers"
              count={loading ? "--" : managers.length}
              icon={<Settings className="h-6 w-6 text-blue-600" />}
              bg="bg-blue-100"
            />
            <InfoCard
              title="HR Personnel"
              count={loading ? "--" : hrs.length}
              icon={<Users className="h-6 w-6 text-purple-600" />}
              bg="bg-purple-100"
            />
          </div>

          {/* Employee Table */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Employees & Interns
            </h2>

            {loading ? (
              <div className="text-center p-6">
                <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 mx-auto rounded-full" />
              </div>
            ) : employees.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No employees or interns found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Employee ID</th>
                      <th className="py-2 px-4 border-b">Designation</th>
                    </tr>
                  </thead>
                  <tbody className="text-black">
                    {employees.map((emp) => (
                      <tr key={emp._id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{emp.name}</td>
                        <td className="py-2 px-4 border-b">{emp._id}</td>{" "}
                        {/* Show Mongo Object ID */}
                        <td className="py-2 px-4 border-b capitalize">
                          {emp.role}
                        </td>{" "}
                        {/* Show role like 'employee' */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoCard({ title, count, icon, bg }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{count}</p>
        </div>
        <div className={`p-3 rounded-full ${bg}`}>{icon}</div>
      </div>
    </div>
  );
}
