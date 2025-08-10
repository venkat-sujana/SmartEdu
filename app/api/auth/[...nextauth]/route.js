//app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import bcrypt from "bcryptjs";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        await connectMongoDB();
        const { email, password } = credentials;

        // 🔍 Find lecturer by email
        const lecturer = await Lecturer.findOne({ email });
        if (!lecturer) return null;

        // 🔐 Check password validity
        const isValid = await bcrypt.compare(password, lecturer.password);
        if (!isValid) return null;

        // ✅ Return user data to be stored in JWT
        return {
          id: lecturer._id.toString(),
          name: lecturer.name,
          email: lecturer.email,
          role: "lecturer",
          collegeId: lecturer.collegeId.toString(),
          subject: lecturer.subject,       // <-- subject added here
          collegeName: lecturer.collegeName // <-- also available in session
        };
      },
    }),
  ],

  callbacks: {
    // Store extra fields in JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.collegeId = user.collegeId;
        token.subject = user.subject;       // ✅ subject in token
        token.collegeName = user.collegeName;
      }
      return token;
    },

    // Store extra fields in session
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.collegeId = token.collegeId;
      session.user.subject = token.subject; // ✅ subject in session
      session.user.collegeName = token.collegeName;
      return session;
    },
  },

  pages: {
    signIn: "/lecturer/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

// Export for Next.js App Router API
export { authOptions, handler as GET, handler as POST };
