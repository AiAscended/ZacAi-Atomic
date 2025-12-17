const fs = require('fs');
const { exec } = require('child_process');

exec("grep -r -l '@typescript-eslint/no-unused-vars' src", (err, stdout, stderr) => {
  if (err) {
    console.error("Error finding files:", stderr);
    return;
  }

  const files = stdout.split('\n').filter(f => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.cjs'));

  files.forEach(file => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${file}:`, err);
        return;
      }

      const lines = data.split('\n');
      const newLines = [];
      let changed = false;

      for (const line of lines) {
        const match = line.match(/'([^']*)' is defined but never used/);
        if (match) {
          const varName = match[1];
          const regex = new RegExp(`\\b${varName}\\b`, 'g');
          const updatedLine = line.replace(regex, `_${varName}`);
          newLines.push(updatedLine);
          changed = true;
        } else {
          newLines.push(line);
        }
      }

      if (changed) {
        fs.writeFile(file, newLines.join('\n'), 'utf8', (err) => {
          if (err) {
            console.error(`Error writing file ${file}:`, err);
          } else {
            console.log(`Fixed unused vars in ${file}`);
          }
        });
      }
    });
  });
});
