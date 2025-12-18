const { glob } = require('glob');
const fs = require('fs').promises;
const path = require('path');

async function fixAnonymousExports() {
    try {
        const files = await glob('src/**/*.ts');
        
        for (const file of files) {
            let content = await fs.readFile(file, 'utf8');
            
            const regex = /export default ({[\s\S]*?});/s;
            const match = content.match(regex);

            if (match) {
                const objectContent = match[1];
                const variableName = path.basename(file).split('.')[0].replace(/-/g, '_') + '_bundle';
                
                const newContent = `const ${variableName} = ${objectContent};\n\nexport default ${variableName};`;
                content = content.replace(regex, newContent);

                await fs.writeFile(file, content, 'utf8');
                console.log(`Fixed anonymous export in: ${file}`);
            }
        }
        console.log('Finished fixing anonymous exports.');
    } catch (err) {
        console.error('Error during script execution:', err);
    }
}

fixAnonymousExports();
