const { glob } = require('glob');
const fs = require('fs').promises;
const path = require('path');

async function fixUnusedVars() {
    try {
        const files = await glob('src/**/*.{ts,tsx,js,cjs}');
        
        for (const file of files) {
            let content = await fs.readFile(file, 'utf8');
            let originalContent = content;

            // This regex is a bit more complex to handle various declaration scenarios
            const unusedVarRegex = /'(_?[\w\d]+)' is defined but never used/g;
            
            // A simple regex to find declarations and prefix them.
            // This is not perfect and might have edge cases, but it's a start.
            const declarations = content.matchAll(/((?:const|let|var)\s+)(\w+)/g);

            for (const declaration of declarations) {
                const varName = declaration[2];
                if (originalContent.includes(`'${varName}' is defined but never used`)) {
                    const searchRegex = new RegExp(`\\b${varName}\\b`, 'g');
                    content = content.replace(searchRegex, `_${varName}`);
                }
            }

            if (originalContent !== content) {
                await fs.writeFile(file, content, 'utf8');
                console.log(`Prefixed unused variables in: ${file}`);
            }
        }
        console.log('Finished prefixing unused variables.');
    } catch (err) {
        console.error('Error during script execution:', err);
    }
}

fixUnusedVars();
