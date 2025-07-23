<<<<<<< HEAD
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // ✅ use your auth.js

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
=======
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
>>>>>>> 60c63ae (updated auth)
