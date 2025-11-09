const fs = require('fs');
const path = require('path');

const files = [
  '/workspaces/ZacAi-Atomic/src/ai/models/multi-modal-fusion/multi-modal-fusion_shared/multimodal-constants.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/multi-modal-fusion/multi-modal-fusion_shared/multimodal-utils.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/recurrent-neural-network/recurrent-neural-network_shared/rnn-constants.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/recurrent-neural-network/recurrent-neural-network_shared/rnn-utils.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/speech-to-text/speech-to-text_shared/stt-constants.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/speech-to-text/speech-to-text_shared/stt-utils.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/text-to-speech/text-to-speech_shared/tts-constants.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/text-to-speech/text-to-speech_shared/tts-utils.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/vision-transformer/vision-transformer_shared/vit-constants.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/vision-transformer/vision-transformer_shared/vit-utils.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/wavenet-audio-model/wavenet-audio-model_shared/wavenet-constants.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/wavenet-audio-model/wavenet-audio-model_shared/wavenet-utils.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/generative-adversarial-network/generative-adversarial-network_shared/gan-constants.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/generative-adversarial-network/generative-adversarial-network_shared/gan-utils.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/diffusion-model/diffusion-model_shared/diffusion-constants.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/diffusion-model/diffusion-model_shared/diffusion-utils.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/graph-neural-network/graph-neural-network_shared/gnn-constants.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/graph-neural-network/graph-neural-network_shared/gnn-utils.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/neuro-symbolic-reasoning/neuro-symbolic-reasoning_shared/neuro-constants.ts',
  '/workspaces/ZacAi-Atomic/src/ai/models/neuro-symbolic-reasoning/neuro-symbolic-reasoning_shared/neuro-utils.ts'
];

files.forEach(file => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${file}:`, err);
      return;
    }

    const regex = /export default ({.*});/s;
    const match = data.match(regex);

    if (match) {
      const objectContent = match[1];
      const variableName = path.basename(file).split('-')[0] + 'Bundle';
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
