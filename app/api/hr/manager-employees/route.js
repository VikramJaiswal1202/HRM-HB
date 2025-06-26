import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
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
    if (decoded.role !== "manager" && decoded.role !== "hr") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");
    if (!managerId) {
      return NextResponse.json({ message: "managerId is required" }, { status: 400 });
    }

    const users = await User.find({
      companyId: decoded.companyId,
      role: { $in: ["employee", "intern"] },
      managerId,
    }).select("_id name username");

    return NextResponse.json({ users });
  } catch (err) {
    console.error("🔥 GET /manager-employees error:", err.message);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}


export async function PATCH(req) {
  try {
    await dbConnect();

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "hr") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { userIds } = await req.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ message: "No users selected" }, { status: 400 });
    }

    const result = await User.updateMany(
      {
        _id: { $in: userIds },
        companyId: decoded.companyId,
        role: { $in: ["employee", "intern"] },
      },
      { managerId: null }
    );

    return NextResponse.json({
      message: "Users unassigned from manager successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("🔥 PATCH /manager-employees error:", err.message);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
