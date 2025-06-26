import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Company from "@/models/Company";
import SuperAdmin from "@/models/SuperAdmin";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    await dbConnect();

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "company") {
      return Response.json({ message: "Access denied: Only company can create users" }, { status: 403 });
    }

    const { name, email, username, password, role } = await req.json();

    if (!name || !email || !username || !password || !role) {
      return Response.json({ message: "All fields are required" }, { status: 400 });
    }

    if (!["hr", "manager"].includes(role)) {
      return Response.json({ message: "Invalid role. Must be hr or manager" }, { status: 400 });
    }

    const [existingUser, existingCompany, existingSuperAdmin] = await Promise.all([
      User.findOne({ $or: [{ email }, { username }] }),
      Company.findOne({ email }),
      SuperAdmin.findOne({ email }),
    ]);

    if (existingUser?.email === email || existingCompany || existingSuperAdmin) {
      return Response.json({ message: "Email already in use" }, { status: 409 });
    }
    if (existingUser?.username === username) {
      return Response.json({ message: "Username already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      username,
      passwordHash,
      role,
      companyId: decoded.companyId,
      createdBy: decoded._id,
    });

    return Response.json({ message: `✅ ${role} created successfully`, user }, { status: 201 });
  } catch (error) {
    console.error("🔥 Create HR/Manager Error:", error.message);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

// =========================
// GET: Fetch Users
// =========================
export async function GET(req) {
  try {
    await dbConnect();

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized: No token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");

    if (decoded.role === "company") {
      const roles = roleFilter ? [roleFilter] : ["hr", "manager"];
      const users = await User.find({
        companyId: decoded.companyId,
        role: { $in: roles },
      }).select("-passwordHash");

      return Response.json({ users }, { status: 200 });
    } else if (decoded.role === "hr" || decoded.role === "manager") {
      if (roleFilter && roleFilter === "manager") {
        // ✅ Allow HR to fetch only managers when role=manager
        const users = await User.find({
          companyId: decoded.companyId,
          role: "manager",
        }).select("-passwordHash");
        return Response.json({ users }, { status: 200 });
      } else {
        // ✅ Default HR fetch is employees/intern
        const users = await User.find({
          companyId: decoded.companyId,
          role: { $in: ["employee", "intern"] },
        }).select("-passwordHash");
        return Response.json({ users }, { status: 200 });
      }
    } else {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }
  } catch (error) {
    console.error("🔥 Fetch Users Error:", error.message);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

// =========================
// DELETE: Remove Employee/Intern
// =========================
export async function DELETE(req) {
  try {
    await dbConnect();

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized: No token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const requesterRole = decoded.role;
    const requesterCompanyId = decoded.companyId;

    const { userId } = await req.json();
    if (!userId) {
      return Response.json({ message: "userId is required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    if (user.companyId.toString() !== requesterCompanyId) {
      return Response.json({ message: "Access denied: Not same company" }, { status: 403 });
    }

    if (requesterRole === "hr") {
      if (!["employee", "intern"].includes(user.role)) {
        return Response.json({ message: "HR can only delete employees or interns" }, { status: 403 });
      }
    } else if (requesterRole === "company") {
      if (user.role === "company") {
        return Response.json({ message: "Cannot delete another company user" }, { status: 403 });
      }
    } else {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    await User.findByIdAndDelete(userId);

    return Response.json({ message: "✅ User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("🔥 Delete User Error:", error.message);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
