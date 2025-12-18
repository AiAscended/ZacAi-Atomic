const fs = require('fs');
const path = require('path');

const files = [
  '/workspaces/ZacAi-Atomic/src/ai/models/multi-modal-fusion/multi-modal-fusion_inference/multimodal-inferenceEngine.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/multi-modal-fusion/multi-modal-fusion_model/multimodal-core.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/multi-modal-fusion/multi-modal-fusion_model/multimodal-layers.ts'
];

files.forEach(file => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${file}:`, err);
      return;
    }

    const updatedData = data.replace(/: any/g, ': unknown');

    fs.writeFile(file, updatedData, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing file ${file}:`, err);
      } else {
        console.log(`Replaced 'any' with 'unknown' in ${file}`);
      }
    });
  });
});
