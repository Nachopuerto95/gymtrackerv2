#!/bin/bash

# Script para generar iconos PWA desde el SVG
# Requiere ImageMagick: brew install imagemagick (Mac) o apt install imagemagick (Linux)

ICON_DIR="public/icons"
SVG_FILE="$ICON_DIR/icon.svg"

SIZES=(72 96 128 144 152 192 384 512)

echo "Generando iconos PWA..."

for size in "${SIZES[@]}"; do
  echo "Creando icon-${size}x${size}.png"
  convert -background none -resize ${size}x${size} "$SVG_FILE" "$ICON_DIR/icon-${size}x${size}.png"
done

echo "Iconos generados correctamente!"
