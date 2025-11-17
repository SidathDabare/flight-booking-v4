/**
 * Automatically moves completed task .md files from root to .claude/completed-tasks/
 * Excludes README.md and component-specific documentation
 */

const fs = require('fs');
const path = require('path');

// Directory configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const TARGET_DIR = path.join(ROOT_DIR, '.claude', 'completed-tasks');

// Files to exclude from moving
const EXCLUDE_FILES = [
  'README.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'LICENSE.md'
];

// Patterns for files that should stay in root or specific directories
const EXCLUDE_PATTERNS = [
  /^app[\\/]/,           // Component-specific docs in app directory
  /^components[\\/]/,    // Component-specific docs in components directory
  /^node_modules[\\/]/,  // Never touch node_modules
];

/**
 * Create target directory if it doesn't exist
 */
function ensureTargetDirectory() {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
    console.log(`✓ Created directory: ${TARGET_DIR}`);
  }
}

/**
 * Check if a file should be excluded
 */
function shouldExclude(filename, relativePath) {
  // Check exact filename matches
  if (EXCLUDE_FILES.includes(filename)) {
    return true;
  }

  // Check pattern matches
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(relativePath)) {
      return true;
    }
  }

  return false;
}

/**
 * Find all .md files in root directory
 */
function findMarkdownFiles() {
  const files = fs.readdirSync(ROOT_DIR);
  const mdFiles = files.filter(file => {
    const filePath = path.join(ROOT_DIR, file);
    const stats = fs.statSync(filePath);

    // Only process files (not directories) with .md extension
    if (!stats.isFile() || !file.endsWith('.md')) {
      return false;
    }

    // Exclude specific files
    return !shouldExclude(file, file);
  });

  return mdFiles;
}

/**
 * Move a file to the target directory
 */
function moveFile(filename) {
  const sourcePath = path.join(ROOT_DIR, filename);
  const targetPath = path.join(TARGET_DIR, filename);

  try {
    // Check if file already exists in target
    if (fs.existsSync(targetPath)) {
      console.log(`⚠ File already exists in target: ${filename} (skipping)`);
      return false;
    }

    // Move the file
    fs.renameSync(sourcePath, targetPath);
    console.log(`✓ Moved: ${filename} → .claude/completed-tasks/`);
    return true;
  } catch (error) {
    console.error(`✗ Error moving ${filename}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('========================================');
  console.log(' Auto-Organize Completed Tasks');
  console.log('========================================\n');

  // Ensure target directory exists
  ensureTargetDirectory();

  // Find markdown files in root
  const mdFiles = findMarkdownFiles();

  if (mdFiles.length === 0) {
    console.log('✓ No markdown files to organize.\n');
    return;
  }

  console.log(`Found ${mdFiles.length} markdown file(s) to organize:\n`);

  // Move each file
  let movedCount = 0;
  for (const file of mdFiles) {
    if (moveFile(file)) {
      movedCount++;
    }
  }

  console.log('\n========================================');
  console.log(` Organized ${movedCount} file(s)`);
  console.log('========================================\n');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };
