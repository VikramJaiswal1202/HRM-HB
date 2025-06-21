import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task"; // Ensure you have this schema
import User from "@/models/User"; 

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { employeeId, managerId, title, description } = req.body;

    // Validate required fields
    if (!employeeId || !managerId || !title || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      // Check if Employee and Manager are valid users
      const employee = await User.findById(employeeId);
      const manager = await User.findById(managerId);

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      if (!manager) {
        return res.status(404).json({ error: "Manager not found" });
      }

      // Create the Task
      const task = await Task.create({
        employeeId,
        managerId,
        title,
        description,
        status: "assigned",
      });

      return res.status(201).json({ success: true, task });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error creating task" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
