"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeReport() {
  const router = useRouter();

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepage" },
    { label: "Employees", icon: "👥" },
    { label: "Attendance and Timing", icon: "🗓️" },
    { label: "Reporting", icon: "⏱️", route: "/reporting" },
  ];

  const [employee, setEmployee] = useState("");
  const [date, setDate] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Fetch employees from backend
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data.employees || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleOpenCamera = async () => {
    setShowCamera(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        setImage(new File([blob], "captured-image.png", { type: "image/png" }));
        handleCloseCamera();
      }, "image/png");
    }
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f6f9fc]">
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
      <div className="flex-1 flex flex-col">
        <header className="bg-[#4267b2] shadow flex items-center px-8 h-16">
          <span className="text-white font-bold text-2xl tracking-wide">
            PulseHR
          </span>
        </header>
        <div className="w-full h-[2px] bg-[#e9eef6]" />
        <main className="flex-1 flex items-center justify-center py-10">
          <form
            className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-6"
            onSubmit={e => e.preventDefault()}
          >
            <h2 className="text-2xl font-bold text-[#0D1A33] flex items-center gap-2 mb-2">
              <span>
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="16" rx="2" fill="#4267b2" opacity="0.12"/>
                  <rect x="7" y="2" width="2" height="4" rx="1" fill="#4267b2"/>
                  <rect x="15" y="2" width="2" height="4" rx="1" fill="#4267b2"/>
                  <rect x="7" y="10" width="2" height="2" rx="1" fill="#4267b2"/>
                  <rect x="11" y="10" width="2" height="2" rx="1" fill="#4267b2"/>
                  <rect x="15" y="10" width="2" height="2" rx="1" fill="#4267b2"/>
                </svg>
              </span>
              Employee Reporting Update
            </h2>
            <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
              Choose Employee
              <select
                className="border border-[#e9eef6] rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-[#4267b2] bg-[#f4f7fb] text-[#0D1A33]"
                value={employee}
                onChange={e => setEmployee(e.target.value)}
                required
              >
                <option value="">Select employee</option>
                {loading ? (
                  <option disabled>Loading...</option>
                ) : (
                  employees.map(emp => (
                    <option key={emp.employeeId} value={emp.name}>
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))
                )}
              </select>
            </label>
            <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
              Date
              <input
                type="date"
                className="border border-[#e9eef6] rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-[#4267b2] bg-[#f4f7fb] text-[#0D1A33]"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
              Notes (optional)
              <textarea
                className="border border-[#e9eef6] rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-[#4267b2] bg-[#f4f7fb] text-[#0D1A33] resize-none"
                rows={4}
                placeholder="Write your update here..."
                value={text}
                onChange={e => setText(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 font-medium text-[#0D1A33]">
              Attach Image
              <div className="flex items-center gap-3 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <rect x="3" y="5" width="18" height="14" rx="2" fill="#4267b2" opacity="0.12"/>
                    <circle cx="8" cy="10" r="2" fill="#4267b2"/>
                    <path d="M21 19l-5.5-7-4.5 6-3-4-4 5" stroke="#4267b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[#4267b2] font-medium">Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setImage(e.target.files[0])}
                  />
                </label>
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-1 rounded-lg border border-[#4267b2] text-[#4267b2] font-medium hover:bg-[#f4f7fb] transition"
                  onClick={handleOpenCamera}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <rect x="3" y="7" width="18" height="12" rx="2" fill="#4267b2" opacity="0.12"/>
                    <circle cx="12" cy="13" r="3" fill="#4267b2"/>
                    <rect x="8" y="3" width="8" height="4" rx="2" fill="#4267b2"/>
                  </svg>
                  Camera
                </button>
                {image && (
                  <span className="text-xs text-[#0D1A33]">{image.name}</span>
                )}
              </div>
            </label>
            {showCamera && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4 shadow-lg relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    className="rounded-lg border border-[#e9eef6] w-64 h-48 object-cover"
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className="bg-[#4267b2] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                      onClick={handleCapture}
                    >
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="8" stroke="#fff" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" fill="#fff"/>
                      </svg>
                      Capture
                    </button>
                    <button
                      type="button"
                      className="bg-gray-200 text-[#0D1A33] px-4 py-2 rounded-lg font-bold"
                      onClick={handleCloseCamera}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            <button
              type="submit"
              className="mt-2 bg-[#4267b2] hover:bg-[#314d80] text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M22 2L11 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Submit
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}