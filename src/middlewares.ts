import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
export { default } from "next-auth/middleware";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Redirecting to the correct page based on whether logged in or not
  if (
    token &&
    (url.pathname.startsWith("/auth/sign-in") ||
      url.pathname.startsWith("/auth/verify") ||
      url.pathname.startsWith("/auth/sign-up") ||
      url.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/secure/dashboard", request.url));
  }

  if (
    !token &&
    (url.pathname.startsWith("/secure/dashboard") ||
      url.pathname.startsWith("/secure/user") ||
      url.pathname.startsWith("/secure/practice") ||
      url.pathname.startsWith("/secure/analyse") ||
      url.pathname.startsWith("/secure/upgrade"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next(); // Ensure to call next() if no redirection is needed
}