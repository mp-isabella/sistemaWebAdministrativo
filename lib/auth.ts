import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {

          if (!credentials?.email || !credentials?.password) {

            throw new Error("Credenciales faltantes");
          }

          const email = credentials.email.trim().toLowerCase();

          // Verificar conexión a la base de datos
          try {
            await prisma.$connect();

          } catch (dbError) {

            throw new Error("Error de conexión a base de datos");
          }

          const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
          });

          if (!user) {

            throw new Error("Usuario no encontrado");
          }

          if (!user.isActive) {

            throw new Error("Usuario inactivo");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {

            throw new Error("Contraseña inválida");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.name,
          };
        } catch (error) {

          // Re-lanzar el error para que NextAuth lo maneje correctamente
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 horas
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session?.user && token?.sub && token?.role) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false
      }
    }
  },
};
