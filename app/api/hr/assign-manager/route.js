import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function PATCH(req) {
  try {
    await dbConnect();

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized: No token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "hr") {
      return NextResponse.json({ message: "Access denied: HR only" }, { status: 403 });
    }

    const { managerId, userIds, action } = await req.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ message: "No users selected" }, { status: 400 });
    }

    const filter = {
      _id: { $in: userIds },
      companyId: decoded.companyId,
      role: { $in: ["employee", "intern"] },
    };

    const update = action === "assign" ? { managerId } : { managerId: null };

    const result = await User.updateMany(filter, update);

    return NextResponse.json({
      message: `Users ${action === "assign" ? "assigned" : "unassigned"} successfully`,
      modifiedCount: result.modifiedCount,
    });

  } catch (err) {
    console.error("🔥 PATCH /assign-manager error:", err.message);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET() {
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

    const managers = await User.find({
      companyId: decoded.companyId,
      role: "manager",
    }).select("_id name username");

    return NextResponse.json({ managers });
  } catch (err) {
    console.error("🔥 GET /assign-manager error:", err.message);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}