const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

exec("grep -r -l 'import/no-anonymous-default-export' .", (err, stdout, stderr) => {
    if (err) {
        console.error(`Error finding files: ${stderr}`);
        return;
    }

    const files = stdout.split('\n').filter(f => f.endsWith('.ts'));

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
                const variableName = path.basename(file).split('.')[0].replace(/-/g, '_') + '_bundle';
                
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
