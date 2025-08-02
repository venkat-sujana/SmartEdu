import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import bcrypt from "bcryptjs";

// ...rest of your code above

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        await connectMongoDB();
        const { email, password } = credentials;

        const lecturer = await Lecturer.findOne({ email });
        if (!lecturer) return null;

        const isValid = await bcrypt.compare(password, lecturer.password);
        if (!isValid) return null;

        return {
          id: lecturer._id.toString(),
          name: lecturer.name,
          email: lecturer.email,
          role: "lecturer",
          collegeId: lecturer.collegeId.toString(),
          subject: lecturer.subject,
          collegeName: lecturer.collegeName,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.collegeId = user.collegeId;
        token.subject = user.subject;
        token.collegeName = user.collegeName;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.collegeId = token.collegeId;
      session.user.subject = token.subject;
      session.user.collegeName = token.collegeName;
      return session;
    },
  },

  pages: {
    signIn: "/lecturer/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

// ✅✅✅ Add this export to fix the error
export { authOptions, handler as GET, handler as POST };
