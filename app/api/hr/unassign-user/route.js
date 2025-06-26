import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function PATCH(req) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Allow both HR and Manager roles
    if (!["hr", "manager"].includes(decoded.role)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "userId is required" }, { status: 400 });
    }

    // ✅ Find employee and unset managerId
    const result = await User.findOneAndUpdate(
      {
        _id: userId,
        companyId: decoded.companyId,
        role: { $in: ["employee", "intern"] },
      },
      { managerId: null },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ message: "User not found or not eligible" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Employee unassigned from manager successfully",
      user: {
        _id: result._id,
        name: result.name,
        managerId: result.managerId,
      },
    });
  } catch (err) {
    console.error("🔥 PATCH /unassign-employee error:", err.message);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
