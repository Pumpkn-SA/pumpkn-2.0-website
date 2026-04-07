const fs = require('fs');
const path = require('path');

const SITE_DIR = __dirname;

// Find all HTML files recursively
function findHtmlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      results.push(...findHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// Get all local image filenames for matching
const imagesDir = path.join(SITE_DIR, 'images');
const localImages = fs.readdirSync(imagesDir);

function findLocalImage(cdnFilename) {
  // Decode URL encoding
  const decoded = decodeURIComponent(cdnFilename);
  // Try exact match first
  if (localImages.includes(decoded)) return decoded;
  // Try matching without the hash prefix
  for (const local of localImages) {
    if (local === decoded) return local;
    // Match by the part after the hash prefix (e.g., "68af30ae..._filename.png")
    if (decoded.includes(local) || local.includes(decoded)) return local;
  }
  return null;
}

const htmlFiles = findHtmlFiles(SITE_DIR);
console.log(`Found ${htmlFiles.length} HTML files to process`);

for (const htmlFile of htmlFiles) {
  let content = fs.readFileSync(htmlFile, 'utf-8');
  const relPath = path.relative(path.dirname(htmlFile), SITE_DIR);
  const prefix = relPath === '' ? '.' : relPath;

  // Replace Webflow shared CSS reference
  content = content.replace(
    /https:\/\/cdn\.prod\.website-files\.com\/6876191b7d74b10df8a3933b\/css\/pumpkn-2025[^"']*/g,
    `${prefix}/css/webflow.css`
  );

  // Replace Webflow JS references
  content = content.replace(
    /https:\/\/cdn\.prod\.website-files\.com\/6876191b7d74b10df8a3933b\/js\/webflow\.02c71056[^"']*/g,
    `${prefix}/js/webflow.main.js`
  );
  content = content.replace(
    /https:\/\/cdn\.prod\.website-files\.com\/6876191b7d74b10df8a3933b\/js\/webflow\.52561552[^"']*/g,
    `${prefix}/js/webflow.secondary.js`
  );
  content = content.replace(
    /https:\/\/cdn\.prod\.website-files\.com\/6876191b7d74b10df8a3933b\/js\/webflow\.schunk\.15d313e4[^"']*/g,
    `${prefix}/js/webflow.chunk1.js`
  );
  content = content.replace(
    /https:\/\/cdn\.prod\.website-files\.com\/6876191b7d74b10df8a3933b\/js\/webflow\.schunk\.36b8fb49[^"']*/g,
    `${prefix}/js/webflow.chunk2.js`
  );

  // Replace Glide CSS
  content = content.replace(
    /https:\/\/cdn\.jsdelivr\.net\/npm\/@glidejs\/glide\/dist\/css\/glide\.core\.min\.css/g,
    `${prefix}/css/glide.core.min.css`
  );

  // Replace CDN image URLs with local paths
  // Pattern: https://cdn.prod.website-files.com/6876191b7d74b10df8a3933b/FILENAME
  content = content.replace(
    /https:\/\/cdn\.prod\.website-files\.com\/6876191b7d74b10df8a3933b\/([^"'\s)]+)/g,
    (match, filename) => {
      const decodedFilename = decodeURIComponent(filename);
      const localMatch = findLocalImage(decodedFilename);
      if (localMatch) {
        return `${prefix}/images/${encodeURIComponent(localMatch).replace(/%20/g, ' ')}`;
      }
      // Keep original CDN URL if no local match
      return match;
    }
  );

  // Also handle the old CDN pattern (6565aa... site ID)
  content = content.replace(
    /https:\/\/cdn\.prod\.website-files\.com\/6565aa1950fe4c108399a361\/([^"'\s)]+)/g,
    (match, filename) => {
      const decodedFilename = decodeURIComponent(filename);
      const localMatch = findLocalImage(decodedFilename);
      if (localMatch) {
        return `${prefix}/images/${encodeURIComponent(localMatch).replace(/%20/g, ' ')}`;
      }
      return match;
    }
  );

  fs.writeFileSync(htmlFile, content);
  console.log(`Processed: ${path.relative(SITE_DIR, htmlFile)}`);
}

console.log('Build complete!');
