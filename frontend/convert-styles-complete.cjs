#!/usr/bin/env node

/**
 * Script completo para convertir estilos en línea a CSS
 */

const fs = require('fs');
const path = require('path');

// Convertir camelCase a kebab-case
function camelToKebab(str) {
  return str.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);
}

// Convertir valores de tema a valores CSS
function parseThemeValue(value) {
  if (typeof value === 'string') {
    // Reemplazar referencias al theme con valores reales
    const themeColors = {
      'theme.colors.primary.main': '#00E5CC',
      'theme.colors.primary.gradient': 'linear-gradient(to right, #00E5CC, #3B82F6)',
      'theme.colors.background.primary': '#0A0E12',
      'theme.colors.background.secondary': '#151921',
      'theme.colors.background.tertiary': '#1A1F2E',
      'theme.colors.background.overlay': 'rgba(10, 14, 18, 0.8)',
      'theme.colors.text.primary': '#FFFFFF',
      'theme.colors.text.secondary': '#9CA3AF',
      'theme.colors.text.tertiary': '#6B7280',
      'theme.colors.text.inverse': '#0A0E12',
      'theme.colors.border.main': '#2D3748',
      'theme.colors.border.light': '#374151',
      'theme.colors.success.main': '#10B981',
      'theme.colors.success.light': '#34D399',
      'theme.colors.error.main': '#EF4444',
      'theme.colors.error.background': 'rgba(239, 68, 68, 0.1)',
      'theme.colors.warning.main': '#EAB308',
      'theme.spacing.xs': '0.25rem',
      'theme.spacing.sm': '0.5rem',
      'theme.spacing.md': '1rem',
      'theme.spacing.lg': '1.25rem',
      'theme.spacing.xl': '2rem',
      'theme.borderRadius.sm': '0.25rem',
      'theme.borderRadius.md': '0.5rem',
      'theme.borderRadius.lg': '0.75rem',
      'theme.borderRadius.xl': '1rem',
      'theme.borderRadius.full': '9999px',
      'theme.typography.fontSize.xs': '0.75rem',
      'theme.typography.fontSize.sm': '0.875rem',
      'theme.typography.fontSize.base': '1rem',
      'theme.typography.fontSize.lg': '1.125rem',
      'theme.typography.fontSize.xl': '1.25rem',
      'theme.typography.fontSize.2xl': '1.5rem',
      'theme.typography.fontSize.4xl': '2.25rem',
      'theme.typography.fontWeight.normal': '400',
      'theme.typography.fontWeight.medium': '500',
      'theme.typography.fontWeight.semibold': '600',
      'theme.typography.fontWeight.bold': '700',
      'theme.shadows.glow': '0 0 20px rgba(0, 229, 204, 0.3)',
      'theme.shadows.lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      'theme.shadows.xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      'theme.animation.fast': '0.2s',
      'theme.animation.normal': '0.3s',
      'theme.easing.default': 'ease',
      'theme.zIndex.sticky': '10',
      'theme.zIndex.modal': '1000',
      'theme.touchTarget.min': '48px'
    };

    for (const [key, val] of Object.entries(themeColors)) {
      if (value.includes(key)) {
        value = value.replace(key, val);
      }
    }

    // Eliminar comillas de template literals si existen
    value = value.replace(/`([^`]*)`/g, '$1');
  }

  return value;
}

// Convertir objeto de estilo a CSS
function styleObjectToCSS(className, styleObj, prefix = '') {
  let css = '';

  for (const [key, value] of Object.entries(styleObj)) {
    if (typeof value === 'object' && value !== null) {
      // Objeto anidado - ignorar por ahora
      continue;
    }

    const cssKey = camelToKebab(key);
    let cssValue = parseThemeValue(String(value));

    // Agregar 'px' a números (excepto algunos casos especiales)
    const unitlessProps = ['opacity', 'zIndex', 'fontWeight', 'lineHeight', 'flex', 'flexGrow', 'flexShrink', 'order'];
    if (!isNaN(value) && !unitlessProps.includes(key)) {
      cssValue = `${value}px`;
    }

    css += `  ${cssKey}: ${cssValue};\n`;
  }

  return css;
}

// Extraer estilos de un archivo
function extractStyles(content) {
  // Buscar const styles = { ... };
  const match = content.match(/const styles = \{([\s\S]*?)\n\};/);

  if (!match) {
    return null;
  }

  const stylesContent = match[1];
  const styles = {};

  // Parsear cada estilo (simplificado)
  const styleRegex = /(\w+):\s*\{([^}]*)\}/g;
  let styleMatch;

  while ((styleMatch = styleRegex.exec(stylesContent)) !== null) {
    const styleName = styleMatch[1];
    const styleBody = styleMatch[2];

    styles[styleName] = {};

    // Parsear propiedades
    const propRegex = /(\w+):\s*'([^']*)'|(\w+):\s*"([^"]*)"|(\w+):\s*`([^`]*)`|(\w+):\s*([^,\n]+)/g;
    let propMatch;

    while ((propMatch = propRegex.exec(styleBody)) !== null) {
      const key = propMatch[1] || propMatch[3] || propMatch[5] || propMatch[7];
      const value = propMatch[2] || propMatch[4] || propMatch[6] || propMatch[8];

      if (key && value) {
        styles[styleName][key] = value.trim().replace(/[,;]/g, '');
      }
    }
  }

  return styles;
}

// Generar archivo CSS desde los estilos
function generateCSS(styles, prefix) {
  let css = `/* Auto-generated CSS */\n\n`;

  for (const [styleName, styleObj] of Object.entries(styles)) {
    const className = `${prefix}-${camelToKebab(styleName)}`;
    css += `.${className} {\n`;
    css += styleObjectToCSS(className, styleObj, prefix);
    css += `}\n\n`;
  }

  return css;
}

// Actualizar el componente
function updateComponentFile(content, styles, prefix, fileName) {
  // Agregar import del CSS
  if (!content.includes(`'./${fileName}.css'`)) {
    const importMatch = content.match(/(import[\s\S]*?;\n)+/);
    if (importMatch) {
      const lastImport = importMatch[0];
      content = content.replace(lastImport, `${lastImport}import './${fileName}.css';\n`);
    }
  }

  // Reemplazar style={styles.XXX} con className="prefix-xxx"
  for (const styleName of Object.keys(styles)) {
    const className = `${prefix}-${camelToKebab(styleName)}`;

    // Reemplazar style={styles.styleName}
    content = content.replace(
      new RegExp(`style=\\{styles\\.${styleName}\\}`, 'g'),
      `className="${className}"`
    );

    // Reemplazar style={...styles.styleName, ...}
    content = content.replace(
      new RegExp(`style=\\{\\{\\s*\\.\\.\\.styles\\.${styleName}[^}]*\\}\\}`, 'g'),
      `className="${className}"`
    );

    // Reemplazar {...styles.styleName}
    content = content.replace(
      new RegExp(`\\{\\.\\.\\. styles\\.${styleName}\\}`, 'g'),
      `className="${className}"`
    );
  }

  // Eliminar const styles = { ... };
  content = content.replace(/const styles = \{[\s\S]*?\n\};\n/m, '');

  // Limpiar líneas vacías extras
  content = content.replace(/\n{3,}/g, '\n\n');

  return content;
}

// Procesar un archivo
function processFile(filePath, dryRun = false) {
  console.log(`\n📄 Procesando: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath, path.extname(filePath));
  const prefix = fileName.toLowerCase().replace(/page$/, '').replace(/card$/, '-card').replace(/form$/, '-form');

  // Extraer estilos
  const styles = extractStyles(content);

  if (!styles || Object.keys(styles).length === 0) {
    console.log('  ⚠️  No se encontraron estilos');
    return;
  }

  console.log(`  ✓ Encontrados ${Object.keys(styles).length} estilos`);

  if (dryRun) {
    console.log(`  📋 Se crearían las siguientes clases:`);
    Object.keys(styles).forEach(s => {
      console.log(`     .${prefix}-${camelToKebab(s)}`);
    });
    return;
  }

  // Generar CSS
  const css = generateCSS(styles, prefix);
  const cssPath = filePath.replace(/\.(jsx|js)$/, '.css');

  fs.writeFileSync(cssPath, css);
  console.log(`  ✓ CSS generado: ${cssPath}`);

  // Actualizar componente
  const updatedContent = updateComponentFile(content, styles, prefix, fileName);
  fs.writeFileSync(filePath, updatedContent);
  console.log(`  ✓ Componente actualizado`);
}

// Procesar directorio
function processDirectory(dirPath, dryRun = false) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath, dryRun);
    } else if (item.match(/\.(jsx|js)$/) && !item.includes('convert-styles')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('const styles = {')) {
        try {
          processFile(fullPath, dryRun);
        } catch (error) {
          console.error(`  ❌ Error procesando ${fullPath}:`, error.message);
        }
      }
    }
  }
}

// Main
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const targetPath = args.find(arg => !arg.startsWith('--'));

if (!targetPath) {
  console.log(`
🎨 Conversor de Estilos en Línea a CSS

Uso:
  node convert-styles-complete.js [ruta] [--dry-run]

Ejemplos:
  node convert-styles-complete.js src/pages/HomePage.jsx
  node convert-styles-complete.js src/pages --dry-run
  node convert-styles-complete.js src/components/common

Opciones:
  --dry-run    Mostrar qué se haría sin hacer cambios
`);
  process.exit(0);
}

const fullPath = path.resolve(targetPath);

if (!fs.existsSync(fullPath)) {
  console.error(`❌ No existe: ${fullPath}`);
  process.exit(1);
}

console.log('🚀 Iniciando conversión...');
if (dryRun) {
  console.log('⚠️  Modo DRY RUN - no se harán cambios\n');
}

const stat = fs.statSync(fullPath);

if (stat.isFile()) {
  processFile(fullPath, dryRun);
} else {
  processDirectory(fullPath, dryRun);
}

console.log('\n✅ ¡Conversión completada!');

if (!dryRun) {
  console.log(`
📋 Siguientes pasos:
   1. Revisar los archivos CSS generados
   2. Ajustar estilos que usen theme.* manualmente si es necesario
   3. Probar la aplicación: npm run dev
   4. Ajustar clases CSS según sea necesario
`);
}
