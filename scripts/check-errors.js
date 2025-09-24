#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const checks = [
  {
    name: 'TypeScript Type Checking',
    command: 'npx tsc --noEmit',
    critical: true
  },
  {
    name: 'ESLint Linting',
    command: 'npx next lint',
    critical: true
  },
  {
    name: 'Prisma Schema Validation',
    command: 'npx prisma validate',
    critical: false
  }
];

let hasErrors = false;
let hasWarnings = false;

for (const check of checks) {
  try {
    execSync(check.command, { stdio: 'pipe' });
  } catch (error) {
    if (check.critical) {
      hasErrors = true;
    } else {
      hasWarnings = true;
    }
    
    if (error.stdout) {
      );
    }
    if (error.stderr) {
      );
    }
  }
}

// Verificar archivos específicos que podrían tener problemas
const criticalFiles = [
  'app/api/work-orders/[id]/route.ts',
  'app/api/work-orders/route.ts',
  'app/api/quotes/route.ts',
  'app/api/reports/route.ts'
];
for (const file of criticalFiles) {
  if (fs.existsSync(file)) {
    try {
      execSync(`npx tsc --noEmit ${file}`, { stdio: 'pipe' });
    } catch (error) {
      hasErrors = true;
      if (error.stdout) {
        );
      }
    }
  }
}

);

if (hasErrors) {
  process.exit(1);
} else if (hasWarnings) {
  process.exit(0);
} else {
  process.exit(0);
}
