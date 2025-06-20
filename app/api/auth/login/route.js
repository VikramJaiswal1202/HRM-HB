import dbConnect from '@/lib/dbConnect';
import User from '@/models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is undefined');
      return Response.json({ message: 'Server config error' }, { status: 500 });
    }

    await dbConnect();

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return Response.json({ message: 'Missing credentials' }, { status: 400 });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return Response.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return Response.json({
      message: 'Login successful',
      token,
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login route error:', err);
    return Response.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
