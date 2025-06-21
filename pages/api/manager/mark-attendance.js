// pages/api/manager/mark-attendance.js
import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/Attendance";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method Not Allowed" });
  }

  const { employeeId, name, date, status, checkInTime, checkOutTime } = req.body;

  if (!employeeId || !date || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const record = new Attendance({
      employeeId,
      name,
      date,
      status,
      checkInTime,
      checkOutTime,
    });
    await record.save();
    res.json({ success: true, record });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
