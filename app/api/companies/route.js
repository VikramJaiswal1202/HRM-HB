
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
    if (!decoded || decoded.role !== 'superadmin') {
      return Response.json({ message: 'Access denied: Not superadmin' }, { status: 403 });
    }

    const companies = await Company.find().select('-passwordHash').lean();

    const enrichedCompanies = await Promise.all(
      companies.map(async (company) => {
        const roleCounts = await User.aggregate([
          { $match: { companyId: company._id } },
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 }
            }
          }
        ]);

        const roleMap = {
          hr: 0,
          manager: 0,
          employee: 0,
          intern: 0
        };

        roleCounts.forEach(({ _id, count }) => {
          if (_id in roleMap) roleMap[_id] = count;
        });

        return {
          ...company,
          users: roleMap,
          totalEmployees: roleCounts.reduce((sum, r) => sum + r.count, 0)
        };
      })
    );

    return Response.json({ companies: enrichedCompanies }, { status: 200 });

  } catch (error) {
    console.error('🔥 Fetch Companies Error:', error.message);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}
