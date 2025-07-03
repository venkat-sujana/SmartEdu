// lib/auth.js
import CredentialsProvider from "next-auth/providers/credentials";
import Lecturer from "@/models/Lecturer"; // మీ Lecturer మోడల్
import connectMongoDB from "@/lib/mongodb";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectMongoDB();

const lecturer = await Lecturer.findOne({
  email: credentials.email,
}).select("+password"); // 👉 Needed if password is select: false

if (lecturer && await lecturer.comparePassword(credentials.password)) {
  return {
    id: lecturer._id.toString(),
    name: lecturer.name,
    collegeId: lecturer.collegeId.toString(),
    collegeName: lecturer.collegeName, // ✅ This is important!
  };
}

        return null;
      },
    }),
  ],


callbacks: {
    async session({ session, token }) {
      session.user.collegeId = token.collegeId;
      session.user.collegeName = token.collegeName;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.collegeId = user.collegeId;
        token.collegeName = user.collegeName;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
