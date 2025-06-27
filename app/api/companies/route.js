import dbConnect from '@/lib/dbConnect';
import Company from '@/models/Company';
import User from '@/models/User';
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

    // Get all companies
    const companies = await Company.find().select('-passwordHash');

    // For each company, count users by role
    const companiesWithRoles = await Promise.all(
      companies.map(async (company) => {
        const companyId = company._id;

        const roleCounts = await User.aggregate([
          { $match: { companyId } },
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 }
            }
          }
        ]);

        const roles = {
          hr: 0,
          manager: 0,
          user: 0
        };

        roleCounts.forEach((rc) => {
          roles[rc._id] = rc.count;
        });

        return {
          _id: company._id,
          name: company.name,
          email: company.email,
          roles
        };
      })
    );

    return Response.json({ companies: companiesWithRoles }, { status: 200 });

  } catch (error) {
    console.error('🔥 Fetch Companies Error:', error.message);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}
