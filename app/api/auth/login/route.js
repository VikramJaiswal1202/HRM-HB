import dbConnect from "@/lib/dbConnect";
import SuperAdmin from "@/models/SuperAdmin";
import Company from "@/models/Company";
import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ message: "Email and password required" }, { status: 400 });
    }

    // Try to find in SuperAdmin
    let user = await SuperAdmin.findOne({ email });
    let role = "superadmin";

    // If not SuperAdmin, check Company
    if (!user) {
      user = await Company.findOne({ email });
      role = "company";
    }

    // If not Company, check User (HR, Manager, etc.)
    if (!user) {
      user = await User.findOne({ email });
      if (user) role = user.role;
    }

    if (!user) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email, role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return Response.json({ role }, { status: 200 });
  } catch (err) {
    console.error("🔥 Login Error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
