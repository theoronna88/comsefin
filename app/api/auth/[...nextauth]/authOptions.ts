import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { Session, Account } from "next-auth";
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

// Função para renovar o token de acesso usando o refresh token
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const basicAuth = Buffer.from(
      `${process.env.NEXT_CLIENT_ID}:${process.env.NEXT_CLIENT_SECRET}`
    ).toString("base64");

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken as string,
    });

    const response = await fetch(process.env.NEXT_TOKEN_URL as string, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error("Erro ao renovar token:", refreshedTokens);
      throw new Error("Falha ao renovar token");
    }

    console.log("Token renovado com sucesso");

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
    };
  } catch (error) {
    console.error("Erro ao renovar access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

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
    // Tempo máximo da sessão - 7 dias (o refresh token permite renovar)
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user?: User;
      account?: Account | null;
    }) {
      // Login inicial - salva os tokens do Conta Azul
      if (user) {
        return {
          ...token,
          id: user.id,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + user.expiresIn * 1000,
        };
      }

      // Token ainda válido - retorna sem modificar
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Token expirado - tenta renovar
      console.log("Token expirado, tentando renovar...");
      return await refreshAccessToken(token);
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
