import { cookies } from "next/headers";

export async function POST() {
  try {
    cookies().set("token", "", {
      httpOnly: true,
      expires: new Date(0), // Expire immediately
      path: "/",
    });

    return Response.json({ message: "Logout successful" }, { status: 200 });
  } catch (err) {
    console.error("Logout Error:", err);
    return Response.json({ message: "Logout failed" }, { status: 500 });
  }
}