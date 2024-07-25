import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
export { default } from "next-auth/middleware";

// Custom middleware logic
export async function middleware(request: NextRequest) {
  // Retrieve the authentication token
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Log the request path and token for debugging
  console.log("Request path:", url.pathname);
  console.log("Token:", token);

  // Redirect authenticated users away from certain routes
  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/verify") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname === "/")
  ) {
    console.log("Redirecting authenticated user to /secure/dashboard");
    return NextResponse.redirect(new URL("/secure/dashboard", request.url));
  }

  // Redirect unauthenticated users away from certain routes
  if (
    !token &&
    (url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/user") ||
      url.pathname.startsWith("/practice") ||
      url.pathname.startsWith("/analyse") ||
      url.pathname.startsWith("/upgrade"))
  ) {
    console.log("Redirecting unauthenticated user to /");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow the request to proceed if none of the conditions match
  console.log("Allowing request to proceed");
  return NextResponse.next();
}
