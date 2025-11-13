const fs = require('fs');
const { exec } = require('child_process');

exec("grep -r -l '@typescript-eslint/no-unused-vars' src", (err, stdout, stderr) => {
  if (err) {
    console.error("Error finding files:", stderr);
    return;
  }

  const files = stdout.split('\n').filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

  files.forEach(file => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${file}:`, err);
        return;
      }

      let updatedData = data;
      const regex = /'([^']*)' is defined but never used/g;
      let match;
      while ((match = regex.exec(data)) !== null) {
        const varName = match[1];
        const replaceRegex = new RegExp(`\\b${varName}\\b`, 'g');
        updatedData = updatedData.replace(replaceRegex, `_${varName}`);
      }

      fs.writeFile(file, updatedData, 'utf8', (err) => {
        if (err) {
          console.error(`Error writing file ${file}:`, err);
        } else {
          console.log(`Prefixed unused variables in ${file}`);
        }
      });
    });
  });
});
