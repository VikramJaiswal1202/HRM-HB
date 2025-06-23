import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

// POST  Create HR or Manager
export async function POST(req) {
  try {
    await dbConnect();

    const token = cookies().get('token')?.value;
    if (!token) return Response.json({ message: 'Unauthorized: No token' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'company') {
      return Response.json({ message: 'Access denied: Only company can create users' }, { status: 403 });
    }

    const { name, email, password, role } = await req.json();
    if (!name || !email || !password || !role) {
      return Response.json({ message: 'All fields are required' }, { status: 400 });
    }

    if (!['hr', 'manager'].includes(role)) {
      return Response.json({ message: 'Invalid role. Must be hr or manager' }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return Response.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      companyId: decoded._id,
    });

    return Response.json({ message: `✅ ${role} created successfully`, user }, { status: 201 });

  } catch (error) {
    console.error('🔥 Create HR/Manager Error:', error.message);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

// DELETE  Delete Employee or Intern
export async function DELETE(req) {
  try {
    await dbConnect();

    const token = cookies().get('token')?.value;
    if (!token) return Response.json({ message: 'Unauthorized: No token' }, { status: 401 });

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

    // Check same company
    if (
      user.companyId.toString() !== decoded.companyId &&
      decoded.role !== 'company'
    ) {
      return Response.json({ message: 'Access denied: Not same company' }, { status: 403 });
    }

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

// GET  Fetch HRs and Managers
export async function GET() {
  try {
    await dbConnect();

    const token = cookies().get('token')?.value;
    if (!token) {
      return Response.json({ message: 'Unauthorized: No token' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'company') {
      return Response.json({ message: 'Access denied: Only company can view HRs and Managers' }, { status: 403 });
    }

    const users = await User.find({
      companyId: decoded._id,
      role: { $in: ['hr', 'manager'] }
    }).select('-passwordHash');

    return Response.json({ users }, { status: 200 });

  } catch (error) {
    console.error('🔥 Fetch HR/Manager Error:', error.message);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}