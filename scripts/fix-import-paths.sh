#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Fix Import Paths - Update to Prefixed Folders           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

DOMAINS_DIR="/workspaces/ZacAi-Atomic/src/ai/knowledge-domains"
MODELS_DIR="/workspaces/ZacAi-Atomic/src/ai/models"

total_fixed=0

echo "🔍 Scanning knowledge domains for incorrect import paths..."
echo ""

# Process each domain
for domain_dir in "$DOMAINS_DIR"/*; do
    if [ -d "$domain_dir" ]; then
        domain_name=$(basename "$domain_dir")
        
        # Find all TypeScript files in this domain
        ts_files=$(find "$domain_dir" -maxdepth 1 -name "*.ts" -o -name "*.tsx")
        
        for file in $ts_files; do
            if [ -f "$file" ]; then
                # Check if file has old import paths
                if grep -q "from \"./weights/" "$file" || grep -q "from \"./seeds/" "$file" || grep -q "from \"./tools/" "$file"; then
                    echo "📝 Fixing: $(basename "$file") in $domain_name"
                    
                    # Fix weights imports
                    sed -i "s|from \"./weights/|from \"./${domain_name}_weights/|g" "$file"
                    
                    # Fix seeds imports
                    sed -i "s|from \"./seeds/|from \"./${domain_name}_seeds/|g" "$file"
                    
                    # Fix tools imports
                    sed -i "s|from \"./tools/|from \"./${domain_name}_tools/|g" "$file"
                    
                    total_fixed=$((total_fixed + 1))
                fi
            fi
        done
    fi
done

echo ""
echo "🤖 Scanning AI models for incorrect import paths..."
echo ""

# Process each model
for model_dir in "$MODELS_DIR"/*; do
    if [ -d "$model_dir" ]; then
        model_name=$(basename "$model_dir")
        
        if [ "$model_name" = "shared" ]; then
            continue
        fi
        
        # Find all TypeScript files in this model
        ts_files=$(find "$model_dir" -name "*.ts" -o -name "*.tsx")
        
        for file in $ts_files; do
            if [ -f "$file" ]; then
                # Get the old short prefix
                old_prefix=""
                case "$model_name" in
                    "code-transformer") old_prefix="code-" ;;
                    "convolutional-neural-network") old_prefix="cnn-" ;;
                    "diffusion-model") old_prefix="diffusion-" ;;
                    "generative-adversarial-network") old_prefix="gan-" ;;
                    "graph-neural-network") old_prefix="gnn-" ;;
                    "multi-modal-fusion") old_prefix="multimodal-" ;;
                    "neuro-symbolic-reasoning") old_prefix="neuro-" ;;
                    "recurrent-neural-network") old_prefix="rnn-" ;;
                    "speech-to-text") old_prefix="stt-" ;;
                    "text-to-speech") old_prefix="tts-" ;;
                    "unified-transformer-llm") old_prefix="llm-" ;;
                    "vision-transformer") old_prefix="vit-" ;;
                    "wavenet-audio-model") old_prefix="wavenet-" ;;
                esac
                
                if [ -n "$old_prefix" ]; then
                    # Check if file has old import paths with short prefix
                    if grep -q "from \"./${old_prefix}" "$file" || grep -q "from \"../${old_prefix}" "$file"; then
                        echo "📝 Fixing: $(basename "$file") in $model_name"
                        
                        # Fix relative imports with old prefix
                        sed -i "s|from \"./${old_prefix}|from \"./${model_name}_|g" "$file"
                        sed -i "s|from \"../${old_prefix}|from \"../${model_name}_|g" "$file"
                        
                        total_fixed=$((total_fixed + 1))
                    fi
                fi
            fi
        done
    fi
done

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Import Path Fix Complete!                               ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Fixed $total_fixed files with incorrect import paths"
echo ""
