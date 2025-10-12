import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import Student from "@/models/Student";
import Principal from "@/models/Principal";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials) {
        const { identifier, password, role } = credentials;
        await connectMongoDB();

        if (role === "lecturer") {
          const lecturer = await Lecturer.findOne({
            email: identifier,
          }).populate("collegeId", "name");

          if (!lecturer) throw new Error("Lecturer not found");

          const isValid = await bcrypt.compare(password, lecturer.password);
          if (!isValid) throw new Error("Invalid password");

          return {
            id: lecturer._id,
            name: lecturer.name,
            email: lecturer.email,
            role: "lecturer",
            subject: lecturer.subject,
            collegeId: lecturer.collegeId?._id?.toString(),
            collegeName: lecturer.collegeId?.name,
          };
        }

        throw new Error("Invalid role");
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      // 🔥 Google Login flow
      if (account?.provider === "google") {
        await connectMongoDB();

        const lecturer = await Lecturer.findOne({ email: profile.email }).populate("collegeId", "name");
        const student = await Student.findOne({ email: profile.email }).populate("collegeId", "name");
        const principal = await Principal.findOne({ email: profile.email }).populate("collegeId", "name");

        let dbUser = lecturer || student || principal;

        if (lecturer) {
          token.role = "lecturer";
          token.subject = lecturer.subject;
          token.collegeId = lecturer.collegeId?._id?.toString();
          token.collegeName = lecturer.collegeId?.name;
        } else if (student) {
          token.role = "student";
          token.yearOfStudy = student.yearOfStudy;
          token.group = student.group;
          token.collegeId = student.collegeId?._id?.toString();
          token.collegeName = student.collegeId?.name;
        } else if (principal) {
          token.role = "principal";
          token.collegeId = principal.collegeId?._id?.toString();
          token.collegeName = principal.collegeId?.name;
        } else {
          token.role = "guest";
        }

        token.name = profile.name;
        token.email = profile.email;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.collegeId = token.collegeId;
        session.user.collegeName = token.collegeName;
        session.user.subject = token.subject;
        session.user.yearOfStudy = token.yearOfStudy;
        session.user.group = token.group;
      }
      return session;
    },
  },

  pages: {
    signIn: "/lecturer/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
