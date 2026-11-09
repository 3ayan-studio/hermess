import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const carresPublicDir = path.join(rootDir, 'public', 'carres');
const expoPublicDir = path.join(rootDir, 'public', 'expo');
const mockFilePath = path.join(rootDir, 'src', 'app', 'core', 'data', 'carres.mock.ts');

const MAX_IMAGE_DIM = 1800;
const JPEG_QUALITY = 85;

const IMAGE_EXTS_WEB = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const IMAGE_EXTS_RAW = new Set(['.heic', '.heif', '.dng', '.raw', '.tiff', '.tif', '.bmp']);
const VIDEO_EXTS = new Set(['.mp4', '.mov', '.m4v', '.webm']);
const LEGACY_NAMES = new Set(['main.jpeg', 'main.jpg', 'detail.webp', 'worn.webp']);

/**
 * Exécute une commande shell de manière synchrone et silencieuse si succès.
 */
function runCmd(cmd) {
  try {
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error(`Erreur commande : ${cmd}`, error.message);
    return false;
  }
}

/**
 * Optimise une image web existante : si sa dimension maximale dépasse MAX_IMAGE_DIM (1800px),
 * elle est redimensionnée avec sips et compressée en JPEG à JPEG_QUALITY (85%).
 */
function optimizeWebImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!IMAGE_EXTS_WEB.has(ext) || ext === '.svg') return;

  try {
    const out = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}"`, { stdio: 'pipe' }).toString();
    let width = 0;
    let height = 0;
    for (const line of out.split('\n')) {
      if (line.includes('pixelWidth:')) width = parseInt(line.split(':')[1].trim(), 10);
      if (line.includes('pixelHeight:')) height = parseInt(line.split(':')[1].trim(), 10);
    }

    if (Math.max(width, height) > MAX_IMAGE_DIM) {
      console.log(`  --> [sips] Optimisation image (${width}x${height} -> max ${MAX_IMAGE_DIM}px) : ${path.basename(filePath)}`);
      const tmpPath = `${filePath}.tmp.jpg`;
      const ok = runCmd(`sips -Z ${MAX_IMAGE_DIM} -s format jpeg -s formatOptions ${JPEG_QUALITY} "${filePath}" --out "${tmpPath}"`);
      if (ok && fs.existsSync(tmpPath)) {
        fs.renameSync(tmpPath, filePath);
      }
    }
  } catch {
    // Échec silencieux si le fichier n'est pas lisible par sips
  }
}

/**
 * Convertit une image non-web (HEIC, DNG, etc.) en JPEG via l'utilitaire natif macOS sips avec redimensionnement Retina max.
 */
function convertImageIfNeeded(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (IMAGE_EXTS_RAW.has(ext)) {
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, path.extname(filePath));
    const targetJpgPath = path.join(dir, `${baseName}.jpg`);

    if (!fs.existsSync(targetJpgPath)) {
      console.log(`  --> [sips] Conversion image : ${path.basename(filePath)} -> ${path.basename(targetJpgPath)}`);
      const ok = runCmd(`sips -Z ${MAX_IMAGE_DIM} -s format jpeg -s formatOptions ${JPEG_QUALITY} "${filePath}" --out "${targetJpgPath}"`);
      if (ok) {
        return targetJpgPath;
      }
    } else {
      optimizeWebImage(targetJpgPath);
      return targetJpgPath;
    }
  }
  return filePath;
}

/**
 * Transcode une vidéo non-MP4 (.mov) en MP4 universel web via avconvert (720p HD web-optimisé) et extrait une frame poster.
 */
