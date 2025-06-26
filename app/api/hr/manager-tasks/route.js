import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  try {
    await dbConnect();

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "manager") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");

    if (!managerId) {
      return NextResponse.json({ message: "managerId is required" }, { status: 400 });
    }

    const tasks = await Task.find({ assignedBy: managerId })
      .sort({ createdAt: -1 })
      .populate("assignedTo", "name username"); // Get Employee Name
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error("🔥 GET /manager-tasks error:", error.message);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
