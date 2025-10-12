//app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import Student from "@/models/Student";
import Principal from "@/models/Principal";
import bcrypt from "bcryptjs";

// ----------- CUSTOM AUTH FUNCTIONS -----------

async function authenticateLecturer(identifier, password) {
  const lecturer = await Lecturer.findOne({ email: identifier.trim().toLowerCase() });
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

async function authenticateStudent(identifier, password) {
  const student = await Student.findOne({ admissionNo: identifier.trim() }).populate("collegeId", "name");
  if (!student) return null;
  const isValid = student.password === password.trim() || await bcrypt.compare(password.trim(), student.password);
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
    fatherName: student.fatherName,
    caste: student.caste,
    dob: student.dob,
    gender: student.gender,
    address: student.address,
    mobile: student.mobile,
    group: student.group,
  };
}

async function authenticatePrincipal(identifier, password) {
  const principal = await Principal.findOne({ email: identifier.trim().toLowerCase() }).populate("collegeId", "name");
  if (!principal) return null;
  const isValid = principal.password === password.trim() || await bcrypt.compare(password.trim(), principal.password);
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

// ----------- NEXTAUTH CONFIG -----------

const authOptions = {
  providers: [
    // 🧩 Google Sign-In Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // 🧑‍💻 Credentials Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email / AdmissionNo", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password || !credentials?.role) return null;

        await connectMongoDB();

        const { identifier, password, role } = credentials;
        let user = null;

        if (role.toLowerCase() === "lecturer") user = await authenticateLecturer(identifier, password);
        else if (role.toLowerCase() === "student") user = await authenticateStudent(identifier, password);
        else if (role.toLowerCase() === "principal") user = await authenticatePrincipal(identifier, password);

        return user;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, profile }) {
      // ✅ Google Login
      if (account?.provider === "google") {
        await connectMongoDB();

        // Try to match the Google email with any existing user
        const lecturer = await Lecturer.findOne({ email: profile.email });
        const student = await Student.findOne({ email: profile.email });
        const principal = await Principal.findOne({ email: profile.email });

        let dbUser = lecturer || student || principal;

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role || (lecturer ? "lecturer" : student ? "student" : "principal");
          token.collegeId = dbUser.collegeId?._id?.toString() || dbUser.collegeId?.toString() || null;
          token.collegeName = dbUser.collegeName || dbUser.collegeId?.name || null;
        } else {
          // If not found, default to Google user
          token.id = profile.sub;
          token.role = "student"; // default role
        }

        token.name = profile.name;
        token.email = profile.email;
      }

      // ✅ Credentials login
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.collegeId = user.collegeId;
        token.collegeName = user.collegeName;
        if (user.role === "lecturer") token.subject = user.subject;
        if (user.role === "student") {
          token.admissionNo = user.admissionNo;
          token.yearOfStudy = user.yearOfStudy;
          token.photo = user.photo;
          token.fatherName = user.fatherName;
          token.caste = user.caste;
          token.dob = user.dob;
          token.gender = user.gender;
          token.address = user.address;
          token.mobile = user.mobile;
          token.group = user.group;
        }
        if (user.role === "principal") token.photo = user.photo;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.collegeId = token.collegeId;
      session.user.collegeName = token.collegeName;
      if (token.role === "lecturer") session.user.subject = token.subject;
      if (token.role === "student") {
        session.user.admissionNo = token.admissionNo;
        session.user.yearOfStudy = token.yearOfStudy;
        session.user.photo = token.photo;
        session.user.fatherName = token.fatherName;
        session.user.caste = token.caste;
        session.user.dob = token.dob;
        session.user.gender = token.gender;
        session.user.address = token.address;
        session.user.mobile = token.mobile;
        session.user.group = token.group;
      }
      if (token.role === "principal") session.user.photo = token.photo;
      return session;
    },
  },

  pages: {
    signIn: "/student/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { authOptions, handler as GET, handler as POST };
