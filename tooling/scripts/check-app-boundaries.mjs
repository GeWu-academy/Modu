import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const clients = ['web', 'admin', 'app'];
const apps = [...clients, 'api'];
const ignored = new Set(['node_modules', '.git', '.next', '.expo', 'dist', 'out', 'coverage', 'bin']);
const sourceFile = /\.(?:[cm]?[jt]sx?|go)$/;

function within(root, path) {
  const pathFromRoot = relative(root, path);
  return !isAbsolute(pathFromRoot) && pathFromRoot !== '..' && !pathFromRoot.startsWith('../');
}

function* files(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else yield path;
  }
}

// Checks conventional literal imports, not computed imports or arbitrary build code.
export function imports(source) {
  const pattern = /\b(?:import|export)\s+(?:[^;]*?\s+from\s+)?["']([^"']+)["']|\b(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g;
  return Array.from(source.matchAll(pattern), match => match[1] ?? match[2]);
}

export function checkAppBoundaries(repository) {
  repository = realpathSync(repository);
  const errors = [];
  const report = (path, message) => errors.push(`${relative(repository, path)}: ${message}`);
  for (const name of ['packages', 'plugins']) {
    const path = resolve(repository, name);
    if (existsSync(path)) report(path, 'root shared runtime directories/cross-app workspace are not allowed');
  }
  // A local-only workspace fences off ancestor workspaces without coupling apps.
  const checkWorkspace = root => {
    const path = resolve(root, 'pnpm-workspace.yaml');
    if (!existsSync(path)) return;
    const source = readFileSync(path, 'utf8');
    const block = source.match(/^packages:[ \t]*\r?\n((?:[ \t]+[^\n]*(?:\n|$))*)/m)?.[1];
    const entries = block?.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    if (!entries || entries.length !== 1 || !/^-[ \t]+(?:'\.'|"\."|\.)$/.test(entries[0])) {
      report(path, 'workspace must contain only its own directory (packages: single dot)');
    }
  };
  checkWorkspace(repository);
  for (const app of apps) {
    const root = resolve(repository, 'apps', app);
    if (!existsSync(root)) continue;
    checkWorkspace(root);
    const checkPath = (owner, target) => {
      // Check symlinks too, so a source symlink cannot hide another app's files.
      const actual = existsSync(target) ? realpathSync(target) : target;
      if (!within(root, actual)) report(owner, `path leaves ${app}: ${relative(root, target)}`);
    };
    const checkImport = (owner, name) => {
      if (apps.filter(other => other !== app).some(other => name === `@your-erp/${other}` || name.startsWith(`@your-erp/${other}/`))) {
        report(owner, `application package import is not allowed: ${name}`);
      }
      if (name.startsWith('.') || isAbsolute(name)) checkPath(owner, resolve(dirname(owner), name));
    };
    if (clients.includes(app)) {
      const manifestPath = resolve(root, 'package.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      if (manifest.name !== `@your-erp/${app}`) report(manifestPath, `expected package name @your-erp/${app}`);
      if (!existsSync(resolve(root, 'pnpm-lock.yaml'))) report(manifestPath, 'app-local lockfile is required');
      for (const field of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
        for (const [name, version] of Object.entries(manifest[field] ?? {})) {
          checkImport(manifestPath, name);
          if (version.startsWith('workspace:')) report(manifestPath, `workspace dependency is not allowed: ${name}`);
          if (/^(?:file|link):/.test(version)) checkPath(manifestPath, resolve(root, version.replace(/^(?:file|link):/, '')));
        }
      }
      const configPath = resolve(root, 'tsconfig.json');
      if (existsSync(configPath)) {
        // Current configs are JSON. Unsupported JSONC should fail visibly, not skip checks.
        const config = JSON.parse(readFileSync(configPath, 'utf8'));
        const options = config.compilerOptions ?? {};
        const base = resolve(root, options.baseUrl ?? '.');
        checkPath(configPath, base);
        for (const targets of Object.values(options.paths ?? {})) {
          for (const target of targets) checkPath(configPath, resolve(base, target));
        }
        for (const parent of [config.extends ?? []].flat()) checkImport(configPath, parent);
        for (const reference of config.references ?? []) checkPath(configPath, resolve(root, reference.path));
        for (const include of config.include ?? []) checkPath(configPath, resolve(root, include));
      }
    }
    for (const path of files(root)) {
      checkPath(path, path);
      if (!sourceFile.test(path)) continue;
      if (!within(root, realpathSync(path))) continue;
      const source = readFileSync(path, 'utf8');
      if (path.endsWith('.go')) {
        for (const other of apps.filter(name => name !== app)) {
          if (source.includes(`github.com/GeWu-academy/Modu/apps/${other}`)) report(path, `Go import crosses into ${other}`);
        }
      } else {
        for (const name of imports(source)) checkImport(path, name);
      }
    }
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const errors = checkAppBoundaries(root);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('Application boundaries OK: web (website), admin (console), app (ordinary-user RN), api (backend).');
  }
}