function convertVideoIfNeeded(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, path.extname(filePath));

  let mp4Path = filePath;
  if (ext === '.mov' || ext === '.m4v') {
    mp4Path = path.join(dir, `${baseName}.mp4`);
    if (!fs.existsSync(mp4Path)) {
      console.log(`  --> [avconvert] Transcodage vidéo : ${path.basename(filePath)} -> ${path.basename(mp4Path)}`);
      runCmd(`avconvert --source "${filePath}" --preset Preset1280x720 --output "${mp4Path}" --replace`);
    }
  }

  // Extraction d'une affiche poster pour la vidéo si absente
  const posterPath = path.join(dir, `${baseName}-poster.jpg`);
  if (!fs.existsSync(posterPath)) {
    console.log(`  --> [qlmanage & sips] Extraction poster vidéo pour : ${path.basename(mp4Path)}`);
    const tmpDir = '/tmp';
    const tmpPng = path.join(tmpDir, `${path.basename(mp4Path)}.png`);
    runCmd(`qlmanage -t -s 1200 -o ${tmpDir} "${mp4Path}"`);
    if (fs.existsSync(tmpPng)) {
      runCmd(`sips -Z ${MAX_IMAGE_DIM} -s format jpeg -s formatOptions ${JPEG_QUALITY} "${tmpPng}" --out "${posterPath}"`);
      fs.unlinkSync(tmpPng);
    }
  }

  return { mp4Path, posterPath: fs.existsSync(posterPath) ? posterPath : null };
}

/**
 * Supprime les fichiers d'anciens mocks (detail.webp, worn.webp, main.jpeg).
 */
function cleanLegacyFiles(dir) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    if (LEGACY_NAMES.has(entry.toLowerCase())) {
      const fullPath = path.join(dir, entry);
      fs.unlinkSync(fullPath);
      console.log(`  ✓ Ancien fichier supprimé : ${entry}`);
    }
  }
}

/**
 * Génère le texte alternatif en fonction du mot descriptif et du titre du carré.
 */
function generateAltText(word, index, carreTitle, isVideo) {
  const w = (word || '').toLowerCase();
  if (isVideo || w.includes('video') || w.includes('vent') || w.includes('geste')) {
    return `Geste textile et mouvement de soie ${carreTitle}`;
  }
  if (w.includes('detail') || w.includes('zoom') || w.includes('trame')) {
    return `Détail de la trame et des motifs de ${carreTitle}`;
  }
  if (w.includes('porte') || w.includes('worn') || w.includes('silhouette')) {
    return `Vue portée et tombé de la soie ${carreTitle}`;
  }
  if (w.includes('numeric') || w.includes('main') || w.includes('plat') || index === 1) {
    return `${carreTitle} à plat`;
  }
  if (w.includes('angle')) {
    return `Vue sous angle de ${carreTitle}`;
  }
  if (w.includes('nuit')) {
    return `Reflets et nuances nocturnes de ${carreTitle}`;
  }
  if (w.includes('visit')) {
    return `Vue immersive et détails de ${carreTitle}`;
  }
  if (w.includes('large')) {
    return `Vue d'ensemble et composition de ${carreTitle}`;
  }
  return `Vue ${index} de ${carreTitle}`;
}

/**
 * Formate un objet JS en syntaxe TypeScript lisible et valide.
 */
