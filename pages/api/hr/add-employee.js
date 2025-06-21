// pages/api/hr/add-employee.js
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== "POST") return res.status(405).send({ error: "Method Not Allowed" });
  
  const { name, email, passwordHash, role, companyId, createdBy } = req.body;

  if (!["employee", "intern"].includes(role))
    return res.status(400).send({ error: "Invalid role for employee" });
  
  const user = new User({ name, email, passwordHash, role, companyId, createdBy });
  await user.save();
  res.json({ success: true, user });
}
