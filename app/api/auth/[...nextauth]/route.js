import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import Student from "@/models/Student";
import Principal from "@/models/Principal";
import bcrypt from "bcryptjs";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email / AdmissionNo", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }, // lecturer / student / principal
      },

      async authorize(credentials) {
        await connectMongoDB();
        const { identifier, password, role } = credentials;

        let user = null;

        // 🧑‍🏫 Lecturer Login
        if (role === "lecturer") {
          const lecturer = await Lecturer.findOne({ email: identifier });
          if (!lecturer) return null;

          const isValid = await bcrypt.compare(password, lecturer.password);
          if (!isValid) return null;

          user = {
            id: lecturer._id.toString(),
            name: lecturer.name,
            email: lecturer.email,
            role: "lecturer",
            collegeId: lecturer.collegeId.toString(),
            subject: lecturer.subject,
            collegeName: lecturer.collegeName,
          };
        }

        // 🎓 Student Login
        if (role === "student") {
          const student = await Student.findOne({ admissionNo: identifier });
          if (!student) return null;

          const isValid = await bcrypt.compare(password, student.password);
          if (!isValid) return null;

          user = {
            id: student._id.toString(),
            name: student.name,
            admissionNo: student.admissionNo,
            role: "student",
            collegeId: student.collegeId.toString(),
            yearOfStudy: student.yearOfStudy,
            photo: student.photo,
          };
        }

        // 🎩 Principal Login
        if (role === "principal") {
          const principal = await Principal.findOne({ email: identifier });
          if (!principal) return null;

          const isValid = await bcrypt.compare(password, principal.password);
          if (!isValid) return null;

          user = {
            id: principal._id.toString(),
            name: principal.name,
            email: principal.email,
            role: "principal",
            collegeId: principal.collegeId.toString(),
            photo: principal.photo,
          };
        }

        return user;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.collegeId = user.collegeId;

        if (user.role === "lecturer") {
          token.subject = user.subject;
          token.collegeName = user.collegeName;
        }
        if (user.role === "student") {
          token.admissionNo = user.admissionNo;
          token.yearOfStudy = user.yearOfStudy;
          token.photo = user.photo;
        }
        if (user.role === "principal") {
          token.photo = user.photo;
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.collegeId = token.collegeId;

      if (token.role === "lecturer") {
        session.user.subject = token.subject;
        session.user.collegeName = token.collegeName;
      }
      if (token.role === "student") {
        session.user.admissionNo = token.admissionNo;
        session.user.yearOfStudy = token.yearOfStudy;
        session.user.photo = token.photo;
      }
      if (token.role === "principal") {
        session.user.photo = token.photo;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login", // ✅ ఒకే login పేజీ
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { authOptions, handler as GET, handler as POST };
