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
];

async function run() {
  console.log('Comparing AVIF vs WebP across target variants:');
  const results = [];

  for (const cfg of imageConfigs) {
    const inputPath = path.join(ASSETS_DIR, cfg.src);
    const origStat = fs.statSync(inputPath);
    const origKb = (origStat.size / 1024).toFixed(1);

    console.log(`\n========================================`);
    console.log(`${cfg.src} (Original: ${origKb} KB)`);
    console.log(`========================================`);

    for (const size of cfg.sizes) {
      const img = sharp(inputPath).resize({ width: size.width, withoutEnlargement: true });

      // AVIF
      const avifBuffer = await img.clone().avif({ quality: 80, effort: 6 }).toBuffer();
      const avifKb = (avifBuffer.length / 1024).toFixed(1);

      // WebP
      const webpBuffer = await img.clone().webp({ quality: 82, effort: 6 }).toBuffer();
      const webpKb = (webpBuffer.length / 1024).toFixed(1);

      console.log(`  Width ${size.width}px:`);
      console.log(`    AVIF: ${avifKb} KB (${((1 - avifBuffer.length / origStat.size) * 100).toFixed(1)}% reduction)`);
      console.log(`    WebP: ${webpKb} KB (${((1 - webpBuffer.length / origStat.size) * 100).toFixed(1)}% reduction)`);

      results.push({
        name: cfg.name,
        width: size.width,
        origKb,
        avifKb,
        webpKb,
      });
    }
  }
}

run().catch(console.error);

