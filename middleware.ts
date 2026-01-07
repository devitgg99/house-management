import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Role-based route mapping
const roleRoutes = {
  ADMIN: "/admin",
  HOUSEOWNER: "/owner",
  RENTER: "/renter",
} as const;

// Routes each role can access
const rolePermissions = {
  ADMIN: ["/admin", "/owner", "/renter"],
  HOUSEOWNER: ["/owner"],
  RENTER: ["/renter"],
} as const;

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Get the token using next-auth/jwt
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET || "super-secret-key" 
  });

  console.log("Middleware - pathname:", pathname);
  console.log("Middleware - token:", token);

  // If no token and trying to access protected routes, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = token.role as keyof typeof roleRoutes;
  console.log("Middleware - userRole:", userRole);

  // Redirect from /dashboard to role-specific dashboard
  if (pathname === "/dashboard") {
    const redirectPath = roleRoutes[userRole] || "/renter";
    console.log("Middleware - redirecting to:", `${redirectPath}/dashboard`);
    return NextResponse.redirect(new URL(`${redirectPath}/dashboard`, req.url));
  }

  // Check permissions for role-specific routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isOwnerRoute = pathname.startsWith("/owner");
  const isRenterRoute = pathname.startsWith("/renter");

  if (isAdminRoute || isOwnerRoute || isRenterRoute) {
    const allowedRoutes = rolePermissions[userRole] || [];
    const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

    if (!hasAccess) {
      const redirectPath = roleRoutes[userRole] || "/renter";
      return NextResponse.redirect(new URL(`${redirectPath}/dashboard`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/admin/:path*",
    "/owner/:path*",
    "/renter/:path*",
  ],
};
