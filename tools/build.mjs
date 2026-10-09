import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import CleanCSS from 'clean-css';
import { minify as minifyHtml } from 'html-minifier-terser';
import sharp from 'sharp';
import { minify as minifyJs } from 'terser';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const skipImageOptimization = process.argv.includes('--skip-images');

const excludedRootEntries = new Set([
  '.git',
  '.github',
  '.claude',
  'node_modules',
  'dist'
]);

const imageExtensions = new Set(['.jpg', '.jpeg', '.png']);

const getContentHash = (content) => {
  return createHash('sha256').update(content).digest('hex').slice(0, 8);
};

const copyRecursive = async (sourcePath, destinationPath) => {
  const sourceStat = await fs.stat(sourcePath);

  if (sourceStat.isDirectory()) {
    await fs.mkdir(destinationPath, { recursive: true });
    const entries = await fs.readdir(sourcePath, { withFileTypes: true });

    for (const entry of entries) {
      const sourceEntryPath = path.join(sourcePath, entry.name);
      const destinationEntryPath = path.join(destinationPath, entry.name);
      await copyRecursive(sourceEntryPath, destinationEntryPath);
    }

    return;
  }

  await fs.copyFile(sourcePath, destinationPath);
};

const getFilesRecursively = async (directoryPath) => {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getFilesRecursively(entryPath)));
    } else {
      files.push(entryPath);
    }
  }

  return files;
};

const minifyCssAsset = async () => {
  const cssPath = path.join(distDir, 'assets', 'css', 'style.css');
  const cssOutputDir = path.dirname(cssPath);
  const originalCss = await fs.readFile(cssPath, 'utf8');
  const minifiedCss = new CleanCSS().minify(originalCss);

  if (minifiedCss.errors.length > 0) {
    throw new Error(`CSS minification failed: ${minifiedCss.errors.join(', ')}`);
  }

  const cssHash = getContentHash(minifiedCss.styles);
  const minifiedCssFileName = `style.${cssHash}.min.css`;
  const minifiedCssPath = path.join(cssOutputDir, minifiedCssFileName);

  await fs.writeFile(minifiedCssPath, minifiedCss.styles, 'utf8');
  await fs.rm(cssPath);

  return `./assets/css/${minifiedCssFileName}`;
};

const minifyJsAsset = async () => {
  const jsPath = path.join(distDir, 'assets', 'js', 'script.js');
  const jsOutputDir = path.dirname(jsPath);
  const originalJs = await fs.readFile(jsPath, 'utf8');
  const minifiedJs = await minifyJs(originalJs, {
    compress: true,
    mangle: true,
    format: { comments: false }
  });

  if (!minifiedJs.code) {
    throw new Error('JS minification failed: no output generated.');
  }

  const jsHash = getContentHash(minifiedJs.code);
  const minifiedJsFileName = `script.${jsHash}.min.js`;
  const minifiedJsPath = path.join(jsOutputDir, minifiedJsFileName);

  await fs.writeFile(minifiedJsPath, minifiedJs.code, 'utf8');
  await fs.rm(jsPath);

  return `./assets/js/${minifiedJsFileName}`;
};

const optimizeImages = async () => {
  const imagesDir = path.join(distDir, 'assets', 'images');
  const imageFiles = await getFilesRecursively(imagesDir);

  for (const imagePath of imageFiles) {
    const extension = path.extname(imagePath).toLowerCase();
    if (!imageExtensions.has(extension)) {
      continue;
    }

    const sourceBuffer = await fs.readFile(imagePath);

    if (extension === '.png') {
      const optimizedBuffer = await sharp(sourceBuffer, { failOn: 'none' })
        .png({ compressionLevel: 9 })
        .toBuffer();
      await fs.writeFile(imagePath, optimizedBuffer);
    } else {
      const optimizedBuffer = await sharp(sourceBuffer, { failOn: 'none' })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();
      await fs.writeFile(imagePath, optimizedBuffer);
    }

    const webpPath = imagePath.replace(/\.(png|jpe?g)$/i, '.webp');
    const webpBuffer = await sharp(sourceBuffer, { failOn: 'none' }).webp({ quality: 80 }).toBuffer();
    await fs.writeFile(webpPath, webpBuffer);
  }
};

const rewriteAndMinifyHtml = async (cssAssetPath, jsAssetPath) => {
  const htmlPath = path.join(distDir, 'index.html');
  const html = await fs.readFile(htmlPath, 'utf8');

  const rewrittenHtml = html
    .replace('./assets/css/style.css', cssAssetPath)
    .replace('./assets/js/script.js', jsAssetPath);

  const minifiedHtml = await minifyHtml(rewrittenHtml, {
    collapseWhitespace: true,
    removeComments: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true
  });

  await fs.writeFile(htmlPath, minifiedHtml, 'utf8');
};

const build = async () => {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  const rootEntries = await fs.readdir(rootDir, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (excludedRootEntries.has(entry.name)) {
      continue;
    }

    const sourceEntryPath = path.join(rootDir, entry.name);
    const destinationEntryPath = path.join(distDir, entry.name);
    await copyRecursive(sourceEntryPath, destinationEntryPath);
  }

  const cssAssetPath = await minifyCssAsset();
  const jsAssetPath = await minifyJsAsset();
  await rewriteAndMinifyHtml(cssAssetPath, jsAssetPath);

  if (!skipImageOptimization) {
    await optimizeImages();
  }

  console.log(`Build completed in ${distDir}`);
};

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
