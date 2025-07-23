// lib/auth.js
<<<<<<< HEAD
import CredentialsProvider from "next-auth/providers/credentials";
import Lecturer from "@/models/Lecturer"; // ✅ adjust if needed
import Principal from "@/models/Principal";
import connectMongoDB from "@/lib/mongodb";
import bcrypt from "bcryptjs";
=======
// This file contains the authentication configuration for NextAuth.js
import CredentialsProvider from "next-auth/providers/credentials"
import { getServerSession } from "next-auth"
import { NextAuthOptions } from "next-auth"
import connectMongoDB from "@/lib/mongodb"
import Lecturer from "@/models/Lecturer"
import Principal from "@/models/Principal"
import bcrypt from "bcryptjs"
>>>>>>> 60c63ae (updated auth)

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
<<<<<<< HEAD
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }, // ✅ required
=======
        email: {},
        password: {},
        role: {} // ✅ Add role input
>>>>>>> 60c63ae (updated auth)
      },
      async authorize(credentials) {
        await connectMongoDB()

<<<<<<< HEAD
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
=======
        const { email, password, role } = credentials

        if (!email || !password || !role) {
          throw new Error("Missing credentials")
        }

        let user = null

        if (role === "lecturer") {
          user = await Lecturer.findOne({ email })
        } else if (role === "principal") {
          user = await Principal.findOne({ email })
        }

        if (!user) {
          throw new Error("User not found")
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: role,
          photo: user.photo,
          collegeId: user.collegeId,
        }
>>>>>>> 60c63ae (updated auth)
      },
    }),
  ],
  pages: {
<<<<<<< HEAD
    signIn: "/lecturer-login", // or your custom login page
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
=======
    signIn: "/auth/login",
>>>>>>> 60c63ae (updated auth)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
<<<<<<< HEAD
        token.id = user.id;
        token.role = user.role;
        token.collegeId = user.collegeId;
        token.collegeName = user.collegeName;
        token.photo = user.photo;
=======
        token.id = user.id
        token.role = user.role
        token.photo = user.photo
        token.collegeId = user.collegeId
>>>>>>> 60c63ae (updated auth)
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.photo = token.photo
        session.user.collegeId = token.collegeId
      }
      return session
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
}

export const getAuthSession = () => getServerSession(authOptions)
