import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/Attendance";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).send({ error: "Method Not Allowed" });
  }

  const records = await Attendance.find().sort({ date: -1 });
  res.json({ success: true, records });
}
