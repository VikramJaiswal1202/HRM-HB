import dbConnect from '@/lib/dbConnect';
import Company from '@/models/Company';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET() {
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

    const companies = await Company.find().select('-passwordHash');

    return Response.json({ companies }, { status: 200 });

  } catch (error) {
    console.error('🔥 Fetch Companies Error:', error.message);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}