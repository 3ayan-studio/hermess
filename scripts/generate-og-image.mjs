import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const logoPath = path.join(rootDir, 'public', 'hermess-logo.svg');
const outputSvgPath = path.join(rootDir, 'public', 'og-image.svg');
const outputPngPath = path.join(rootDir, 'public', 'og-image.png');

console.log('--> Lecture du logo source :', logoPath);
const logoContent = fs.readFileSync(logoPath, 'utf-8');

// Extraction du contenu interne du SVG (en ignorant les balises <svg> englobantes)
const innerMatch = logoContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
if (!innerMatch) {
  console.error('Erreur : balise <svg> introuvable dans hermess-logo.svg');
  process.exit(1);
}

const innerSvg = innerMatch[1];

// Dimensions officielles Open Graph / Twitter Card Large
// Largeur : 1200 px, Hauteur : 630 px
// Ratio viewBox logo original : 466.27333 x 267.15055 (ratio ~1.745)
// Largeur cible logo dans la bannière : 480 px
// Hauteur cible logo : 480 * (267.15055 / 466.27333) = ~275.02 px
// Centrage parfait :
// x = (1200 - 480) / 2 = 360 px
// y = (630 - 275.02) / 2 = ~177.49 px
// Échelle : 480 / 466.27333 = ~1.029439
const ogSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <title>Hermess — Fatima-Marwa Zouzal</title>
  <rect width="1200" height="630" fill="#e66202"/>
  <g id="hermess-logo-mark" fill="#ffffff" transform="translate(360, 177.49) scale(1.029439)">
    ${innerSvg}
  </g>
</svg>
`;

fs.writeFileSync(outputSvgPath, ogSvgContent, 'utf-8');
console.log('✓ SVG généré avec succès :', outputSvgPath);

const forcePng = process.argv.includes('--force');

// Si sous macOS, génération automatique du PNG 1200x630 uniquement avec --force ou si le PNG n'existe pas encore
if (process.platform === 'darwin') {
  if (fs.existsSync(outputPngPath) && !forcePng) {
    console.log(`ℹ Le fichier PNG personnalisé existe déjà (${outputPngPath}). Conservation du PNG existant. (Utilisez --force pour regénérer automatiquement)`);
  } else {
    try {
      console.log('--> Compilation du PNG 1200x630 via les outils natifs macOS (qlmanage & sips)...');
      const tmpDir = '/tmp';
      const tmpPng = path.join(tmpDir, 'og-image.svg.png');
      
      // Génère un rendu Quick Look 1200 px
      execSync(`qlmanage -t -s 1200 -o ${tmpDir} "${outputSvgPath}" > /dev/null 2>&1`);
      
      // Recadre précisément au centre à 1200x630
      execSync(`sips --cropToHeightWidth 630 1200 "${tmpPng}" --out "${outputPngPath}" > /dev/null 2>&1`);
      
      // Nettoyage temporaire
      if (fs.existsSync(tmpPng)) {
        fs.unlinkSync(tmpPng);
      }
      
      const stats = fs.statSync(outputPngPath);
      console.log(`✓ PNG généré avec succès : ${outputPngPath} (${Math.round(stats.size / 1024)} Ko)`);
    } catch (err) {
      console.warn('Avertissement : échec de la génération automatique du PNG via macOS :', err.message);
    }
  }
} else {
  console.log('Info : environnement non-macOS détecté. Le fichier public/og-image.png existant est conservé.');
}

