import dbConnect from '@/lib/dbConnect';
import Company from '@/models/Company';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ CREATE COMPANY - Only SuperAdmin
export async function POST(req) {
  try {
    await dbConnect();

    const token = cookies().get('token')?.value;
    if (!token) {
      return Response.json({ message: 'Unauthorized: No token' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'superadmin') {
      return Response.json({ message: 'Access denied: Not superadmin' }, { status: 403 });
    }

    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return Response.json({ message: 'All fields are required' }, { status: 400 });
    }

    const existing = await Company.findOne({ email });
    if (existing) {
      return Response.json({ message: 'Company email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const company = await Company.create({
      name,
      email,
      passwordHash,
      createdBy: decoded._id
    });

    return Response.json({ message: '✅ Company created', company }, { status: 201 });

  } catch (error) {
    console.error('🔥 Create Company Error:', error.message);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}

// ✅ DELETE COMPANY - Only SuperAdmin
export async function DELETE(req) {
  try {
    await dbConnect();

    const token = cookies().get('token')?.value;
    if (!token) {
      return Response.json({ message: 'Unauthorized: No token' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'superadmin') {
      return Response.json({ message: 'Access denied: Not superadmin' }, { status: 403 });
    }

    const { companyId } = await req.json();
    if (!companyId) {
      return Response.json({ message: 'companyId is required' }, { status: 400 });
    }

    const deleted = await Company.findByIdAndDelete(companyId);
    if (!deleted) {
      return Response.json({ message: 'Company not found' }, { status: 404 });
    }

    return Response.json({ message: '✅ Company deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('🔥 Delete Company Error:', error.message);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}
