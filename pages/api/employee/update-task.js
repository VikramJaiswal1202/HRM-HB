import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";
import formidable from "formidable";
import path from "path";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method Not Allowed" });
  }

  const form = formidable({ multiples: false, keepExtensions: true });
  form.uploadDir = path.join(process.cwd(), "public", "uploads");

  if (!fs.existsSync(form.uploadDir)) {
    fs.mkdirSync(form.uploadDir, { recursive: true });
  }

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).send({ error: "Error parsing form data" });
    }

    const taskId = fields.taskId?.[0];
    const status = fields.status?.[0];
    const uploadedFile = files.file?.[0];
    let imagePath = null;

    if (!taskId || !status) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    if (status === "completed" && uploadedFile) {
      const newPath = path.join(form.uploadDir, uploadedFile.newFilename);
      imagePath = `/uploads/${uploadedFile.newFilename}`;
    }

    try {
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).send({ error: "Task not found" });
      }

      task.status = status;

      if (imagePath) {
        task.imagePath = imagePath;
      }

      await task.save();

      res.json({ success: true, task });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });
}
