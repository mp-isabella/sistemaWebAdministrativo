// Global type declarations to resolve missing type definition errors
declare module 'd3-color' {}
declare module 'd3-ease' {}
declare module 'd3-path' {}
declare module 'd3-time' {}
declare module 'd3-timer' {}
declare module 'd3-array' {}
declare module 'd3-scale' {}
declare module 'd3-shape' {}
declare module 'd3-interpolate' {}
declare module 'json5' {}
declare module 'pako' {}
declare module 'trusted-types' {}
declare module 'use-sync-external-store' {}
declare module 'yauzl' {}
declare module 'raf' {}
declare module 'uuid' {}
declare module 'zen-observable' {}

// Ensure Node.js types are available
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    [key: string]: string | undefined
  }
}

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
  
  interface User {
    id: string
    email: string
    name: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    remember: boolean
  }
}
