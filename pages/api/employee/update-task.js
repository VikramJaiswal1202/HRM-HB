import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";
import formidable from "formidable";
import fs from "fs";
import path from "path";

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

  const form = formidable({ multiples: false }); // We expect only one file
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).send({ error: "Error parsing form" });
    }

    console.log("\n✅ DEBUG FORM:", {
      fields,
      files,
    }); // <-- DEBUG

    const taskId = fields.taskId?.[0] || fields.taskId;
    const status = fields.status?.[0] || fields.status;

    if (!taskId || !status) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    try {
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).send({ error: "Task not found" });
      }

      // If status is 'completed', process the uploaded file
      if (status === "completed") {
        if (!files?.file) {
          return res.status(400).send({ error: "Missing uploaded file" }); 
        }

        const uploadedFile = Array.isArray(files.file) 
          ? files.file[0] 
          : files.file;

        if (!uploadedFile) {
          return res.status(400).send({ error: "Invalid uploaded file" }); 
        }

        const filename = uploadedFile.originalFilename || uploadedFile.newFilename;

        if (!filename) {
          return res.status(400).send({ error: "Invalid uploaded file" }); 
        }

        // Destination path
        const finalPath = path.join(process.cwd(), "public", "uploads", filename);

        // Move the uploaded file
        fs.renameSync(uploadedFile.filepath, finalPath);

        // Save path in the task
        task.imagePath = `/uploads/${filename}`;
      }

      // Update status
      task.status = status;

      await task.save();

      res.json({ success: true, task });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });
}
