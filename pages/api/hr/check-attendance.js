// pages/api/hr/check-attendance.js
import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed" });
  
  const { employeeId } = req.query;

  const reports = await Report.find(employeeId ? { employeeId } : {}).sort({ createdAt: -1 });
  res.json({ success: true, reports });
}
