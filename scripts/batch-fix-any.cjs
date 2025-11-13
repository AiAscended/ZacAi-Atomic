const { glob } = require('glob');
const fs = require('fs').promises;
const path = require('path');

async function fixAnyType() {
    try {
        const files = await glob('src/**/*.{ts,tsx}');
        
        for (const file of files) {
            let content = await fs.readFile(file, 'utf8');
            
            if (content.includes(': any')) {
                const updatedContent = content.replace(/: any/g, ': unknown');
                await fs.writeFile(file, updatedContent, 'utf8');
                console.log(`Replaced 'any' with 'unknown' in: ${file}`);
            }
        }
        console.log('Finished replacing "any" with "unknown".');
    } catch (err) {
        console.error('Error during script execution:', err);
    }
}

fixAnyType();
