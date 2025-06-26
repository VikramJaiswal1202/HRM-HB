'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

const TaskAssignPage = () => {
  const router = useRouter();
  const [tasks] = useState([
    {
      id: 1,
      title: "Complete project documentation",
      assignedDate: "2023-06-15",
      deadline: "2023-06-20",
      status: "Pending"
    },
    {
      id: 2,
      title: "Fix login page bug",
      assignedDate: "2023-06-10",
      deadline: "2023-06-12",
      status: "Completed"
    }
  ]);

  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionPhoto, setSubmissionPhoto] = useState(null);

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepageE" },
    { label: "View Attendance", icon: "📅", route: "/viewattendanceE" },
    { label: "Task Assign", icon: "📝", route: "/taskAssignE" },
    { label: "Reporting", icon: "📊", route: "/reportingE" },
  ];

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSubmissionPhoto(URL.createObjectURL(file));
    }
  };

  const handleTakePhoto = () => {
    alert("Camera functionality would be implemented here");
  };

  const handleSubmitTask = (e) => {
    e.preventDefault();
    alert(`Task submitted with text: ${submissionText} and ${submissionPhoto ? "photo" : "no photo"}`);
    setShowSubmissionForm(false);
    setSubmissionText("");
    setSubmissionPhoto(null);
  };

  return (
    <div className="min-h-screen flex bg-[#f6f9fc]">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-20 bg-[#0D1A33] text-white flex flex-col items-center py-6 justify-between z-40">
        <div className="w-full">
          <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-[#0D1A33] font-bold text-xl mb-8 shadow mx-auto">
            E
          </div>
          <nav className="flex flex-col gap-3 w-full items-center">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                className={`flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors ${
                  item.label === "Task Assign" ? "bg-[#1a2b4c]" : ""
                }`}
                onClick={() => router.push(item.route)}
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
        >
          <span className="text-2xl">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="text-[11px]">Logout</span>
        </button>
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

        {/* Task Content */}
        <main className={`flex-1 flex flex-col items-center w-full py-8 px-4 ${showSubmissionForm ? 'filter blur-sm' : ''}`}>
          <div className="w-full max-w-4xl">
            <h1 className="text-2xl font-bold text-[#0D1A33] mb-6">Your Tasks</h1>
            
            {/* Tasks Table */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <table className="min-w-full border border-[#e9eef6] rounded-lg">
                <thead>
                  <tr className="bg-[#f4f7fb] text-[#0D1A33]">
                    <th className="py-3 px-6 border-b text-left">Task</th>
                    <th className="py-3 px-6 border-b text-left">Assigned Date</th>
                    <th className="py-3 px-6 border-b text-left">Deadline</th>
                    <th className="py-3 px-6 border-b text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id} className="text-[#0D1A33] text-base hover:bg-[#e9eef6] transition">
                      <td className="py-3 px-6 border-b">{task.title}</td>
                      <td className="py-3 px-6 border-b">{task.assignedDate}</td>
                      <td className="py-3 px-6 border-b">{task.deadline}</td>
                      <td className="py-3 px-6 border-b">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === "Completed" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submission Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowSubmissionForm(true)}
                className="bg-[#4267b2] hover:bg-[#314d80] text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Your Submission
              </button>
            </div>
          </div>
        </main>

        {/* Submission Form Overlay - White Background */}
        {showSubmissionForm && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowSubmissionForm(false)}
            ></div>
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative z-10 mx-4">
              <h2 className="text-xl font-bold text-[#0D1A33] mb-4">Task Submission</h2>
              
              <form onSubmit={handleSubmitTask}>
                <div className="mb-4">
                  <label className="block font-medium text-[#0D1A33] mb-2">Description</label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    className="w-full border border-[#e9eef6] rounded-lg px-3 py-2 bg-white"
                    rows="4"
                    placeholder="Describe your task completion..."
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block font-medium text-[#0D1A33] mb-2">Add Photo</label>
                  <div className="flex gap-3">
                    <label className="flex-1 bg-[#f4f7fb] border border-[#e9eef6] rounded-lg px-4 py-3 text-center cursor-pointer hover:bg-[#e9eef6]">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      From Gallery
                    </label>
                    <button
                      type="button"
                      onClick={handleTakePhoto}
                      className="flex-1 bg-[#f4f7fb] border border-[#e9eef6] rounded-lg px-4 py-3 hover:bg-[#e9eef6]"
                    >
                      Take Photo
                    </button>
                  </div>
                  {submissionPhoto && (
                    <div className="mt-3">
                      <img 
                        src={submissionPhoto} 
                        alt="Submission preview" 
                        className="h-24 rounded-lg object-cover border border-[#e9eef6]"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSubmissionForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#4267b2] hover:bg-[#314d80] text-white font-bold rounded-lg"
                  >
                    Submit Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskAssignPage;