#!/bin/bash

echo "==================================="
echo "ZacAi-Atomic AI Models Audit"
echo "==================================="
echo ""

MODELS=(
  "unified-transformer-llm:llm"
  "convolutional-neural-network:cnn"
  "recurrent-neural-network:rnn"
  "vision-transformer:vit"
  "generative-adversarial-network:gan"
  "diffusion-model:diffusion"
  "speech-to-text:stt"
  "text-to-speech:tts"
  "wavenet-audio-model:wavenet"
  "neuro-symbolic-reasoning:neuro"
  "graph-neural-network:gnn"
  "multi-modal-fusion:multimodal"
  "code-transformer:code"
)

REQUIRED_FOLDERS=(
  "config"
  "data"
  "model"
  "training"
  "inference"
  "weights"
  "tests"
  "shared"
)

TOTAL_MODELS=0
COMPLETE_MODELS=0
INCOMPLETE_MODELS=0

for model_entry in "${MODELS[@]}"; do
  IFS=':' read -r model prefix <<< "$model_entry"
  
  if [ ! -d "$model" ]; then
    echo "❌ Model directory missing: $model"
    continue
  fi
  
  TOTAL_MODELS=$((TOTAL_MODELS + 1))
  echo "📦 Checking: $model (prefix: $prefix-)"
  
  MISSING_FOLDERS=()
  for folder in "${REQUIRED_FOLDERS[@]}"; do
    prefixed_folder="${prefix}-${folder}"
    if [ ! -d "$model/$prefixed_folder" ]; then
      MISSING_FOLDERS+=("$prefixed_folder")
    fi
  done
  
  if [ ${#MISSING_FOLDERS[@]} -eq 0 ]; then
    file_count=$(find "$model" -type f | wc -l)
    echo "  ✅ Complete - $file_count files"
    COMPLETE_MODELS=$((COMPLETE_MODELS + 1))
  else
    echo "  ⚠️  Missing folders: ${MISSING_FOLDERS[*]}"
    INCOMPLETE_MODELS=$((INCOMPLETE_MODELS + 1))
  fi
  
  # Check for key files
  if [ -f "$model/README.md" ]; then
    echo "  ✓ README.md present"
  else
    echo "  ✗ README.md missing"
  fi
  
  if [ -f "$model/package.json" ]; then
    echo "  ✓ package.json present"
  else
    echo "  ✗ package.json missing"
  fi
  
  echo ""
done

echo "==================================="
echo "Summary:"
echo "==================================="
echo "Total Models: $TOTAL_MODELS"
echo "Complete Models: ✅ $COMPLETE_MODELS"
echo "Incomplete Models: ⚠️  $INCOMPLETE_MODELS"
echo ""

if [ $INCOMPLETE_MODELS -eq 0 ]; then
  echo "🎉 All models are complete!"
  exit 0
else
  echo "⚠️  Some models need attention"
  exit 1
fi
