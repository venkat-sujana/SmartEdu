// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import Student from "@/models/Student";
import Principal from "@/models/Principal";
import bcrypt from "bcryptjs";

// ---------- AUTH FUNCTIONS ----------
async function authenticateLecturer(email, password) {
  await connectMongoDB();
  const lecturer = await Lecturer.findOne({ email: email.trim().toLowerCase() });
  if (!lecturer) return null;

  const isValid = await bcrypt.compare(password.trim(), lecturer.password);
  if (!isValid) return null;

  return {
    id: lecturer._id.toString(),
    name: lecturer.name,
    email: lecturer.email,
    role: "lecturer",
    collegeId: lecturer.collegeId?.toString() || null,
    collegeName: lecturer.collegeName || null,
    subject: lecturer.subject,
  };
}

async function authenticateStudent(admissionNo, password) {
  await connectMongoDB();
  const student = await Student.findOne({ admissionNo: admissionNo.trim() }).populate("collegeId", "name");
  if (!student) return null;

  const isValid = await bcrypt.compare(password.trim(), student.password);
  if (!isValid) return null;

  return {
    id: student._id.toString(),
    name: student.name,
    admissionNo: student.admissionNo,
    role: "student",
    collegeId: student.collegeId?._id?.toString() || null,
    collegeName: student.collegeId?.name || null,
    yearOfStudy: student.yearOfStudy,
    photo: student.photo,
    group: student.group,
  };
}

async function authenticatePrincipal(email, password) {
  await connectMongoDB();
  const principal = await Principal.findOne({ email: email.trim().toLowerCase() }).populate("collegeId", "name");
  if (!principal) return null;

  const isValid = await bcrypt.compare(password.trim(), principal.password);
  if (!isValid) return null;

  return {
    id: principal._id.toString(),
    name: principal.name,
    email: principal.email,
    role: "principal",
    collegeId: principal.collegeId?._id?.toString() || null,
    collegeName: principal.collegeId?.name || null,
    photo: principal.photo,
  };
}

// ---------- NEXTAUTH CONFIG ----------
const authOptions = {
  providers: [
    // 🎓 Student Login
    CredentialsProvider({
      id: "student-login",
      name: "Student Login",
      credentials: {
        admissionNo: { label: "Admission No", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await authenticateStudent(credentials.admissionNo, credentials.password);
        return user;
      },
    }),

    // 👨‍🏫 Lecturer Login
    CredentialsProvider({
      id: "lecturer-login",
      name: "Lecturer Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await authenticateLecturer(credentials.email, credentials.password);
        return user;
      },
    }),

    // 🧑‍💼 Principal Login
    CredentialsProvider({
      id: "principal-login",
      name: "Principal Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await authenticatePrincipal(credentials.email, credentials.password);
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
        token.collegeName = user.collegeName;
        if (user.role === "student") {
          token.admissionNo = user.admissionNo;
          token.yearOfStudy = user.yearOfStudy;
          token.photo = user.photo;
          token.group = user.group;
        }
        if (user.role === "lecturer") token.subject = user.subject;
        if (user.role === "principal") token.photo = user.photo;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.collegeId = token.collegeId;
      session.user.collegeName = token.collegeName;

      if (token.role === "student") {
        session.user.admissionNo = token.admissionNo;
        session.user.yearOfStudy = token.yearOfStudy;
        session.user.photo = token.photo;
        session.user.group = token.group;
      }
      if (token.role === "lecturer") session.user.subject = token.subject;
      if (token.role === "principal") session.user.photo = token.photo;

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST, authOptions };
