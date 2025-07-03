import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
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

        const lecturer = await Lecturer.findOne({ email: credentials.email });

        if (!lecturer) {
          throw new Error("No lecturer found");
        }

        const isMatch = credentials.password === lecturer.password;

        return {
          id: lecturer._id,
          name: lecturer.name,
          email: lecturer.email,
          collegeId: lecturer.collegeId,
          collegeName: lecturer.collegeName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.collegeId = user.collegeId;
        token.collegeName = user.collegeName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.collegeId = token.collegeId;
        session.user.collegeName = token.collegeName;
      }
      return session;
    },
  },
  pages: {
    signIn: "/lecturer-login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
