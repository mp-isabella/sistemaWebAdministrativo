const fs = require('fs');
const path = require('path');

// List of files to process (most critical ones first)
const filesToProcess = [
    'app/dashboard/billing/page.tsx',
    'app/dashboard/clients/page.tsx',
    'app/dashboard/cash/page.tsx',
    'app/dashboard/my-jobs/page.tsx',
    'app/dashboard/admin/page.tsx',
    'components/calendar/calendar-dashboard.tsx',
    'components/dashboard/job-management-modal.tsx',
    'components/auth/role-guard.tsx',
    'app/dashboard/liquidations/[id]/page.tsx',
    'app/dashboard/liquidations/[id]/edit/page.tsx',
    'app/dashboard/jobs/pending-payments/page.tsx',
    'app/dashboard/cash/balance/page.tsx'
];

function removeConsoleStatements(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Remove console.log statements (but keep console.error and console.warn for debugging)
        content = content.replace(/^\s*console\.log\([^)]*\);\s*$/gm, '');
        content = content.replace(/^\s*console\.log\([^)]*\);\s*$/gm, '');

        // Remove console.log statements that span multiple lines
        content = content.replace(/^\s*console\.log\(\s*[\s\S]*?\);\s*$/gm, '');

        // Remove console.log statements with template literals
        content = content.replace(/^\s*console\.log\(`[\s\S]*?`\);\s*$/gm, '');

        // Remove console.log statements with string concatenation
        content = content.replace(/^\s*console\.log\([^)]*\+[^)]*\);\s*$/gm, '');

        // Clean up empty lines that might be left behind
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
        } else {
        }
    } catch (error) {
    }
}

// Process each file
filesToProcess.forEach(file => {
    removeConsoleStatements(file);
});
