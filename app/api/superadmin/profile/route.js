import dbConnect from "@/lib/dbConnect";
import SuperAdmin from "@/models/SuperAdmin";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/middleware/verifyToken";

export async function GET() {
  try {
    await dbConnect();

    const token = cookies().get("token")?.value;

    const decoded = verifyToken(token, ["superadmin"]);
    const { _id } = decoded;

    const superAdmin = await SuperAdmin.findById(_id).select("-passwordHash");
    if (!superAdmin) {
      return Response.json({ message: "SuperAdmin not found" }, { status: 404 });
    }

    return Response.json({ superAdmin }, { status: 200 });

  } catch (error) {
    console.error("❌ Profile Error:", error.message);
    return Response.json({ message: error.message }, { status: 401 });
  }
}
