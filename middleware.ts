import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Use the edge-safe config — middleware cannot bundle bcrypt/prisma.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|pricing|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};

export default middleware;
