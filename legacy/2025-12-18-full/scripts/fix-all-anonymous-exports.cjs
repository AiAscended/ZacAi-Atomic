const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const directoryToScan = 'src/ai/models';

exec(`find ${directoryToScan} -type f -name "*-constants.ts" -o -name "*-utils.ts"`, (err, stdout, stderr) => {
    if (err) {
        console.error(`Error finding files: ${stderr}`);
        return;
    }

    const files = stdout.split('\n').filter(f => f.length > 0);

    files.forEach(file => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading file ${file}:`, err);
                return;
            }

            const regex = /export default ({[\s\S]*?});/s;
            const match = data.match(regex);

            if (match) {
                const objectContent = match[1];
                // Create a variable name from the file's directory structure
                const pathParts = path.dirname(file).split(path.sep);
                const modelName = pathParts[pathParts.length - 2] || 'default';
                const variableName = `${modelName.split('-')[0]}Bundle`;
                
                const newContent = `const ${variableName} = ${objectContent};\n\nexport default ${variableName};`;
                const updatedData = data.replace(regex, newContent);

                fs.writeFile(file, updatedData, 'utf8', (err) => {
                    if (err) {
                        console.error(`Error writing file ${file}:`, err);
                    } else {
                        console.log(`Successfully fixed anonymous export in ${file}`);
                    }
                });
            }
        });
    });
});
