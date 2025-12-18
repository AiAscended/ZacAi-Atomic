const { glob } = require('glob');
const fs = require('fs').promises;
const path = require('path');

async function fixUnusedVars() {
    try {
        const files = await glob('src/**/*.{ts,tsx,js,cjs}');
        
        for (const file of files) {
            let content = await fs.readFile(file, 'utf8');
            let originalContent = content;

            const unusedVarRegex = /'(_?[\w\d]+)' is defined but never used/g;
            let match;
            
            const buildLog = `...`; // In a real scenario, you'd get this from the build output

            while ((match = unusedVarRegex.exec(buildLog)) !== null) {
                const varName = match[1];
                if (content.includes(varName)) {
                    const searchRegex = new RegExp(`\\b(let|const|var)\\s+${varName}\\b`, 'g');
                    content = content.replace(searchRegex, `let _${varName}`);
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
