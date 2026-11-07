const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.resolve(__dirname, '../src/assets');

const imageConfigs = [
  {
    name: 'house2',
    src: 'house2.png',
    sizes: [
      { suffix: '1000', width: 1000 },
      { suffix: '650', width: 650 },
      { suffix: '400', width: 400 },
    ],
  },
  {
    name: 'house3',
    src: 'house3.png',
    sizes: [
      { suffix: '1000', width: 1000 },
      { suffix: '650', width: 650 },
      { suffix: '400', width: 400 },
    ],
  },
  {
    name: 'step1',
    src: 'step1.png',
    sizes: [
      { suffix: '440', width: 440 },
      { suffix: '240', width: 240 },
    ],
  },
  {
    name: 'step2',
    src: 'step2.png',
    sizes: [
      { suffix: '440', width: 440 },
      { suffix: '240', width: 240 },
    ],
  },
  {
    name: 'step3',
    src: 'step3.png',
    sizes: [
      { suffix: '440', width: 440 },
      { suffix: '240', width: 240 },
    ],
  },
  {
    name: 'step4',
    src: 'step4.png',
    sizes: [
      { suffix: '440', width: 440 },
      { suffix: '240', width: 240 },
    ],
  },
  {
    name: 'footer',
    src: 'footer.png',
    sizes: [
      { suffix: '1600', width: 1600 },
      { suffix: '1000', width: 1000 },
      { suffix: '500', width: 500 },
    ],
  },
  {
    name: 'mascot',
    src: 'mascot.png',
    sizes: [
      { suffix: '600', width: 600 },
      { suffix: '400', width: 400 },
      { suffix: '300', width: 300 },
    ],
  },
];

async function generateAll() {
  console.log('Generating optimized AVIF and WebP image variants...');

  for (const cfg of imageConfigs) {
    const inputPath = path.join(ASSETS_DIR, cfg.src);
    if (!fs.existsSync(inputPath)) {
      console.warn(`File not found: ${inputPath}`);
      continue;
    }

    for (const size of cfg.sizes) {
      const baseOut = path.join(ASSETS_DIR, `${cfg.name}-${size.suffix}`);
      const pipeline = sharp(inputPath).resize({ width: size.width, withoutEnlargement: true });

      // Generate AVIF
      await pipeline.clone().avif({ quality: 80, effort: 6 }).toFile(`${baseOut}.avif`);
      const avifSize = (fs.statSync(`${baseOut}.avif`).size / 1024).toFixed(1);

      // Generate WebP
      await pipeline.clone().webp({ quality: 82, effort: 6 }).toFile(`${baseOut}.webp`);
      const webpSize = (fs.statSync(`${baseOut}.webp`).size / 1024).toFixed(1);

      console.log(`Generated ${cfg.name}-${size.suffix}: AVIF=${avifSize}KB, WebP=${webpSize}KB`);
    }
  }

  console.log('\nAll variants successfully generated.');
}

generateAll().catch(console.error);

