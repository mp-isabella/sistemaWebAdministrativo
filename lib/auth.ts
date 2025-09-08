import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("🔐 Iniciando autorización de credenciales...");
          
          if (!credentials?.email || !credentials?.password) {
            console.log("❌ Credenciales faltantes");
            return null;
          }

          const email = credentials.email.trim().toLowerCase();
          console.log("📧 Buscando usuario con email:", email);

          const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
          });

          if (!user) {
            console.log("❌ Usuario no encontrado:", email);
            return null;
          }

          if (!user.isActive) {
            console.log("❌ Usuario inactivo:", email);
            return null;
          }

          console.log("✅ Usuario encontrado, verificando contraseña...");

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            console.log("❌ Contraseña inválida para usuario:", email);
            return null;
          }

          console.log("✅ Autenticación exitosa para usuario:", email);
          console.log("👤 Rol del usuario:", user.role.name);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.name.toLowerCase(), // Convertir a minúsculas para consistencia
          };
        } catch (error) {
          console.error("💥 Error en authorize:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 60 * 60, // 1 hora
  },
  jwt: {
    maxAge: 60 * 60, // 1 hora
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
      if (session.user && token.sub && token.role) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: false,
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: false,
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
