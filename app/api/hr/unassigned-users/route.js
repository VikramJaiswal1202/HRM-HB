import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET() {
  try {
    await dbConnect();

    const cookieStore = cookies(); // ✅ CORRECT
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "hr") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const users = await User.find({
      companyId: decoded.companyId,
      role: { $in: ["employee", "intern"] },
      managerId: null,
    }).select("_id name username");

    return NextResponse.json({ users });
  } catch (err) {
    console.error("🔥 GET /unassigned-users error:", err.message);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
