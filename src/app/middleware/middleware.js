//src/app/middleware/middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const LOGIN_PATHS = [
  "/auth/login",
  "/admin/login",
  "/lecturer/login",
  "/office/login",
  "/principal/login",
  "/student/login",
];

function getRoleHome(role) {
  if (role === "admin") return "/admin-panel";
  if (role === "lecturer") return "/dashboards";
  if (role === "office") return "/office/dashboard";
  if (role === "principal") return "/principal/dashboard";
  if (role === "student") return "/student/dashboard";
  return "/auth/login";
}

function getLoginPath(pathname) {
  if (pathname.startsWith("/student")) return "/student/login";
  if (pathname.startsWith("/principal")) return "/principal/login";
  if (pathname.startsWith("/lecturer") || pathname.startsWith("/dashboards")) {
    return "/lecturer/login";
  }
  if (pathname.startsWith("/office")) return "/office/login";
  if (pathname.startsWith("/admin-panel")) return "/admin/login";
  return "/auth/login";
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/invigilation") || pathname.startsWith("/timetable-management")) {
    const isInvigilationRoute = pathname.startsWith("/invigilation");
    const moduleBase = isInvigilationRoute ? "/invigilation" : "/timetable-management";
    const loginPath = "/auth/login";

    // The module roots and the first-run admin bootstrap page are public.
    // `/invigilation/setup` is protected server-side by ADMIN_SETUP_KEY in
    // /api/auth/register-admin, mirroring the public `/admin/setup` page.
    if (
      pathname === moduleBase ||
      pathname === "/invigilation/setup" ||
      pathname === "/timetable-management/setup"
    ) {
      return NextResponse.next();
    }

    const moduleToken = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!moduleToken) {
      return NextResponse.redirect(new URL(loginPath, req.url));
    }

    const role = moduleToken.role;
    if (pathname.startsWith(`${moduleBase}/admin`) && role !== "admin") {
      return NextResponse.redirect(new URL(getRoleHome(role), req.url));
    }
    if (pathname.startsWith(`${moduleBase}/lecturer`) && role !== "lecturer") {
      return NextResponse.redirect(new URL(getRoleHome(role), req.url));
    }
    return NextResponse.next();
  }

  if (LOGIN_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL(getLoginPath(pathname), req.url));
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

  if (pathname.startsWith("/office") && token.role !== "office") {
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
    "/office/:path*",
    "/dashboards/:path*",
    "/admin-panel/:path*",
    "/invigilation/:path*",
    "/timetable-management/:path*",
  ],
};
