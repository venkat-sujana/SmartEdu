import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db();
        const email = credentials.email.trim();

        // 1️⃣ Check lecturer
        const lecturer = await db.collection("lecturers").findOne({ email });
        if (lecturer) {
          return {
            id: lecturer._id.toString(),
            name: lecturer.name,
            email: lecturer.email,
            role: "lecturer",
            collegeId: lecturer.collegeId,
            subject: lecturer.subject,
          };
        }

        // 2️⃣ Check student
        const student = await db.collection("students").findOne({ email });
        if (student) {
          return {
            id: student._id.toString(),
            name: student.name,
            email: student.email,
            role: "student",
            collegeId: student.collegeId,
          };
        }

        // 3️⃣ Check principal
        const principal = await db.collection("principals").findOne({ email });
        if (principal) {
          return {
            id: principal._id.toString(),
            name: principal.name,
            email: principal.email,
            role: "principal",
            collegeId: principal.collegeId,
          };
        }

        return null;
      },
    }),
  ],

 callbacks: {
  async signIn({ user, account }) {
    if (account.provider === "google") {
      const client = await MongoClient.connect(process.env.MONGODB_URI);
      const db = client.db();
      const email = user.email;

      // Check collections
      const lecturer = await db.collection("lecturers").findOne({ email });
      const student = await db.collection("students").findOne({ email });
      const principal = await db.collection("principals").findOne({ email });

      if (lecturer) {
        user.role = "lecturer";
        user.collegeId = lecturer.collegeId;
        user.subject = lecturer.subject;
      } else if (student) {
        user.role = "student";
        user.collegeId = student.collegeId;
      } else if (principal) {
        user.role = "principal";
        user.collegeId = principal.collegeId;
      } else {
        return false; // unauthorized email
      }

      return true;
    }
    return true;
  },

  async jwt({ token, user }) {
    if (user) {
      token.role = user.role;
      token.collegeId = user.collegeId;
      token.subject = user.subject;
    }
    return token;
  },

  async session({ session, token }) {
    session.user.role = token.role;
    session.user.collegeId = token.collegeId;
    session.user.subject = token.subject;
    return session;
  },

  async redirect({ baseUrl, token }) {
    // ✅ Dynamic redirect based on role
    if (token?.role === "lecturer") return `${baseUrl}/lecturer/dashboard`;
    if (token?.role === "student") return `${baseUrl}/student/dashboard`;
    if (token?.role === "principal") return `${baseUrl}/principal/dashboard`;
    return baseUrl;
  },
}
};