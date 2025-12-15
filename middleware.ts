import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Se o token expirou ou houver erro, redireciona para login
    if (
      token?.error === "RefreshAccessTokenError" ||
      token?.error === "TokenExpiredError"
    ) {
      const url = new URL("/", req.url);
      url.searchParams.set("error", "session_expired");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Permite acesso apenas se tiver um token válido
        return !!token && !token.error;
      },
    },
    pages: {
      signIn: "/", // Redireciona para página inicial (login Conta Azul)
    },
  }
);

export const config = {
  matcher: [
    // Protege todas as rotas /user/*
    "/user/:path*",
    // Não protege as rotas públicas
    // Exclui explicitamente rotas que não devem ser protegidas
  ],
};
