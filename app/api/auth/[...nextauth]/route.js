import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import { Principal } from "@/models/Principal";
import { compare } from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
         role: { label: "Role", type: "text" },
      },
async authorize(credentials) {
if (!credentials) {
  throw new Error("No credentials provided");
}
await connectMongoDB();

  


  const { email, password, role } = credentials;

if (role === "lecturer") {
  const lecturer = await Lecturer.findOne({ email }).select("+password");

  if (!lecturer) throw new Error("Invalid credentials");

  const isMatch = await compare(password, lecturer.password);

  console.log("Lecturer found?", !!lecturer);
  console.log("👉 Plain password entered:", password);
  console.log("👉 Hashed password in DB:", lecturer.password);
  console.log("👉 Password match result:", isMatch);

  if (!isMatch) throw new Error("Invalid credentials");

  return {
    id: lecturer._id,
    name: lecturer.name,
    email: lecturer.email,
    role: "lecturer",
    collegeId: lecturer.collegeId,
    collegeName: lecturer.collegeName,
    photo: lecturer.photo || null,
  };
}


  if (role === "principal") {
    const principal = await Principal.findOne({ email });
    if (!principal) throw new Error("Invalid credentials");

    const isMatch = await compare(password, principal.password);
    if (!isMatch) throw new Error("Invalid credentials");

    return {
      id: principal._id,
      name: principal.name,
      email: principal.email,
      role: "principal",
      collegeId: principal.collegeId.toString(),
      photo: principal.photo,
    };
  }

  throw new Error("Invalid role");
}

    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.collegeId = user.collegeId;
        token.collegeName = user.collegeName;
        token.role = user.role;
        token.photo = user.photo;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.collegeId = token.collegeId;
        session.user.collegeName = token.collegeName;
        session.user.role = token.role;
        session.user.photo = token.photo;
      }
      return session;
    },
  },
  pages: {
    signIn: "/lecturer-login", // default login page
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
