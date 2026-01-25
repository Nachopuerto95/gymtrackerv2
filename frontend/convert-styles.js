#!/usr/bin/env node

/**
 * Script para convertir estilos en línea a archivos CSS
 *
 * Este script:
 * 1. Lee archivos JSX/JS con estilos en línea
 * 2. Extrae los objetos de estilos
 * 3. Genera archivos CSS con clases
 * 4. Actualiza los componentes para usar className
 */

const fs = require('fs');
const path = require('path');

// Función para convertir camelCase a kebab-case
function camelToKebab(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// Función para convertir valores de estilo JS a CSS
function convertStyleValue(key, value) {
  // Si es un número y no es una propiedad que acepta números sin unidad
  const unitlessProps = ['opacity', 'zIndex', 'fontWeight', 'lineHeight', 'flex', 'flexGrow', 'flexShrink', 'order'];

  if (typeof value === 'number' && !unitlessProps.includes(key)) {
    return `${value}px`;
  }

  return value;
}

// Función para convertir un objeto de estilos a CSS
function styleObjectToCSS(className, styleObj, indent = '') {
  let css = `${indent}.${className} {\n`;

  for (const [key, value] of Object.entries(styleObj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Manejar estilos anidados como hover, focus, etc.
      continue;
    }

    const cssKey = camelToKebab(key);
    const cssValue = convertStyleValue(key, value);
    css += `${indent}  ${cssKey}: ${cssValue};\n`;
  }

  css += `${indent}}\n`;
  return css;
}

// Función principal para convertir un archivo
function convertFile(filePath) {
  console.log(`\nProcesando: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf-8');

  // Buscar el objeto styles al final del archivo
  const stylesMatch = content.match(/const styles = \{([\s\S]*?)\};(?:\s*export|\s*$)/m);

  if (!stylesMatch) {
    console.log('  ⚠️  No se encontró objeto styles');
    return;
  }

  // Extraer nombre del componente del path
  const fileName = path.basename(filePath, path.extname(filePath));
  const componentPrefix = fileName.toLowerCase().replace(/page$/, '');

  console.log(`  📝 Generando CSS para ${fileName}...`);

  // Generar archivo CSS (placeholder - el usuario deberá refinar manualmente)
  const cssPath = filePath.replace(/\.(jsx|js)$/, '.css');

  // Mensaje de lo que hay que hacer
  console.log(`  ✓ Crear archivo CSS: ${cssPath}`);
  console.log(`  ✓ Prefijo de clases: ${componentPrefix}-`);
  console.log(`  ✓ Reemplazar 'style={styles.X}' con 'className="${componentPrefix}-X"'`);
  console.log(`  ✓ Agregar import './${fileName}.css' al inicio`);
  console.log(`  ✓ Eliminar el objeto 'const styles = {...}'`);
}

// Función para procesar todos los archivos en un directorio
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.match(/\.(jsx|js)$/) && !file.includes('.test.') && !file.includes('.spec.')) {
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Solo procesar si tiene estilos en línea
      if (content.includes('style={') || content.includes('const styles = {')) {
        convertFile(fullPath);
      }
    }
  }
}

// Función para crear un template CSS básico
function generateCSSTemplate(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath, path.extname(filePath));
  const componentPrefix = fileName.toLowerCase().replace(/page$/, '');

  // Buscar todos los usos de styles.XXXX
  const styleReferences = [...content.matchAll(/styles\.(\w+)/g)];
  const uniqueStyles = [...new Set(styleReferences.map(m => m[1]))];

  let css = `/* Auto-generated CSS template for ${fileName} */\n`;
  css += `/* Revisar y ajustar los estilos según sea necesario */\n\n`;

  for (const styleName of uniqueStyles) {
    css += `.${componentPrefix}-${styleName} {\n`;
    css += `  /* Agregar estilos aquí */\n`;
    css += `}\n\n`;
  }

  const cssPath = filePath.replace(/\.(jsx|js)$/, '.css');
  fs.writeFileSync(cssPath, css);
  console.log(`  ✓ Template CSS creado: ${cssPath}`);

  return { cssPath, componentPrefix, uniqueStyles };
}

// Función para actualizar el componente
function updateComponent(filePath, componentPrefix, uniqueStyles) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath, path.extname(filePath));

  // Agregar import del CSS si no existe
  if (!content.includes(`./${fileName}.css`)) {
    // Buscar la última línea de import
    const importLines = content.match(/^import .+;$/gm) || [];
    const lastImport = importLines[importLines.length - 1];

    if (lastImport) {
      content = content.replace(
        lastImport,
        `${lastImport}\nimport './${fileName}.css';`
      );
    } else {
      // Si no hay imports, agregar al principio
      content = `import './${fileName}.css';\n${content}`;
    }
  }

  // Reemplazar style={styles.XXXX} con className="prefix-XXXX"
  for (const styleName of uniqueStyles) {
    // Reemplazar style={styles.styleName}
    content = content.replace(
      new RegExp(`style=\\{styles\\.${styleName}\\}`, 'g'),
      `className="${componentPrefix}-${camelToKebab(styleName)}"`
    );

    // Reemplazar style={{ ...styles.styleName, ... }}
    content = content.replace(
      new RegExp(`style=\\{\\{\\s*\\.\\.\\.styles\\.${styleName}[^}]*\\}\\}`, 'g'),
      `className="${componentPrefix}-${camelToKebab(styleName)}"`
    );
  }

  // Eliminar el objeto const styles = {...};
  content = content.replace(/const styles = \{[\s\S]*?\};(?:\s*(?:export default|export \{))?/m, '');

  // Limpiar líneas vacías múltiples
  content = content.replace(/\n\n\n+/g, '\n\n');

  fs.writeFileSync(filePath, content);
  console.log(`  ✓ Componente actualizado: ${filePath}`);
}

// Script principal
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Uso: node convert-styles.js [archivo.jsx] | [directorio]');
    console.log('\nEjemplos:');
    console.log('  node convert-styles.js src/pages/HomePage.jsx');
    console.log('  node convert-styles.js src/pages');
    console.log('  node convert-styles.js src/components');
    return;
  }

  const targetPath = args[0];
  const fullPath = path.resolve(targetPath);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ No existe: ${fullPath}`);
    return;
  }

  const stat = fs.statSync(fullPath);

  console.log('🔄 Iniciando conversión de estilos...\n');

  if (stat.isDirectory()) {
    processDirectory(fullPath);
  } else {
    convertFile(fullPath);
  }

  console.log('\n✅ Conversión completada');
  console.log('\n📋 Pasos siguientes:');
  console.log('   1. Revisar los archivos CSS generados');
  console.log('   2. Copiar los estilos del objeto styles a las clases CSS');
  console.log('   3. Actualizar las referencias style={} a className=""');
  console.log('   4. Eliminar los objetos const styles = {}');
  console.log('   5. Probar la aplicación');
}

// Función helper para generar todo automáticamente
function autoConvert(filePath) {
  try {
    const { componentPrefix, uniqueStyles } = generateCSSTemplate(filePath);
    updateComponent(filePath, componentPrefix, uniqueStyles);
    return true;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Si se pasa --auto, hacer conversión automática
if (process.argv.includes('--auto')) {
  console.log('🤖 Modo automático activado\n');

  const targetPath = process.argv[2] === '--auto' ? process.argv[3] : process.argv[2];

  if (!targetPath) {
    console.log('Uso: node convert-styles.js --auto [archivo.jsx]');
    return;
  }

  const fullPath = path.resolve(targetPath);

  if (fs.statSync(fullPath).isFile()) {
    autoConvert(fullPath);
  } else {
    console.error('El modo automático solo funciona con archivos individuales');
  }
} else {
  main();
}
