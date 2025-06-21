// pages/api/employee/mark-task.js
import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method Not Allowed" });
  }

  const { taskId, status } = req.body;

  if (!taskId || !status) {
    return res.status(400).send({ error: "Missing required fields" });
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).send({ error: "Task not found" });
    }

    task.status = status;
    await task.save();

    res.json({ success: true, task });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}
