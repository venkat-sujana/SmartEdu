// app/middleware/middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const LOGIN_PATHS = ["/auth/login", "/lecturer/login", "/principal/login", "/student/login"];
const SUBJECT_GROUP_MAP = {
  MandAT: "mandat",
  CET: "cet",
  MLT: "mlt",
  Maths: "mpc",
  Physics: "mpc",
  Chemistry: "mpc",
  Botany: "bipc",
  Zoology: "bipc",
  Civics: "cec",
  Economics: "cec",
  History: "hec",
  Commerce: "cec",
  GFC: "gfc",
};

function getRoleHome(role, token) {
  if (role === "lecturer") {
    const group = SUBJECT_GROUP_MAP[token?.subject] || "mpc";
    return `/dashboards/${group}`;
  }
  if (role === "principal") return "/principal/dashboard";
  if (role === "student") return "/student/dashboard";
  return "/auth/login";
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (LOGIN_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (pathname.startsWith("/lecturer") && token.role !== "lecturer") {
    return NextResponse.redirect(new URL(getRoleHome(token.role, token), req.url));
  }

  if (pathname.startsWith("/principal") && token.role !== "principal") {
    return NextResponse.redirect(new URL(getRoleHome(token.role, token), req.url));
  }

  if (pathname.startsWith("/student") && token.role !== "student") {
    return NextResponse.redirect(new URL(getRoleHome(token.role, token), req.url));
  }

  if (pathname.startsWith("/dashboards") && token.role !== "lecturer") {
    return NextResponse.redirect(new URL(getRoleHome(token.role, token), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/lecturer/:path*", "/principal/:path*", "/student/:path*", "/dashboards/:path*"],
};
