import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";
import { getSession } from "next-auth/react"; // IMPORTANT
import User from "@/models/User"; // Might be needed for role verification

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method Not Allowed" });
  }

  // ✅ Get Session
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).send({ error: "Not Authenticated" }); // Not logged in
  }

  // ✅ Ensure this user is a manager
  const manager = await User.findById(session.user.id);
  if (!manager || manager.role !== "manager") {
    return res.status(403).send({ error: "Forbidden. Not a manager." });
  }

  const { employeeId, title, description } = req.body;

  if (!employeeId || !title || !description) {
    return res.status(400).send({ error: "Missing required fields" });
  }

  // ✅ Create the task
  const task = new Task({
    employeeId,
    managerId: manager._id,
    title,
    description,
  });
  await task.save();

  res.json({ success: true, task });
}
