import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Get new repository info from arguments
const [owner, repoName, authorName, authorEmail] = process.argv.slice(2);

if (!owner || !repoName) {
    console.error('Usage: node setup-repo.mjs <owner> <repoName> [authorName] [authorEmail]');
    process.exit(1);
}

console.log(`Updating project for ${owner}/${repoName}...`);

// 1. Update root package.json
updatePackageJson(path.join(rootDir, 'package.json'), pkg => {
    // Update scope name, assuming original package name is @vgerbot/root
    pkg.name = `@${owner}/${repoName}-root`;
    if (authorName) {
        pkg.author = `${authorName} <${authorEmail || ''}>`;
    }
    // Clean up setup script in scripts (optional)
    // delete pkg.scripts['setup'];
});

// 2. Update package.json for all packages in packages directory
const packagesDir = path.join(rootDir, 'packages');
if (fs.existsSync(packagesDir)) {
    const packages = fs.readdirSync(packagesDir);
    packages.forEach(pkgDir => {
        const pkgPath = path.join(packagesDir, pkgDir, 'package.json');
        if (fs.existsSync(pkgPath)) {
            updatePackageJson(pkgPath, pkg => {
                // Update package name scope
                if (pkg.name.startsWith('@vgerbot/')) {
                    pkg.name = pkg.name.replace('@vgerbot/', `@${owner}/`);
                }

                // Update repository URL
                pkg.repository = `https://github.com/${owner}/${repoName}.git`;

                // Update homepage URL
                if (pkg.homepage) {
                    pkg.homepage = pkg.homepage.replace(/github\.com\/[^/]+\/[^/]+/, `github.com/${owner}/${repoName}`);
                }

                if (authorName) {
                    pkg.author = {
                        name: authorName,
                        email: authorEmail || '',
                    };
                }
            });
        }
    });
}

function updatePackageJson(filePath, updateFn) {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    const pkg = JSON.parse(content);

    updateFn(pkg);

    fs.writeFileSync(filePath, JSON.stringify(pkg, null, 4) + '\n');
    console.log(`Updated ${path.relative(rootDir, filePath)}`);
}

console.log('Setup complete.');
