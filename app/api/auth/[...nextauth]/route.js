//app/api/auth/[...nextauth]/route.js
// This file handles authentication using NextAuth.js with MongoDB and Cloudinary.
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import { Principal } from "@/models/Principal";
import { compare } from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectMongoDB();
        console.log("🔐 Incoming login:", credentials.email);

        const { email, password } = credentials;

        // 🔍 First check if it's a Lecturer
        const lecturer = await Lecturer.findOne({ email });
        if (lecturer) {
          const isMatch = await compare(password, lecturer.password);
          console.log("Lecturer found. Password match:", isMatch);

          if (!isMatch) throw new Error("Invalid lecturer credentials");

          return {
            id: lecturer._id,
            name: lecturer.name,
            email: lecturer.email,
            role: "lecturer",
            collegeId: lecturer.collegeId,
            collegeName: lecturer.collegeName,
          };
        }

        // 🔍 If not a lecturer, check Principal
        const principal = await Principal.findOne({ email });
        if (principal) {
          const isMatch = await compare(password, principal.password);
           console.log("Principal found. Password match:", isMatch);

          if (!isMatch) throw new Error("Invalid principal credentials");

          return {
            id: principal._id,
            name: principal.name,
            email: principal.email,
            role: "principal",
            collegeId: principal.collegeId.toString(),
            photo: principal.photo,
          };
        }

        console.log("❌ No user found");
       throw new Error("No user found");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.collegeId = user.collegeId;
        token.collegeName = user.collegeName;
        token.role = user.role;
        token.photo = user.photo;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.collegeId = token.collegeId;
        session.user.collegeName = token.collegeName;
        session.user.role = token.role;
        session.user.photo = token.photo;
      }
      return session;
    },
  },
  pages: {
    signIn: "/lecturer-login", // 👈 you can update dynamically if needed
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
