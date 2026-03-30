import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/entreprises/:path*",
    "/beneficiaires/:path*",
    "/recherche/:path*",
    "/admin/:path*",
    "/api/entreprises/:path*",
    "/api/beneficiaires/:path*",
    "/api/contacts/:path*",
    "/api/rappels/:path*",
  ],
};
