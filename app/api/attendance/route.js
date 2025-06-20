import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/Attendance";

// POST /api/attendance
export async function POST(req) {
  await dbConnect();
  const body = await req.json();

  try {
    if (Array.isArray(body) && body.length > 0) {
      const { date, shift } = body[0];
      const employeeIds = body.map((entry) => entry.employeeId);

      // Remove only existing records for these employees on this date and shift
      await Attendance.deleteMany({
        date: {
          $gte: new Date(date),
          $lt: (() => {
            const d = new Date(date);
            d.setDate(d.getDate() + 1);
            return d;
          })(),
        },
        shift,
        employeeId: { $in: employeeIds },
      });

      // Insert new attendance records
      const newAttendances = await Attendance.insertMany(body, { ordered: false });

      return Response.json({ success: true, data: newAttendances });
    }

    // Fallback: save single record
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

// GET /api/attendance?date=YYYY-MM-DD&shift=ShiftName
export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const shift = searchParams.get("shift");

    let filter = {};
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }
    if (shift) {
      filter.shift = shift;
    }

    const records = await Attendance.find(filter);
    return Response.json({ success: true, data: records });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch attendance records", error: error.message },
      { status: 500 }
    );
  }
}