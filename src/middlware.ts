import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
export { default } from "next-auth/middleware";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    salt: process.env.NEXTAUTH_SALT || "",
    secret: process.env.NEXTAUTH_SECRET || "",
  });
  const url = request.nextUrl;

  if (
    (token &&
      (url.pathname.startsWith("/sign-in") ||
        url.pathname.startsWith("/sign-up") ||
        url.pathname.startsWith("/verify"))) ||
    url.pathname === "/"
  ) {
    return NextResponse.redirect(new URL("/dashbaord", request.url));
  }

  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sign-in", "sign-up", "dashbaord/:path*", "/verify/:path*"],
};
