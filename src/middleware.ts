import { withAuth } from '@kinde-oss/kinde-auth-nextjs/middleware'
export default withAuth({
  // options here (e.g., loginPage, publicPaths, isAuthorized)
});
export const config = {
  matcher: ["/dashboard/:path*",'/billing/:path*','/pricing/:path*', "/auth-callback"]
}