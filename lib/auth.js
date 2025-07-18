// lib/auth.js
import CredentialsProvider from "next-auth/providers/credentials";
import Lecturer from "@/models/Lecturer"; // ✅ adjust if needed
import Principal from "@/models/Principal";
import connectMongoDB from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }, // ✅ required
      },
      async authorize(credentials) {
        await connectMongoDB();

        const { email, password, role } = credentials;

        if (role === "lecturer") {
          const user = await Lecturer.findOne({ email: email.toLowerCase() });
          if (!user) throw new Error("Lecturer not found");

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) throw new Error("Password mismatch");

          return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            collegeId: user.collegeId,
            collegeName: user.collegeName,
            photo: user.photo,
          };
        }

        if (role === "principal") {
          const user = await Principal.findOne({ email: email.toLowerCase() });
          if (!user) throw new Error("Principal not found");

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) throw new Error("Password mismatch");

          return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            collegeId: user.collegeId,
            collegeName: user.collegeName,
            photo: user.photo,
          };
        }

        throw new Error("Invalid role");
      },
    }),
  ],
  pages: {
    signIn: "/lecturer-login", // or your custom login page
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.collegeId = user.collegeId;
        token.collegeName = user.collegeName;
        token.photo = user.photo;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.collegeId = token.collegeId;
      session.user.collegeName = token.collegeName;
      session.user.photo = token.photo;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
