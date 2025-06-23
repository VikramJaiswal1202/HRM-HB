import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

// =========================
// POST: Create HR or Manager
// =========================
export async function POST(req) {
  try {
    await dbConnect();

    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return Response.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'company') {
      return Response.json({ message: 'Access denied: Only company can create users' }, { status: 403 });
    }

    const { name, email, username, password, role } = await req.json();

    // Required field validation
    if (!name || !email || !password || !role || !username) {
      return Response.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Role must be hr or manager
    if (!['hr', 'manager'].includes(role)) {
      return Response.json({ message: 'Invalid role. Must be hr or manager' }, { status: 400 });
    }

    // Check for duplicate email or username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const conflictField = existingUser.email === email ? 'Email' : 'Username';
      return Response.json({ message: `${conflictField} already in use` }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      username,
      passwordHash,
      role,
      companyId: decoded.companyId,
      createdBy: decoded._id
    });

    return Response.json({ message: `✅ ${role} created successfully`, user }, { status: 201 });

  } catch (error) {
    console.error('🔥 Create HR/Manager Error:', error.message);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

// =========================
// GET: Fetch HRs or Managers
// =========================
export async function GET(req) {
  try {
    await dbConnect();

    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return Response.json({ message: 'Unauthorized: No token' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'company') {
      return Response.json({ message: 'Access denied: Only company can view HRs and Managers' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get('role');
    const roles = roleFilter ? [roleFilter] : ['hr', 'manager'];

    const users = await User.find({
      companyId: decoded.companyId,
      role: { $in: roles }
    }).select('-passwordHash');

    return Response.json({ users }, { status: 200 });

  } catch (error) {
    console.error('🔥 Fetch HR/Manager Error:', error.message);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

// =========================
// DELETE: Remove Employee/Intern
// =========================
export async function DELETE(req) {
  try {
    await dbConnect();

    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return Response.json({ message: 'Unauthorized: No token' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const allowedRoles = ['company', 'hr'];

    if (!allowedRoles.includes(decoded.role)) {
      return Response.json({ message: 'Access denied: Only HR or company can delete users' }, { status: 403 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return Response.json({ message: 'userId is required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    // Check company match
    if (user.companyId.toString() !== decoded.companyId) {
      return Response.json({ message: 'Access denied: Not same company' }, { status: 403 });
    }

    // Only delete employee or intern
    if (!['employee', 'intern'].includes(user.role)) {
      return Response.json({ message: 'You can only delete employees or interns' }, { status: 400 });
    }

    await User.findByIdAndDelete(userId);

    return Response.json({ message: '✅ Employee/Intern deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('🔥 Delete User Error:', error.message);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}