function formatTsValue(val, indent = '        ') {
  if (Array.isArray(val)) {
    if (val.length === 0) return '[]';
    const items = val.map(item => `${indent}    ${formatTsValue(item, indent + '    ')}`).join(',\n');
    return `[\n${items}\n${indent}]`;
  }
  if (val !== null && typeof val === 'object') {
    const entries = Object.entries(val)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${indent}    ${k}: ${formatTsValue(v, indent + '    ')}`);
    return `{\n${entries.join(',\n')}\n${indent}}`;
  }
  if (typeof val === 'string') {
    return JSON.stringify(val);
  }
  return String(val);
}

/**
 * Analyse un dossier de carré et retourne les objets media[], carouselMedia et thumbnail.
 */
function analyzeCarreFolder(carreSlug, carreTitle) {
  const folderPath = path.join(carresPublicDir, carreSlug);
  if (!fs.existsSync(folderPath)) {
    console.warn(`Attention : dossier introuvable ${folderPath}`);
    return null;
  }

  console.log(`\n📂 Analyse du carré : ${carreSlug} ("${carreTitle}")`);

  // 1. Suppression des anciens fichiers obsolètes (main, detail, worn)
  cleanLegacyFiles(folderPath);

  // 2. Scan des fichiers présents
  const allEntries = fs.readdirSync(folderPath);

  // 3. Conversion automatique et optimisation des formats
  for (const entry of allEntries) {
    if (entry.startsWith('.')) continue;
    const fullPath = path.join(folderPath, entry);
    if (fs.statSync(fullPath).isDirectory()) continue;

    const ext = path.extname(entry).toLowerCase();
    if (IMAGE_EXTS_RAW.has(ext)) {
      convertImageIfNeeded(fullPath);
    } else if (IMAGE_EXTS_WEB.has(ext)) {
      optimizeWebImage(fullPath);
    } else if (ext === '.mov' || ext === '.m4v') {
      convertVideoIfNeeded(fullPath);
    }
  }

  // 4. Re-scan après conversions
  const updatedEntries = fs.readdirSync(folderPath);

  let rawCarouselFile = null;
  let carouselPosterFile = null;
  const numberedFiles = []; // { word, index, file, ext, isPoster }

  const carouselRegex = /^([a-zA-ZÀ-ÿ0-9_-]+?)[-_]carousel(?:[-_](poster))?\.(.+)$/i;
  const numberedRegex = /^([a-zA-ZÀ-ÿ0-9_-]+?)[-_](\d+)(?:[-_](poster))?\.(.+)$/i;

  for (const file of updatedEntries) {
    if (file.startsWith('.')) continue;
    const ext = path.extname(file).toLowerCase();

    // On ignore les originaux DNG ou HEIC s'il existe une version .jpg correspondante
    if (IMAGE_EXTS_RAW.has(ext)) {
      const baseName = path.basename(file, path.extname(file));
      if (updatedEntries.includes(`${baseName}.jpg`)) {
        continue;
      }
    }

    const cMatch = file.match(carouselRegex);
    if (cMatch) {
      const isPoster = !!cMatch[2] || file.includes('-poster.');
      if (isPoster) {
        carouselPosterFile = file;
      } else {
        if (!rawCarouselFile || ext === '.mp4' || (!rawCarouselFile.endsWith('.mp4') && ext !== '.mov')) {
          rawCarouselFile = file;
        }
      }
      continue;
    }

    const nMatch = file.match(numberedRegex);
    if (nMatch) {
      const word = nMatch[1];
      const index = parseInt(nMatch[2], 10);
      const isPoster = !!nMatch[3] || file.includes('-poster.');
      numberedFiles.push({ word, index, file, ext, isPoster });
    }
  }

  // 5. Groupement des fichiers numérotés par index
  const byIndex = new Map();
  for (const item of numberedFiles) {
    if (!byIndex.has(item.index)) {
      byIndex.set(item.index, []);
    }
    byIndex.get(item.index).push(item);
  }

  const sortedIndices = Array.from(byIndex.keys()).sort((a, b) => a - b);
  const mediaList = [];

  for (const idx of sortedIndices) {
    const items = byIndex.get(idx);
    const videoItems = items.filter(it => !it.isPoster && VIDEO_EXTS.has(it.ext));
    const imageItems = items.filter(it => !it.isPoster && (IMAGE_EXTS_WEB.has(it.ext) || IMAGE_EXTS_RAW.has(it.ext)));
    const posterItem = items.find(it => it.isPoster);

    const firstItem = items[0];
    const word = firstItem ? firstItem.word : 'vue';
    const isFirstView = (idx === 1);

    if (videoItems.length > 0) {
      // Cas Vidéo
      const mp4 = videoItems.find(it => it.ext === '.mp4');
      const mov = videoItems.find(it => it.ext === '.mov');
      const mainVideo = mp4 || mov || videoItems[0];
      const videoUrl = `/carres/${carreSlug}/${mainVideo.file}`;
      const srcMp4 = mp4 ? `/carres/${carreSlug}/${mp4.file}` : undefined;
      const srcMov = mov ? `/carres/${carreSlug}/${mov.file}` : undefined;
      const posterUrl = posterItem
        ? `/carres/${carreSlug}/${posterItem.file}`
        : `/carres/${carreSlug}/${path.basename(mainVideo.file, path.extname(mainVideo.file))}-poster.jpg`;

      mediaList.push({
        id: `${carreSlug}-${word}-${String(idx).padStart(2, '0')}`,
        type: 'video',
        url: videoUrl,
        srcMp4,
        srcMov,
        poster: posterUrl,
        alt: generateAltText(word, idx, carreTitle, true),
        aspectRatio: isFirstView ? '1:1' : '3:4',
        isMain: isFirstView
      });
    } else if (imageItems.length > 0) {
      // Cas Image
      const chosen = imageItems.find(it => it.ext === '.jpg' || it.ext === '.jpeg' || it.ext === '.webp') || imageItems[0];
      mediaList.push({
        id: `${carreSlug}-${word}-${String(idx).padStart(2, '0')}`,
        type: 'image',
        url: `/carres/${carreSlug}/${chosen.file}`,
        alt: generateAltText(word, idx, carreTitle, false),
        aspectRatio: isFirstView ? '1:1' : '3:4',
        isMain: isFirstView
      });
    }
  }

  // 6. Résolution du Média Carousel & Fallback sur *-01.*
  let carouselMedia = null;
  const item01 = mediaList.find(m => m.id.endsWith('-01')) || mediaList[0];

  if (rawCarouselFile) {
    const ext = path.extname(rawCarouselFile).toLowerCase();
    const isVid = VIDEO_EXTS.has(ext);
    const cUrl = `/carres/${carreSlug}/${rawCarouselFile}`;
    const base = path.basename(rawCarouselFile, path.extname(rawCarouselFile));
    const word = base.replace(/[-_]carousel/i, '') || 'carousel';

    let srcMp4 = undefined;
    let srcMov = undefined;
    let poster = undefined;

    if (isVid) {
      const mp4Exists = updatedEntries.includes(`${base}.mp4`);
      const movExists = updatedEntries.includes(`${base}.mov`);
      srcMp4 = mp4Exists ? `/carres/${carreSlug}/${base}.mp4` : (ext === '.mp4' ? cUrl : undefined);
      srcMov = movExists ? `/carres/${carreSlug}/${base}.mov` : (ext === '.mov' ? cUrl : undefined);
      poster = carouselPosterFile
        ? `/carres/${carreSlug}/${carouselPosterFile}`
        : `/carres/${carreSlug}/${base}-poster.jpg`;
    }

    carouselMedia = {
      id: `${carreSlug}-${word}-carousel`,
      type: isVid ? 'video' : 'image',
      url: srcMp4 || cUrl,
      srcMp4,
      srcMov,
      poster,
      alt: `${carreTitle} — Présentation carrousel d'accueil`,
      aspectRatio: '1:1'
    };
    console.log(`  ✓ Média Carousel détecté : ${rawCarouselFile} (${carouselMedia.type})`);
  } else if (item01) {
    // RÈGLE DE FALLBACK STRICT : si aucun *-carousel.* n'est fourni, on utilise le média *-01.*
    console.log(`  ℹ Aucun *-carousel.* trouvé. Application du fallback strict sur *-01.* (${item01.url})`);
    carouselMedia = {
      ...item01,
      id: `${carreSlug}-carousel-fallback`
    };
  }

  // 7. Détermination du thumbnail officiel (image principale *-01.*)
  const firstImage = mediaList.find(m => m.type === 'image') || item01;
  const thumbnail = firstImage ? firstImage.url : (carouselMedia ? (carouselMedia.poster || carouselMedia.url) : '');

  console.log(`  ✓ ${mediaList.length} vues ordonnées dans la galerie :`);
  for (const m of mediaList) {
    console.log(`     - [${m.type.toUpperCase()}] ${m.id} -> ${m.url}`);
  }
  console.log(`  ✓ Thumbnail officiel : ${thumbnail}`);

  return { mediaList, carouselMedia, thumbnail };
}

