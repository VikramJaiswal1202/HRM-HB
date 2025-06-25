import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";           // Adjust path
import User from "@/models/User";                // Adjust path
import bcrypt from "bcryptjs";                   // Adjust path

     // Optional

export const authOptions = {
  // Optional: adapter if needed for NextAuth
  // adapter: MongoDBAdapter(clientPromise),

  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin", // Will now route to pages/auth/signin.js
    error: "/auth/error",    // Optional error page
  },
  callbacks: {
    async jwt({ token, user }) {
      // Attach user role and id to the JWT
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose user id and role in the session
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
