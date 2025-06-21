// pages/api/manager/reports.js
import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";
import User from "@/models/User";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== "GET") return res.status(405).send({ error: "Method Not Allowed" });
  
  const { managerId } = req.query;

  // Get all employees assigned to this manager
  const employees = await User.find({ managerId }, "_id");
  const employeeIds = employees.map(emp => emp._id);

  const reports = await Report.find({ employeeId: { $in: employeeIds } });
  res.json({ success: true, reports });
}
