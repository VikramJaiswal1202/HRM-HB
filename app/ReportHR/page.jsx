"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AllUploads() {
  const router = useRouter();

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepageHR" },
    { label: "Employees", icon: "👥", route: "/employees" },
    { label: "Interns", icon: "🎓", route: "/interns" },
    { label: "View Attendance", icon: "🗓", route: "/viewattendanceHR" },
    { label: "View Reports", icon: "📊", route: "/ReportHR" },
  ];

  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReports, setFilteredReports] = useState([]);

  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        const res = await axios.get('/api/reports');
        if (res.data.success) {
          setReports(res.data.reports);
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchAllReports();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredReports(reports);
    } else {
      setFilteredReports(
        reports.filter(
          (r) =>
            r.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, reports]);

  const isImage = (path) => /\.(png|jpg|jpeg|gif|webp)$/i.test(path);

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
                onClick={() => {
                  if (item.route) router.push(item.route);
                }}
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
        <header className="bg-[#4267b2] shadow flex items-center px-8 h-16">
          <span className="text-white font-bold text-2xl tracking-wide">
            PulseHR <span className="text-[#f4f7fb]"></span>
          </span>
        </header>
        <main className="flex-1 p-8 flex flex-col items-center">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold text-[#0D1A33]">Employee Reports</h2>
              <input
                type="text"
                placeholder="Search by Employee ID, Name, or Notes"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full md:w-80 px-4 py-2 rounded-lg border border-[#e9eef6] bg-[#f4f7fb] text-[#0D1A33] focus:outline-[#4267b2]"
              />
            </div>
            {filteredReports.length === 0 ? (
              <div className="text-gray-400 text-center py-12">
                <svg className="mx-auto mb-4" width="64" height="64" fill="none" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="#64748b" strokeWidth="2"/>
                </svg>
                No uploads found.
              </div>
            ) : (
              <ul className="space-y-6">
                {filteredReports.map(r => (
                  <li
                    key={r._id}
                    className="rounded-xl border border-[#e9eef6] p-6 shadow hover:shadow-lg transition bg-[#f9fbfd]"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <div className="font-semibold text-[#4267b2] text-lg">
                          Employee ID: <span className="text-[#0D1A33]">{r.employeeId}</span>
                        </div>
                        <div className="text-sm text-[#64748b]">
                          Date: {new Date(r.date).toLocaleDateString()}
                        </div>
                        {r.notes && (
                          <div className="mt-2 text-[#0D1A33]">
                            <span className="font-semibold">Notes:</span> {r.notes}
                          </div>
                        )}
                      </div>
                      {r.imagePath && (
                        <div className="mt-4 md:mt-0">
                          {isImage(r.imagePath) ? (
                            <img
                              src={encodeURI(r.imagePath)}
                              alt="Uploaded"
                              className="max-w-[200px] rounded-lg border border-[#e9eef6] shadow"
                              style={{ display: "block", margin: "0 auto" }}
                            />
                          ) : (
                            <a
                              href={encodeURI(r.imagePath)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 bg-[#4267b2] text-white rounded-lg hover:bg-[#37599d] transition"
                            >
                              📄 Download File
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}