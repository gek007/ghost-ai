import { clerkMiddleware } from "@clerk/nextjs/server";
import { SIGN_IN_URL, SIGN_UP_URL } from "@/lib/auth-routes";

// Early-redirect/session layer only. Authorization is enforced inside each
// protected page, route handler, and Server Function via `await auth.protect()`.
export default clerkMiddleware({ signInUrl: SIGN_IN_URL, signUpUrl: SIGN_UP_URL });

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
