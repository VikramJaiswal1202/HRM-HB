// pages/api/hr/assign-employee.js
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed" });
  
  const { employeeId, managerId } = req.body;

  const employee = await User.findById(employeeId);
  if (!employee) return res.status(404).send({ error: "Employee not found" });
  
  employee.managerId = managerId;
  await employee.save();

  res.json({ success: true, employee });
}
