// pages/api/hr/remove-employee.js
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== "DELETE") return res.status(405).send({ error: "Method Not Allowed" });
  
  const { employeeId } = req.query;

  const employee = await User.findByIdAndDelete(employeeId);
  if (!employee) return res.status(404).send({ error: "Employee not found" });
  
  res.json({ success: true, deletedId: employeeId });
}
