import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtVerify } from "jose";

const LOGIN_PATHS = [
  "/auth/login",
  "/admin/login",
  "/lecturer/login",
  "/principal/login",
  "/student/login",
];

function getRoleHome(role) {
  if (role === "admin") return "/admin-panel";
  if (role === "lecturer") return "/dashboards";
  if (role === "principal") return "/principal/dashboard";
  if (role === "student") return "/student/dashboard";
  return "/auth/login";
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/invigilation") || pathname.startsWith("/timetable-management")) {
    const isInvigilationRoute = pathname.startsWith("/invigilation");
    const moduleBase = isInvigilationRoute ? "/invigilation" : "/timetable-management";
    const loginPath = `${moduleBase}/login`;

    if (pathname === loginPath || pathname === moduleBase) {
      return NextResponse.next();
    }

    const token = req.cookies.get("invigilation_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL(loginPath, req.url));
    }

    const invigilationSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!invigilationSecret) {
      return NextResponse.redirect(new URL(loginPath, req.url));
    }

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(invigilationSecret));
      const role = payload?.role;
      if (pathname.startsWith(`${moduleBase}/admin`) && role !== "admin") {
        return NextResponse.redirect(new URL(loginPath, req.url));
      }
      if (pathname.startsWith(`${moduleBase}/lecturer`) && role !== "lecturer") {
        return NextResponse.redirect(new URL(loginPath, req.url));
      }
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL(loginPath, req.url));
    }
  }

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

  if (token.role === "admin") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/lecturer") && token.role !== "lecturer") {
    return NextResponse.redirect(new URL(getRoleHome(token.role), req.url));
  }

  if (pathname.startsWith("/principal") && token.role !== "principal") {
    return NextResponse.redirect(new URL(getRoleHome(token.role), req.url));
  }

  if (pathname.startsWith("/student") && token.role !== "student") {
    return NextResponse.redirect(new URL(getRoleHome(token.role), req.url));
  }

  if (pathname.startsWith("/dashboards") && token.role !== "lecturer") {
    return NextResponse.redirect(new URL(getRoleHome(token.role), req.url));
  }

  if (pathname.startsWith("/admin-panel") && token.role !== "admin") {
    return NextResponse.redirect(new URL(getRoleHome(token.role), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/lecturer/:path*",
    "/principal/:path*",
    "/student/:path*",
    "/dashboards/:path*",
    "/admin-panel/:path*",
    "/invigilation/:path*",
    "/timetable-management/:path*",
  ],
};

