import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { User } from "next-auth";
import { getContaFinanceira } from "@/app/api/conta-financeira";

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
    contaFinanceira?: string;
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    contaFinanceira?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    contaFinanceira?: string;
  }
}

// Token da Conta Azul expira em 1 hora - forçamos logout para refazer autenticação
// IMPORTANTE: Para testar a expiração em desenvolvimento, defina TOKEN_EXPIRATION_MINUTES no .env.local
// Exemplo: TOKEN_EXPIRATION_MINUTES=5 para expirar em 5 minutos
const getTokenExpirationTime = () => {
  const envMinutes = process.env.TOKEN_EXPIRATION_MINUTES;

  if (envMinutes) {
    const minutes = parseInt(envMinutes, 10);
    if (!isNaN(minutes) && minutes > 0) {
      console.log(
        `⚠️  [AUTH] Usando tempo de expiração personalizado: ${minutes} minutos`
      );
      return minutes * 60 * 1000; // Converte minutos para milissegundos
    }
  }

  // Padrão: 1 hora (60 minutos)
  return 60 * 60 * 1000;
};

const TOKEN_EXPIRATION_TIME = getTokenExpirationTime();

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

        const contaFinanceira = await getContaFinanceira({
          nome: process.env.NEXT_NOME_CONTA_FINANCEIRA,
          accessToken: credentials.accessToken,
        });

        if (!contaFinanceira) {
          console.error("Falha ao obter dados da conta financeira");
          return null;
        }

        console.log("Conta Financeira obtida com sucesso:", contaFinanceira);

        // Retorna o usuário com os tokens
        return {
          id: "conta-azul-user",
          name: "Usuário Conta Azul",
          email: null,
          contaFinanceira: contaFinanceira,
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
          contaFinanceira: user.contaFinanceira,
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
      session.contaFinanceira = token.contaFinanceira;

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
