import { prisma } from "@/lib/database";
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
        console.log('🔐 Intentando autenticar usuario:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credenciales faltantes');
          throw new Error("Credenciales faltantes");
        }

        const email = credentials.email.trim().toLowerCase();
        console.log('📧 Email procesado:', email);

        try {
          // Verificar conexión a la base de datos
          await prisma.$connect();
          console.log('✅ Conexión a base de datos exitosa');

          const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
          });

          if (!user) {
            console.log('❌ Usuario no encontrado:', email);
            throw new Error("Usuario no encontrado");
          }

          console.log('✅ Usuario encontrado:', user.name, 'Rol:', user.role.name);

          if (!user.isActive) {
            console.log('❌ Usuario inactivo');
            throw new Error("Usuario inactivo");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            console.log('❌ Contraseña inválida');
            throw new Error("Contraseña inválida");
          }

          console.log('✅ Autenticación exitosa para:', user.name);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.name,
          };
        } catch (error) {
          console.error('❌ Error en autenticación:', error instanceof Error ? error.message : String(error));
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
    async jwt({ token, user }) {
      // Si es la primera vez que se crea el token (después del login)
      if (user) {
        token.id = user.id;
        token.role = user.role || '';
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Pasar datos del token a la sesión
      if (token && session.user) {
        session.user.id = token.sub || '';
        session.user.role = token.role || '';
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || "clave-unica-definitiva-2024-12345",
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
      }
    }
  }
};
