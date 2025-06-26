// app/api/employee/tasks/[id]/complete/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request, { params }) {
  try {
    await dbConnect();

    // ✅ Get the task ID correctly
    const { id } = params;

    // ✅ Get cookie and verify
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!["employee", "intern"].includes(decoded.role)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // ✅ Parse the uploaded file
    const formData = await request.formData();
    const uploadedFile = formData.get("completionFile");

    if (!uploadedFile) {
      return NextResponse.json({ message: "File is required" }, { status: 400 });
    }

    // ✅ Save the uploaded file
    const fileName = `${Date.now()}-${uploadedFile.name}`;
    const buffer = Buffer.from(await uploadedFile.arrayBuffer());
    const savePath = path.join(process.cwd(), "public", "uploads", fileName);
    await fs.writeFile(savePath, buffer);

    const uploadedFileUrl = `/uploads/${fileName}`;

    // ✅ Find the task
    const task = await Task.findOne({ _id: id, assignedTo: decoded._id });
    if (!task) {
      return NextResponse.json({ message: "Task not found or not authorized" ,id:id,user:decoded._id }, { status: 501});
    }

    // ✅ Mark as completed
    task.status = "completed";
    task.completionFile = uploadedFileUrl;

    await task.save();

    return NextResponse.json({ message: "Task marked as completed successfully" }, { status: 200 });
  } catch (error) {
    console.error("🔥 POST /employee/tasks/[id]/complete error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
