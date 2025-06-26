import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET); 
    console.log("Decoded JWT:", decoded);
    if (decoded.role !== "hr" && decoded.role !== "manager") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    const { userId, title, description } = await req.json();

    if (!userId || !title) {
      return Response.json({ message: "userId and title are required" }, { status: 400 });
    }

    // Check user
    const user = await User.findOne({ _id: userId, companyId: decoded.companyId, role: { $in: ["employee", "intern"] } });
    if (!user) {
      return Response.json({ message: "Invalid employee or employee not found" }, { status: 404 });
    }

    // Create the task
    const newTask = await Task.create({
      title,
      description,
      assignedTo: user._id,
      assignedBy: decoded._id,
      companyId: decoded.companyId,
      status: "pending",
    });

    return Response.json({ message: "✅ Task assigned successfully", task: newTask }, { status: 201 });
  } catch (error) {
    console.error("🔥 Assign Task Error:", error.message);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
