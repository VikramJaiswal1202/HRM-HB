// app/api/attendance/route.js
import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/Attendance";

// POST /api/attendance
export async function POST(req) {
  await dbConnect();
  const body = await req.json();

  try {
    let savedData;

    if (Array.isArray(body)) {
      // Handle multiple attendance records
      savedData = await Attendance.insertMany(body);
    } else {
      // Handle single attendance record
      const newAttendance = new Attendance(body);
      savedData = await newAttendance.save();
    }

    return Response.json({ success: true, data: savedData });
  } catch (error) {
    console.error("Error saving attendance:", error);
    return new Response("Failed to save attendance", { status: 500 });
  }
}

// GET /api/attendance
export async function GET() {
  await dbConnect();
  try {
    const records = await Attendance.find();
    return Response.json({ success: true, data: records });
  } catch (error) {
    return new Response("Failed to fetch attendance records", { status: 500 });
  }
}
