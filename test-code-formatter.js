// Test the response formatter with code blocks
const testResponse = `Here's a simple hello world function:

\`\`\`javascript
function helloWorld() {
  console.log("Hello, World!");
}
\`\`\`

And here's how to use it:

\`\`\`javascript
helloWorld(); // Output: Hello, World!
\`\`\`

This demonstrates basic JavaScript function syntax.`;

// Simulate the regex matching
const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
let match;
let codeBlocks = [];

while ((match = codeBlockRegex.exec(testResponse)) !== null) {
  console.log('Found code block:');
  console.log('  Language:', match[1] || 'unknown');
  console.log('  Code:', match[2].trim());
  console.log('  Full match:', match[0]);
  console.log('---');
  codeBlocks.push({
    language: match[1] || 'unknown',
    code: match[2].trim()
  });
}

console.log(`\nTotal code blocks found: ${codeBlocks.length}`);
