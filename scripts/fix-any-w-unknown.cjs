const fs = require('fs');
const { exec } = require('child_process');

exec("grep -r -l 'Unexpected any' .", (err, stdout, stderr) => {
    if (err) {
        console.error(`Error finding files: ${stderr}`);
        return;
    }

    const files = stdout.split('\n').filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

    files.forEach(file => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading file ${file}:`, err);
                return;
            }

            const updatedData = data.replace(/: any/g, ': unknown');

            if (data !== updatedData) {
                fs.writeFile(file, updatedData, 'utf8', (err) => {
                    if (err) {
                        console.error(`Error writing file ${file}:`, err);
                    } else {
                        console.log(`Replaced 'any' with 'unknown' in ${file}`);
                    }
                });
            }
        });
    });
});
