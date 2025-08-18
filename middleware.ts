import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token, // Permite apenas se tiver token (JWT)
  },
  pages: {
    signIn: "/", // Redireciona para /login quando não autenticado
  },
});

export const config = {
  matcher: [
    "/user/:path*", // Protege apenas as rotas que começam com /user
    // "/conta-azul",
  ],
};
