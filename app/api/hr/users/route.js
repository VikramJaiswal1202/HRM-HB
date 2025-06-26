import dbConnect from '@/lib/dbConnect';
    import User from '@/models/User';
    import Company from '@/models/Company';
    import SuperAdmin from '@/models/SuperAdmin';
    import jwt from 'jsonwebtoken';
    import bcrypt from 'bcrypt';
    import { headers } from 'next/headers';

    const JWT_SECRET = process.env.JWT_SECRET;

    // Helper: Extract token from cookie
    async function getTokenFromHeaders() {
      const headersList = await headers();
      const cookie = headersList.get('cookie') || '';
      return cookie
        .split(';')
        .find(c => c.trim().startsWith('token='))
        ?.split('=')[1];
    }

    // ✅ Add employee/intern (POST)
    export async function POST(req) {
      try {
        await dbConnect();

        const token = await getTokenFromHeaders();
        if (!token) return Response.json({ message: 'Unauthorized: No token' }, { status: 401 });

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'hr') {
          return Response.json({ message: 'Access denied: Only HR can add users' }, { status: 403 });
        }

        if (!decoded.companyId) {
          console.error('HR user missing companyId in token:', decoded);
          return Response.json({ message: 'Invalid HR token: missing company information' }, { status: 401 });
        }

        const { name, email, username, password, role, managerId } = await req.json();

        if (!name || !email || !username || !password || !role) {
          return Response.json({ message: 'All fields are required' }, { status: 400 });
        }

        if (!['employee', 'intern'].includes(role)) {
          return Response.json({ message: 'Role must be employee or intern' }, { status: 400 });
        }

        // ✅ Check email and username across all models
        const [existingUser, existingCompany, existingSuperAdmin] = await Promise.all([
          User.findOne({ $or: [{ email }, { username }] }),
          Company.findOne({ email }),
          SuperAdmin.findOne({ email }),
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
          createdBy: decoded._id,
          managerId: managerId || null,
        });

        return Response.json({ message:`${role} created`, user }, { status: 201 });

      } catch (err) {
        console.error('🔥 HR Add User Error:', err.message);

        if (err.name === 'ValidationError') {
          console.error('Validation details:', err.errors);
        }

        return Response.json({ message: 'Server error' }, { status: 500 });
      }
    }


    // ✅ Delete employee/intern (DELETE)
    export async function DELETE(req) {
      try {
        await dbConnect();

        const token = await getTokenFromHeaders();
        if (!token) return Response.json({ message: 'Unauthorized: No token' }, { status: 401 });

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'hr') {
          return Response.json({ message: 'Access denied: Only HR can delete users' }, { status: 403 });
        }

        const { userId } = await req.json();
        if (!userId) {
          return Response.json({ message: 'userId is required' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
          return Response.json({ message: 'User not found' }, { status: 404 });
        }

        if (
          user.companyId.toString() !== decoded.companyId ||
          !['employee', 'intern'].includes(user.role)
        ) {
          return Response.json({ message: 'Access denied: Invalid target' }, { status: 403 });
        }

        await User.findByIdAndDelete(userId);

        return Response.json({ message: 'User deleted successfully' }, { status: 200 });

      } catch (err) {
        console.error('🔥 HR Delete Error:', err.message);
        return Response.json({ message: 'Server error' }, { status: 500 });
      }
    }

    // ✅ Fetch employees/interns (GET)
    export async function GET() {
      try {
        await dbConnect();

        const token = await getTokenFromHeaders();
        if (!token) return Response.json({ message: 'Unauthorized: No token' }, { status: 401 });

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role === 'employee' || decoded.role === 'intern') {
          return Response.json({ message: 'Access denied: ' }, { status: 403 });
        }

        const users = await User.find({
          companyId: decoded.companyId,
          role: { $in: ['employee', 'intern'] },
        }).select('-passwordHash');

        return Response.json({ users }, { status: 200 });

      } catch (err) {
        console.error('🔥 HR Fetch Error:', err.message);
        return Response.json({ message: 'Server error' }, { status: 500 });
      }
    }