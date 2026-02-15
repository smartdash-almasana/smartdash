#!/usr/bin/env bash

# install.sh —
# Registra Skills para Codex en SmartSeller

set -e

echo "=== Inicializando instalación de Skills en Codex CLI ==="

# Directorio de skills en proyecto (fuente de verdad)
SOURCE_SKILLS_DIR=".agent/skills"
TARGET_SKILLS_DIR=".codex/skills"

echo "📁 Creando carpeta de skills en $TARGET_SKILLS_DIR..."
mkdir -p "$TARGET_SKILLS_DIR"

# Lista de skills que REALMENTE existen en el repo
SKILL_NAMES=(
  "design-md"
  "enhance-prompt"
  "react-components"
  "remotion"
  "shadcn-ui"
  "stitch-loop"
)

for NAME in "${SKILL_NAMES[@]}"; do
  if [ -d "$SOURCE_SKILLS_DIR/$NAME" ]; then
    echo "📦 Instalando skill: $NAME"
    cp -R "$SOURCE_SKILLS_DIR/$NAME" "$TARGET_SKILLS_DIR/$NAME"
  else
    echo "⚠️ SKILL no encontrado: $SOURCE_SKILLS_DIR/$NAME — ignorando"
  fi
done

echo ""
echo "🛠 Skills registrados en $TARGET_SKILLS_DIR:"
ls -1 "$TARGET_SKILLS_DIR" 2>/dev/null || echo "(vacío)"

echo ""
echo "📌 Ahora reiniciá Codex CLI y ejecutá:"
echo "   codex --enable skills"
echo ""
echo "👍 Instalación completada!"
