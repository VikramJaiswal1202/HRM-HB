import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method Not Allowed" });
  }

  const { employeeId, managerId, title, description } = req.body;

  if (!employeeId || !managerId || !title || !description) {
    return res.status(400).send({ error: "Missing required fields" });
  }

  const task = new Task({ employeeId, managerId, title, description });
  await task.save();

  res.json({ success: true, task });
}
