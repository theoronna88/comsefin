import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { User } from "next-auth";

// Estende os tipos do NextAuth para incluir os tokens do Conta Azul
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}

// Token da Conta Azul expira em 1 hora - forçamos logout para refazer autenticação
const TOKEN_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hora em milissegundos

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "conta-azul",
      name: "Conta Azul",
      credentials: {
        accessToken: { type: "hidden" },
        refreshToken: { type: "hidden" },
        expiresIn: { type: "hidden" },
      },
      async authorize(credentials) {
        // Valida os tokens recebidos do callback do Conta Azul
        if (!credentials?.accessToken || !credentials?.refreshToken) {
          console.error("Tokens não fornecidos");
          return null;
        }

        // Retorna o usuário com os tokens
        return {
          id: "conta-azul-user",
          name: "Usuário Conta Azul",
          email: null,
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken,
          expiresIn: Number(credentials.expiresIn) || 3600,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    // Tempo máximo da sessão - 1 hora (token da Conta Azul expira)
    maxAge: 60 * 60, // 1 hora em segundos
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      // Login inicial - salva os tokens do Conta Azul
      if (user) {
        return {
          ...token,
          id: user.id,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + TOKEN_EXPIRATION_TIME,
        };
      }

      // Verifica se o token expirou - força logout
      if (token.accessTokenExpires && Date.now() >= token.accessTokenExpires) {
        console.log("Token da Conta Azul expirou, forçando logout...");
        return {
          ...token,
          error: "TokenExpiredError",
        };
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Passa os tokens para a sessão do cliente
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.accessTokenExpires = token.accessTokenExpires;
      session.error = token.error;

      if (token.id) {
        session.user.id = token.id;
      }

      return session;
    },
  },
  pages: {
    signIn: "/", // Redireciona para a página inicial (login Conta Azul)
    error: "/", // Em caso de erro, volta para o login
  },
  secret: process.env.NEXTAUTH_SECRET,
};
