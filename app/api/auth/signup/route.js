import dbConnect from '@/lib/dbConnect';
import User from '@/models/userModel';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  await dbConnect();

  const { username, password, role } = await req.json();

  try {
    const allowedRoles = ['superadmin', 'hr', 'manager', 'user'];
    if (!allowedRoles.includes(role)) {
      return Response.json({ message: 'Invalid role' }, { status: 400 });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return Response.json({ message: 'Username already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    return Response.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
