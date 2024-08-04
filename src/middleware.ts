import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Skip API routes
  if (url.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  console.log("Request path:", url.pathname);
  console.log("Token:", token);

  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/verify") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    !token &&
    (url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/practice") ||
      url.pathname.startsWith("/analyse") ||
      url.pathname.startsWith("/grader") ||
      url.pathname.startsWith("/personalise") ||
      url.pathname.startsWith("/upgrade"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
