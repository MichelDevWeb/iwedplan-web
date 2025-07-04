#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 * 
 * Tạo tất cả các kích thước icon cần thiết cho PWA từ một source image
 * 
 * Usage:
 * node scripts/generate-pwa-icons.js [source-image-path]
 * 
 * Requirements:
 * npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Icon sizes cho PWA
const iconSizes = [
  // Standard PWA icons
  { size: 16, name: 'icon-16.png' },
  { size: 32, name: 'icon-32.png' },
  { size: 72, name: 'icon-72.png' },
  { size: 96, name: 'icon-96.png' },
  { size: 128, name: 'icon-128.png' },
  { size: 144, name: 'icon-144.png' },
  { size: 152, name: 'icon-152.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 384, name: 'icon-384.png' },
  { size: 512, name: 'icon-512.png' },
  
  // Apple specific
  { size: 180, name: 'apple-touch-icon.png' },
  
  // Shortcut icons
  { size: 96, name: 'shortcut-dashboard.png' },
  { size: 96, name: 'shortcut-create.png' },
  { size: 96, name: 'shortcut-ai.png' },
  
  // Microsoft tiles
  { size: 70, name: 'ms-icon-70x70.png' },
  { size: 144, name: 'ms-icon-144x144.png' },
  { size: 150, name: 'ms-icon-150x150.png' },
  { size: 310, name: 'ms-icon-310x310.png' },
  
  // Apple startup images (placeholder sizes)
  { size: 320, name: 'apple-startup-320x568.png', width: 320, height: 568 },
  { size: 375, name: 'apple-startup-375x667.png', width: 375, height: 667 },
  { size: 414, name: 'apple-startup-414x736.png', width: 414, height: 736 },
  { size: 375, name: 'apple-startup-375x812.png', width: 375, height: 812 },
];

function createPlaceholderIcon(size, outputPath, width = size, height = size) {
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" rx="20"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.1}" 
            fill="white" font-weight="bold">
        iW
      </text>
      <circle cx="${width * 0.8}" cy="${height * 0.2}" r="${Math.min(width, height) * 0.05}" fill="white" opacity="0.8"/>
    </svg>
  `;
  
  // Save SVG file
  const svgPath = outputPath.replace('.png', '.svg');
  fs.writeFileSync(svgPath, svg);
  
  console.log(`Created placeholder: ${outputPath} (${width}x${height})`);
  return svgPath;
}

function generateIcons(sourceImagePath = null) {
  const iconsDir = path.join(__dirname, '../public/icons');
  
  // Create icons directory if it doesn't exist
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  console.log('🎨 Generating PWA icons...\n');
  
  if (sourceImagePath && fs.existsSync(sourceImagePath)) {
    console.log(`📸 Using source image: ${sourceImagePath}`);
    // TODO: Add sharp image processing if source image is provided
    console.log('⚠️  Sharp image processing not implemented yet.');
    console.log('   Install sharp: npm install sharp');
    console.log('   Then implement image resizing logic.\n');
  } else {
    console.log('📝 Creating placeholder icons (no source image provided)\n');
  }
  
  // Generate all required icons
  iconSizes.forEach(({ size, name, width, height }) => {
    const outputPath = path.join(iconsDir, name);
    const iconWidth = width || size;
    const iconHeight = height || size;
    
    // Create placeholder for now
    createPlaceholderIcon(size, outputPath, iconWidth, iconHeight);
  });
  
  console.log('\n✅ Icon generation completed!');
  console.log(`📁 Icons saved to: ${iconsDir}`);
  
  // Generate additional assets
  generateAdditionalAssets();
}

function generateAdditionalAssets() {
  const publicDir = path.join(__dirname, '../public');
  
  // Create screenshots directory
  const screenshotsDir = path.join(publicDir, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  // Create placeholder screenshots
  const screenshots = [
    { name: 'mobile-dashboard.png', width: 390, height: 844 },
    { name: 'mobile-template.png', width: 390, height: 844 },
    { name: 'mobile-ai-chat.png', width: 390, height: 844 },
    { name: 'desktop-dashboard.png', width: 1280, height: 800 },
  ];
  
  console.log('\n📱 Creating screenshot placeholders...');
  screenshots.forEach(({ name, width, height }) => {
    const outputPath = path.join(screenshotsDir, name);
    createScreenshotPlaceholder(outputPath, width, height);
  });
  
  // Create offline image
  const offlineImagePath = path.join(publicDir, 'images/offline-image.png');
  const imagesDir = path.dirname(offlineImagePath);
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  createPlaceholderIcon(512, offlineImagePath, 512, 512);
  
  console.log('\n🎯 Additional assets created!');
}

function createScreenshotPlaceholder(outputPath, width, height) {
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#fdf2f8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bgGrad)"/>
      
      <!-- Header -->
      <rect x="0" y="0" width="100%" height="${height * 0.1}" fill="#ec4899"/>
      <text x="50%" y="${height * 0.05}" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, sans-serif" font-size="${height * 0.03}" 
            fill="white" font-weight="bold">
        iWedplan
      </text>
      
      <!-- Content area -->
      <rect x="${width * 0.1}" y="${height * 0.2}" width="${width * 0.8}" height="${height * 0.15}" 
            fill="white" rx="10" stroke="#e5e7eb" stroke-width="1"/>
      <rect x="${width * 0.1}" y="${height * 0.4}" width="${width * 0.8}" height="${height * 0.15}" 
            fill="white" rx="10" stroke="#e5e7eb" stroke-width="1"/>
      <rect x="${width * 0.1}" y="${height * 0.6}" width="${width * 0.8}" height="${height * 0.15}" 
            fill="white" rx="10" stroke="#e5e7eb" stroke-width="1"/>
      
      <!-- Bottom text -->
      <text x="50%" y="${height * 0.9}" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, sans-serif" font-size="${height * 0.02}" 
            fill="#6b7280">
        ${path.basename(outputPath, '.png').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </text>
    </svg>
  `;
  
  const svgPath = outputPath.replace('.png', '.svg');
  fs.writeFileSync(svgPath, svg);
  console.log(`📸 Created screenshot: ${path.basename(outputPath)} (${width}x${height})`);
}

// Run the script
if (require.main === module) {
  const sourceImage = process.argv[2];
  generateIcons(sourceImage);
}

module.exports = { generateIcons }; 