/**
 * Analyse et optimise les médias de l'exposition (public/expo)
 */
function optimizeExpoMedia() {
  if (!fs.existsSync(expoPublicDir)) return;
  console.log(`\n📂 Optimisation des médias de l'exposition (public/expo)`);
  const entries = fs.readdirSync(expoPublicDir);
  for (const entry of entries) {
    if (entry.startsWith('.')) continue;
    const fullPath = path.join(expoPublicDir, entry);
    if (fs.statSync(fullPath).isDirectory()) continue;

    const ext = path.extname(entry).toLowerCase();
    if (IMAGE_EXTS_RAW.has(ext)) {
      convertImageIfNeeded(fullPath);
    } else if (IMAGE_EXTS_WEB.has(ext)) {
      optimizeWebImage(fullPath);
    } else if (ext === '.mov' || ext === '.m4v') {
      convertVideoIfNeeded(fullPath);
    }
  }
  console.log(`  ✓ Médias d'exposition analysés et optimisés.`);
}

/**
 * Met à jour src/app/core/data/carres.mock.ts
 */
function updateCarresMock() {
  console.log(`\n======================================================`);
  console.log(` Synchronisation des Médias des Carrés Hermès         `);
  console.log(`======================================================`);

  if (!fs.existsSync(mockFilePath)) {
    console.error(`Erreur : fichier mock introuvable ${mockFilePath}`);
    process.exit(1);
  }

  // 1. Optimisation préalable des médias de l'exposition
  optimizeExpoMedia();

  const mockContent = fs.readFileSync(mockFilePath, 'utf-8');

  const carreSlugs = [
    { slug: 'carre-laures', title: "L'Aurès" },
    { slug: 'carre-1954-1962', title: "1954 - 1962" },
    { slug: 'carre-retour-a-la-terre', title: "Retour à la Terre" },
    { slug: 'carre-une-derniere-priere', title: "Une Dernière Prière" },
    { slug: 'carre-un-seul-heros-le-peuple', title: "Un Seul Héros le Peuple" }
  ];

  const analyzedData = new Map();
  for (const { slug, title } of carreSlugs) {
    const res = analyzeCarreFolder(slug, title);
    if (res) {
      analyzedData.set(slug, res);
    }
  }

  let newContent = mockContent;

  for (const { slug } of carreSlugs) {
    const data = analyzedData.get(slug);
    if (!data) continue;

    const { mediaList, carouselMedia, thumbnail } = data;

    const mediaTs = formatTsValue(mediaList);
    const carouselMediaTs = formatTsValue(carouselMedia);

    // Recherche et remplacement fiable de la section médias du carré courant
    const carreBlockRegex = new RegExp(
      `(id:\\s*'${slug}',[\\s\\S]*?)thumbnail:\\s*['"][^'"]*['"],?\\s*(?:media:\\s*\\[[\\s\\S]*?\\],?\\s*)?(?:carouselMedia:\\s*{[\\s\\S]*?},?\\s*)?(?:images:\\s*\\[[\\s\\S]*?\\],?\\s*)?(hasInterview:)`,
      'm'
    );

    newContent = newContent.replace(carreBlockRegex, (match, prefix, hasInterview) => {
      return `${prefix}thumbnail: '${thumbnail}',\n        media: ${mediaTs},\n        carouselMedia: ${carouselMediaTs},\n        ${hasInterview}`;
    });
  }

  fs.writeFileSync(mockFilePath, newContent, 'utf-8');
  console.log(`\n✓ Mise à jour réussie de ${mockFilePath} !`);
}

updateCarresMock();
