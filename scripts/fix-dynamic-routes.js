#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

async function fixDynamicRoutes() {
    console.log('🔧 Fixing dynamic routes in API...');

    try {
        // Find all API route files
        const apiFiles = glob.sync('app/api/**/route.ts', { cwd: process.cwd() });

        let fixedCount = 0;

        for (const file of apiFiles) {
            const filePath = path.join(process.cwd(), file);
            const content = fs.readFileSync(filePath, 'utf8');

            // Check if file uses getServerSession and doesn't already have dynamic export
            if (content.includes('getServerSession') && !content.includes('export const dynamic')) {
                console.log(`📝 Fixing ${file}...`);

                // Find the import section and add dynamic export after it
                const lines = content.split('\n');
                let insertIndex = -1;

                // Find the last import line
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith('import ') || lines[i].startsWith("import ")) {
                        insertIndex = i;
                    }
                }

                if (insertIndex !== -1) {
                    // Insert dynamic export after the last import
                    lines.splice(insertIndex + 1, 0, '');
                    lines.splice(insertIndex + 2, 0, '// Force dynamic rendering for this route');
                    lines.splice(insertIndex + 3, 0, "export const dynamic = 'force-dynamic'");

                    const newContent = lines.join('\n');
                    fs.writeFileSync(filePath, newContent);
                    fixedCount++;
                }
            }
        }

        console.log(`✅ Fixed ${fixedCount} API routes`);
        return true;

    } catch (error) {
        console.error('❌ Error fixing dynamic routes:', error);
        return false;
    }
}

// Run the fix
fixDynamicRoutes()
    .then(success => {
        if (success) {
            console.log('✅ Dynamic routes fix completed successfully');
            process.exit(0);
        } else {
            console.log('❌ Dynamic routes fix failed');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Dynamic routes fix error:', error);
        process.exit(1);
    });
