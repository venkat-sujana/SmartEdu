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
  console.log("Authenticating lecturer with identifier:", identifier);
  console.log("Authenticating lecturer with password:", password);
  const lecturer = await Lecturer.findOne({ email: identifier.trim().toLowerCase() });
  if (!lecturer) {
    console.log("No lecturer found with the given identifier:", identifier);
    return null;
  }
  console.log("Comparing password with stored password:");

  // ✅ proper bcrypt comparison
  const isValid = await bcrypt.compare(password.trim(), lecturer.password);
  if (!isValid) {
    console.log("Password comparison failed for lecturer with identifier:", identifier);
    return null;
  }
console.log("Authentication successful for lecturer with identifier:", identifier);

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
  console.log("Authenticating student with identifier:", identifier);
  console.log("Authenticating student with password:", password);
  const student = await Student.findOne({ admissionNo: identifier.trim() }).populate("collegeId", "name");
  if (!student) {
    console.log("No student found with the given identifier:", identifier);
    return null;
  }
  console.log("Comparing password with stored password:");

  // ✅ proper bcrypt comparison
const isValid = await bcrypt.compare(password.trim(), student.password);
if (!isValid) {
  console.log("Password comparison failed for student with identifier:", identifier);
  return null;
}
console.log("Authentication successful for student with identifier:", identifier);

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








export async function authenticatePrincipal(identifier, password) {
  console.log("Authenticating principal with identifier:", identifier);
  const principal = await Principal.findOne({ email: identifier.trim().toLowerCase() }).populate("collegeId", "name");

  if (!principal) {
    console.log("No principal found with the given identifier:", identifier);
    return null;
  }

  const isValid = await bcrypt.compare(password.trim(), principal.password);
  if (!isValid) {
    console.log("Password comparison failed for principal with identifier:", identifier);
    return null;
  }

  console.log("Authentication successful for principal with identifier:", identifier);
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

  if (!credentials?.identifier || !credentials?.password || !credentials?.role) {
    console.log("Error: Missing credentials in authorize function");
    return null;
  }

  await connectMongoDB();
  console.log("Authorize: credentials received", credentials);

  const { identifier, password, role } = credentials;
  let user = null;

  console.log("Authorize: trying to authenticate", role, "with identifier", identifier);

  if (role.toLowerCase() === "lecturer") {
    console.log("Authorize: authenticating lecturer");
    user = await authenticateLecturer(identifier, password);
  } else if (role.toLowerCase() === "student") {
    console.log("Authorize: authenticating student");
    user = await authenticateStudent(identifier, password);
  } else if (role.toLowerCase() === "principal") {
    console.log("Authorize: authenticating principal");
    user = await authenticatePrincipal(identifier, password);
  }

  console.log("Authorize: result", user);

  return user; // must be null if authentication failed
}
    }),
  ],







  callbacks: {
    async jwt({ token, user, account, profile }) {
      // ✅ Google Login
      if (account?.provider === "google") {
        console.log("Google Login:", profile);
        await connectMongoDB();

        // Try to match the Google email with any existing user
        const lecturer = await Lecturer.findOne({ email: profile.email });
        const student = await Student.findOne({ email: profile.email });
        const principal = await Principal.findOne({ email: profile.email });

        let dbUser = lecturer || student || principal;

        if (dbUser) {
          console.log("Existing user found:", dbUser);
          token.id = dbUser._id.toString();
          token.role = dbUser.role || (lecturer ? "lecturer" : student ? "student" : "principal");
          token.collegeId = dbUser.collegeId?._id?.toString() || dbUser.collegeId?.toString() || null;
          token.collegeName = dbUser.collegeName || dbUser.collegeId?.name || null;
        } else {
          console.log("No existing user found, defaulting to Google user");
          token.id = profile.sub;
          token.role = "student"; // default role
        }

        token.name = profile.name;
        token.email = profile.email;
      }

      // ✅ Credentials login
      if (user) {
        console.log("Credentials login:", user);
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

      console.log("Final token:", token);

      return token;
    },







    async session({ session, token }) {
      console.log("Session function called with token:", token);
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.collegeId = token.collegeId;
      session.user.collegeName = token.collegeName;
      if (token.role === "lecturer") session.user.subject = token.subject;
      if (token.role === "student") {
        console.log("Student token:", token);
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
      console.log("Final session:", session);
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
