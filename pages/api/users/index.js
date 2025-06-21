import dbConnect from "@/lib/dbConnect"; 
import User from "@/models/User"; 
import Company from "@/models/Company"; 
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { name, email, password, role, companyId, managerId, createdBy } = req.body;

    if (!name || !email || !password || !role || !companyId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const validRoles = ["hr", "manager", "employee", "intern"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      passwordHash,
      role,
      companyId,
      managerId: managerId || null,
      createdBy: createdBy || null,
    });

    try {
      await user.save();
      res.status(201).json({ success: true, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating user" });
    }
  } else if (req.method === "GET") {
    try {
      const users = await User.find();
      res.json({ success: true, users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching users" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
