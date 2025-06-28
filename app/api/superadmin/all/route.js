import dbConnect from '@/lib/dbConnect';
import SuperAdmin from '@/models/SuperAdmin';

export async function GET() {
  try {
    await dbConnect();

    const admins = await SuperAdmin.find().select('-passwordHash'); // Exclude sensitive data

    return Response.json({ admins }, { status: 200 });
  } catch (error) {
    console.error('🔥 Error fetching admins:', error);
    return Response.json({ message: 'Server error' }, { status: 500 });
  }
}