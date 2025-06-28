
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

    let user = null;
    let role = null;
    let companyId = null;

    // Step 1: Check SuperAdmin
    user = await SuperAdmin.findOne({ email });
    if (user) {
      role = "superadmin";
      companyId = null;
    }

    // Step 2: Check Company
    if (!user) {
      user = await Company.findOne({ email });
      if (user) {
        role = "company";
        companyId = user._id.toString(); // company is its own companyId
      }
    }

    // Step 3: Check User (HR, Manager, Employee, Intern)
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        role = user.role;
        companyId = user.companyId?.toString(); // ✅ Always set this
      }
    }

    if (!user) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Step 4: Build JWT Payload
    const tokenPayload = {
      _id: user._id,
      email: user.email,
      role,
    };

    if (companyId) {
      tokenPayload.companyId = companyId;
    }

    console.log("✅ JWT Payload:", tokenPayload);

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return Response.json({
      message: "Login successful",
      role,
      companyId: companyId || null
    }, { status: 200 });

  } catch (err) {
    console.error("🔥 Login Error:", err.message);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
