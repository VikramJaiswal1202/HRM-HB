import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  try {
    await dbConnect();

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized: No token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Ensure only employees/interns can access
    if (!["employee", "intern"].includes(decoded.role)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // ✅ IMPORTANT: Use `decoded._id` instead of `userId`
    const tasks = await Task.find({ assignedTo: decoded._id })  
      .sort({ createdAt: -1 })
      .populate("assignedBy", "name username");

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error("🔥 GET /employee/tasks error:", error.message);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}