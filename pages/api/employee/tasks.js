import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).send({ error: "Method Not Allowed" });
  }

  const { employeeId } = req.query;

  if (!employeeId) {
    return res.status(400).send({ error: "employeeId is required" });
  }

  try {
    const tasks = await Task.find({ assignedTo: employeeId }).sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

