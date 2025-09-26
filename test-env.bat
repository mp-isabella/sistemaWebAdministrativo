@echo off
set DATABASE_URL=file:./dev.db
set NEXTAUTH_URL=http://localhost:3000
set NEXTAUTH_SECRET=desarrollo-local-secret-key-para-pruebas
set NODE_OPTIONS=--max-old-space-size=4096
set NEXT_TELEMETRY_DISABLED=1
npm run test:production
