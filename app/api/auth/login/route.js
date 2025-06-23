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

    // Try to find in SuperAdmin
    user = await SuperAdmin.findOne({ email });
    if (user) {
      role = "superadmin";
      // SuperAdmin doesn't have companyId
      companyId = null;
    }

    // If not SuperAdmin, check Company
    if (!user) {
      user = await Company.findOne({ email });
      if (user) {
        role = "company";
        // For Company users, the companyId is their own _id
        companyId = user._id.toString();
      }
    }

    // If not Company, check User (HR, Manager, Employee, Intern)
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        role = user.role;
        
        // Only HR and Manager have companyId, others don't
        if (role === 'hr' || role === 'manager') {
          companyId = user.companyId?.toString();
        } else {
          // Employee, Intern, etc. don't have companyId
          companyId = null;
        }
      }
    }

    if (!user) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Create JWT payload
    const tokenPayload = {
      _id: user._id,
      email: user.email,
      role
    };

    // Add companyId to token if it exists
    if (companyId) {
      tokenPayload.companyId = companyId;
    }

    console.log('Creating JWT with payload:', tokenPayload); // Debug log

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

    // ✅ Fixed: Await cookies() before using it
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return Response.json({ 
      role,
      companyId: companyId || null // Include companyId in response for debugging
    }, { status: 200 });

  } catch (err) {
    console.error("🔥 Login Error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}