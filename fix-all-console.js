const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript/TSX files with console statements
function getAllFilesWithConsole() {
    try {
        const result = execSync('grep -r "console\\." --include="*.ts" --include="*.tsx" . | grep -v node_modules | cut -d: -f1 | sort | uniq', {
            encoding: 'utf8',
            cwd: process.cwd()
        });
        return result.trim().split('\n').filter(f => f && !f.includes('node_modules'));
    } catch (error) {
        return [];
    }
}

function removeConsoleStatements(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return false;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let changes = 0;

        // Remove various console.log patterns
        const patterns = [
            // Simple console.log statements
            /^\s*console\.log\([^)]*\);\s*$/gm,
            // Multi-line console.log statements
            /^\s*console\.log\(\s*[\s\S]*?\);\s*$/gm,
            // Console.log with template literals
            /^\s*console\.log\(`[\s\S]*?`\);\s*$/gm,
            // Console.log with string concatenation
            /^\s*console\.log\([^)]*\+[^)]*\);\s*$/gm,
            // Console.log with object spread
            /^\s*console\.log\(\{[^}]*\}[^)]*\);\s*$/gm,
            // Console.log with array
            /^\s*console\.log\(\[[^\]]*\][^)]*\);\s*$/gm
        ];

        patterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                content = content.replace(pattern, '');
                changes += matches.length;
            }
        });

        // Clean up multiple empty lines
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Processed: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

// Get all files with console statements
const files = getAllFilesWithConsole();

if (files.length === 0) {
    process.exit(0);
}
let processedCount = 0;
files.forEach(file => {
    if (removeConsoleStatements(file)) {
        processedCount++;
    }
});
