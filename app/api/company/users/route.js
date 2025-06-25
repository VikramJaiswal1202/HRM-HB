import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Company from '@/models/Company';
import SuperAdmin from '@/models/SuperAdmin';
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

    // ✅ Global uniqueness check for email
    const [existingUser, existingCompany, existingSuperAdmin] = await Promise.all([
      User.findOne({ $or: [{ email }, { username }] }),
      Company.findOne({ email }),
      SuperAdmin.findOne({ email })
    ]);

    if (existingUser || existingCompany || existingSuperAdmin) {
      if (existingUser?.email === email || existingCompany || existingSuperAdmin) {
        return Response.json({ message: 'Email already in use' }, { status: 409 });
      }
      if (existingUser?.username === username) {
        return Response.json({ message: 'Username already in use' }, { status: 409 });
      }
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
    if (decoded.role !== 'company' && decoded.role !== 'hr') {
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
    const requesterRole = decoded.role;
    const requesterCompanyId = decoded.companyId;

    const { userId } = await req.json();
    if (!userId) {
      return Response.json({ message: 'userId is required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    // Ensure both users belong to the same company
    if (user.companyId.toString() !== requesterCompanyId) {
      return Response.json({ message: 'Access denied: Not same company' }, { status: 403 });
    }

    // Role-based deletion rules
    if (requesterRole === 'hr') {
      // HR can delete only employee/intern
      if (!['employee', 'intern'].includes(user.role)) {
        return Response.json({ message: 'HR can only delete employees or interns' }, { status: 403 });
      }
    } else if (requesterRole === 'company') {
      // Company can delete anyone except another company
      if (user.role === 'company') {
        return Response.json({ message: 'Cannot delete another company user' }, { status: 403 });
      }
    } else {
      return Response.json({ message: 'Access denied' }, { status: 403 });
    }

    await User.findByIdAndDelete(userId);

    return Response.json({ message: '✅ User deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('🔥 Delete User Error:', error.message);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}