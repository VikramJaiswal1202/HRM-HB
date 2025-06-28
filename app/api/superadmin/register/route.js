import dbConnect from '@/lib/dbConnect';
import SuperAdmin from '@/models/SuperAdmin';
import bcrypt from 'bcrypt';

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    console.log('🧾 Body received:', body);

    const { name, email, password } = body;

    if (!name || !email || !password) {
      console.log('⛔ Missing fields');
      return Response.json({ message: 'All fields are required' }, { status: 400 });
    }

    const existing = await SuperAdmin.findOne({ email });
    if (existing) {
      console.log('⚠️ Email already exists');
      return Response.json({ message: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const superAdmin = await SuperAdmin.create({
      name,
      email,
      passwordHash
    });

    console.log('✅ SuperAdmin created:', superAdmin);

    return Response.json({
      message: 'Super Admin created successfully',
      superAdmin: {
        _id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email
      }
    }, { status: 201 });

  } catch (error) {
    console.error('🔥 Server Error:', error);
    return Response.json({ message: 'Server Error', error: error.message }, { status: 500 });
  }
}