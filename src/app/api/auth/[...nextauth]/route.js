
//src/app/api/auth/[...nextauth]/route.js
import "@/models/College";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import Principal from "@/models/Principal";
import Student from "@/models/Student";
import User from "@/models/User";
import { loginRateLimiter } from "@/lib/rateLimiter";

async function authenticateAdmin(email, password) {
  await connectMongoDB();
  
  const key = `login:${email.toLowerCase()}`;
  if (process.env.NODE_ENV !== 'development') {
    try {
      await loginRateLimiter.consume(key);
    } catch {
      console.error(`[AUTH ADMIN RATE LIMIT] ${email}`);
      return null;
    }
  }
  
  const admin = await User.findOne({
    email: email.trim().toLowerCase(),
    role: "admin",
  });
  if (!admin) {
    console.error(`[AUTH ADMIN NOT FOUND] ${email}`);
    return null;
  }

  const isValid = await bcrypt.compare(password.trim(), admin.password);
  if (!isValid) {
    console.error(`[AUTH ADMIN INVALID PASS] ${email}`);
    return null;
  }

  return {
    id: admin._id.toString(),
    name: admin.name,
    email: admin.email,
    role: "admin",
    collegeId: null,
    collegeName: "System Admin",
  };
}

async function authenticateLecturer(email, password) {
  await connectMongoDB();
  
  const key = `login:${email.toLowerCase()}`;
  if (process.env.NODE_ENV !== 'development') {
    try {
      await loginRateLimiter.consume(key);
    } catch {
      console.error(`[AUTH LECTURER RATE LIMIT] ${email}`);
      return null;
    }
  }
  
  const lecturer = await Lecturer.findOne({ email: email.trim().toLowerCase() });
  if (!lecturer) {
    console.error(`[AUTH LECTURER NOT FOUND] ${email}`);
    return null;
  }

  const isValid = await bcrypt.compare(password.trim(), lecturer.password);
  if (!isValid) {
    console.error(`[AUTH LECTURER INVALID PASS] ${email}`);
    return null;
  }

  return {
    id: lecturer._id.toString(),
    name: lecturer.name,
    email: lecturer.email,
    role: "lecturer",
    collegeId: lecturer.collegeId?.toString() || null,
    collegeName: lecturer.collegeName || null,
    subject: lecturer.subject,
    photo: lecturer.photo || "",
  };
}

async function authenticateStudent(admissionNo, password) {
  await connectMongoDB();
  
  const key = `login:${admissionNo.trim()}`;
  if (process.env.NODE_ENV !== 'development') {
    try {
      await loginRateLimiter.consume(key);
    } catch {
      console.error(`[AUTH STUDENT RATE LIMIT] ${admissionNo}`);
      return null;
    }
  }
  
  const student = await Student.findOne({ admissionNo: admissionNo.trim() }).populate(
    "collegeId",
    "name"
  );
  if (!student) {
    console.error(`[AUTH STUDENT NOT FOUND] ${admissionNo}`);
    return null;
  }

  const isValid = await bcrypt.compare(password.trim(), student.password);
  if (!isValid) {
    console.error(`[AUTH STUDENT INVALID PASS] ${admissionNo}`);
    return null;
  }

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
    fatherName: student.fatherName,
    mobile: student.mobile,
    parentMobile: student.parentMobile,
    caste: student.caste,
    gender: student.gender,
    address: student.address,
  };
}

async function authenticatePrincipal(email, password) {
  await connectMongoDB();
  
  const key = `login:${email.toLowerCase()}`;
  if (process.env.NODE_ENV !== 'development') {
    try {
      await loginRateLimiter.consume(key);
    } catch {
      console.error(`[AUTH PRINCIPAL RATE LIMIT] ${email}`);
      return null;
    }
  }
  
  const principal = await Principal.findOne({ email: email.trim().toLowerCase() }).populate(
    "collegeId",
    "name"
  );
  if (!principal) {
    console.error(`[AUTH PRINCIPAL NOT FOUND] ${email}`);
    return null;
  }

  const isValid = await bcrypt.compare(password.trim(), principal.password);
  if (!isValid) {
    console.error(`[AUTH PRINCIPAL INVALID PASS] ${email}`);
    return null;
  }

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

const authOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        return authenticateAdmin(credentials.email, credentials.password);
      },
    }),
    CredentialsProvider({
      id: "student-login",
      name: "Student Login",
      credentials: {
        admissionNo: { label: "Admission No", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.admissionNo || !credentials?.password) {
          return null;
        }
        return authenticateStudent(credentials.admissionNo, credentials.password);
      },
    }),
    CredentialsProvider({
      id: "lecturer-login",
      name: "Lecturer Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        return authenticateLecturer(credentials.email, credentials.password);
      },
    }),
    CredentialsProvider({
      id: "principal-login",
      name: "Principal Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        return authenticatePrincipal(credentials.email, credentials.password);
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
          token.fatherName = user.fatherName;
          token.mobile = user.mobile;
          token.parentMobile = user.parentMobile;
          token.caste = user.caste;
          token.gender = user.gender;
          token.address = user.address;
        }

        if (user.role === "lecturer") {
          token.subject = user.subject;
          token.photo = user.photo;
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

      if (token.role === "student") {
        session.user.admissionNo = token.admissionNo;
        session.user.yearOfStudy = token.yearOfStudy;
        session.user.photo = token.photo;
        session.user.group = token.group;
        session.user.fatherName = token.fatherName;
        session.user.mobile = token.mobile;
        session.user.parentMobile = token.parentMobile;
        session.user.caste = token.caste;
        session.user.gender = token.gender;
        session.user.address = token.address;
      }

      if (token.role === "lecturer") {
        session.user.subject = token.subject;
        session.user.photo = token.photo;
      }
      if (token.role === "principal") session.user.photo = token.photo;

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    error: '/auth/error',
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { authOptions, handler as GET, handler as POST };
