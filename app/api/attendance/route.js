import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/Attendance";

// POST /api/attendance
export async function POST(req) {
  await dbConnect();
  const body = await req.json();

  try {
    // If body is an array, insert many
    if (Array.isArray(body)) {
      const newAttendances = await Attendance.insertMany(body);
      return Response.json({ success: true, data: newAttendances });
    }
    // If body is a single object, insert one
    const newAttendance = new Attendance(body);
    await newAttendance.save();
    return Response.json({ success: true, data: newAttendance });
  } catch (error) {
    console.error("Error saving attendance:", error);
    return Response.json(
      { success: false, message: "Failed to save attendance", error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/attendance
export async function GET() {
  await dbConnect();
  try {
    const records = await Attendance.find();
    return Response.json({ success: true, data: records });
  } catch (error) {
    return Response.json({ success: false, message: "Failed to fetch attendance records" }, { status: 500 });
  }
}
