
//app/api/auth/[...nextauth]/route.js
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
        console.log("🔑 Incoming credentials:", credentials);
        await connectMongoDB();
        const { identifier, password, role } = credentials;
        const lecturer = await Lecturer.findOne({ email: identifier.trim().toLowerCase() });

        if (!identifier || !password || !role) {
          console.log("❌ Missing credentials");
          return null;
        }

        let user = null;

        if (role.toLowerCase() === "lecturer") {
          const lecturer = await Lecturer.findOne({
            email: identifier.trim().toLowerCase(),
          });
          if (!lecturer) {
            console.log("❌ Lecturer not found");
            return null;
          }


 
const isValid = await bcrypt.compare(password.trim(), lecturer.password);
console.log("✅ Password valid?", isValid);
console.log("Entered password:", `"${password}"`);
console.log("Trimmed password:", `"${password.trim()}"`);
console.log("DB hash:", lecturer.password);
console.log("Compare result:", isValid);

          



    if (!isValid) return null;  // If password is invalid, reject login
          user = {
            id: lecturer._id.toString(),
            name: lecturer.name,
            email: lecturer.email,
            role: "lecturer",
            collegeId: lecturer.collegeId?.toString() || null,
            collegeName: lecturer.collegeName || null,
            subject: lecturer.subject,
          };
        }




        if (role.toLowerCase() === "student") {
          const student = await Student.findOne({ admissionNo: identifier }).populate(
            "collegeId",
            "name"
          );
          if (!student) {
            console.log("❌ Student not found with admissionNo:", identifier);
            return null;
          }
          const isValid = await bcrypt.compare(password, student.password);
          if (!isValid) {
            console.log("❌ Invalid student password");
            return null;
          }
          user = {
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

        if (role.toLowerCase() === "principal") {
          const principal = await Principal.findOne({
            email: identifier.trim().toLowerCase(),
          }).populate("collegeId", "name");
          if (!principal) {
            console.log("❌ Principal not found");
            return null;
          }
          const isValid = await bcrypt.compare(password, principal.password);
          if (!isValid) {
            console.log("❌ Invalid principal password");
            return null;
          }
          user = {
            id: principal._id.toString(),
            name: principal.name,
            email: principal.email,
            role: "principal",
            collegeId: principal.collegeId?._id?.toString() || null,
            collegeName: principal.collegeId?.name || null,
            photo: principal.photo,
          };
        }

        console.log("✅ Authenticated user:", user);
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

        if (user.role === "lecturer") {
          token.subject = user.subject;
        }

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
      session.user.collegeName = token.collegeName;

      if (token.role === "lecturer") {
        session.user.subject = token.subject;
      }

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

      if (token.role === "principal") {
        session.user.photo = token.photo;
      }

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
