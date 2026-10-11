import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { checkAppBoundaries, imports } from './check-app-boundaries.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'modu-boundaries-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (path, content) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), typeof content === 'string' ? content : JSON.stringify(content));
  };
  for (const app of ['web', 'admin', 'app']) {
    write(`apps/${app}/package.json`, { name: `@your-erp/${app}`, dependencies: { react: '19.0.0' } });
    write(`apps/${app}/pnpm-lock.yaml`, "importers:\n  .: {}\n");
  }
  return { root, write };
}

test('recognizes static, type, re-export, side-effect, dynamic and require imports', () => {
  assert.deepEqual(imports(`
    import { x } from './x';
    import type { T } from './types';
    export { y } from './y';
    export * from './all';
    import './styles.css';
    const lazy = import('./lazy');
    const legacy = require('./legacy');
  `), ['./x', './types', './y', './all', './styles.css', './lazy', './legacy']);
});

test('allows sharing inside the application and external dependencies', t => {
  const { root, write } = fixture(t);
  write('apps/admin/src/modules/crm.ts', "import { api } from '../shared/api'; import React from 'react';");
  write('apps/app/tsconfig.json', { extends: 'expo/tsconfig.base', compilerOptions: { strict: true } });
  assert.deepEqual(checkAppBoundaries(root), []);
});

test('rejects source imports across applications and into root shared code', t => {
  const { root, write } = fixture(t);
  write('apps/admin/src/main.ts', "import '../../web/app/page'; import '../../../shared/api';");
  assert.equal(checkAppBoundaries(root).length, 2);
});

test('rejects application package imports and cross-app manifest dependencies', t => {
  const { root, write } = fixture(t);
  write('apps/admin/package.json', {
    name: '@your-erp/admin',
    dependencies: { '@your-erp/web': 'workspace:*', helper: 'file:../app' },
  });
  write('apps/app/App.tsx', "import { api } from '@your-erp/admin/api';");
  assert.equal(checkAppBoundaries(root).length, 4);
});

test('rejects configuration paths, extends and references outside the application', t => {
  const { root, write } = fixture(t);
  write('apps/admin/tsconfig.json', {
    extends: '../web/tsconfig.json',
    compilerOptions: { paths: { '@shared/*': ['../../shared/*'] } },
    references: [{ path: '../app' }], include: ['../web/app'],
  });
  assert.equal(checkAppBoundaries(root).length, 4);
});

test('rejects symlinked source from another app', t => {
  const { root, write } = fixture(t);
  write('apps/app/App.tsx', 'export const App = {};');
  symlinkSync(join(root, 'apps/app/App.tsx'), join(root, 'apps/admin/borrowed.tsx'));
  assert.match(checkAppBoundaries(root)[0], /path leaves admin/);
});

test('ignores generated output and installed dependencies', t => {
  const { root, write } = fixture(t);
  for (const directory of ['node_modules', '.next', 'dist', '.expo']) {
    write(`apps/web/${directory}/output.js`, "import '../../../../apps/app/App';");
  }
  assert.deepEqual(checkAppBoundaries(root), []);
});

test('rejects root shared scaffolds and cross-app workspace', t => {
  const { root, write } = fixture(t);
  write('packages/ui/index.ts', '');
  write('plugins/crm/index.ts', '');
  write('pnpm-workspace.yaml', 'packages: [apps/*]');
  assert.equal(checkAppBoundaries(root).length, 3);
});

test('catches the original admin/web package-name mix-up', t => {
  const { root, write } = fixture(t);
  write('apps/admin/package.json', { name: '@your-erp/web' });
  assert.match(checkAppBoundaries(root)[0], /expected package name @your-erp\/admin/);
});

test('allows local-only workspace fences at root and inside each application', t => {
  const { root, write } = fixture(t);
  for (const directory of ['', 'apps/admin/', 'apps/app/', 'apps/web/']) {
    write(`${directory}pnpm-workspace.yaml`, "# Fence off ancestor workspaces\npackages:\n  - '.'\n\nallowBuilds:\n  sharp: false\n");
  }
  assert.deepEqual(checkAppBoundaries(root), []);
});

test('rejects application workspaces that include siblings', t => {
  const { root, write } = fixture(t);
  write('apps/admin/pnpm-workspace.yaml', "packages:\n  - '.'\n  - '../web'\n");
  assert.match(checkAppBoundaries(root)[0], /workspace must contain only/);
});

test('rejects cross-app directory symlinks', t => {
  const { root, write } = fixture(t);
  write('apps/app/src/helper.ts', 'export const helper = {};');
  symlinkSync(join(root, 'apps/app/src'), join(root, 'apps/admin/borrowed'));
  assert.match(checkAppBoundaries(root)[0], /path leaves admin/);
});

test('allows a package to reference itself', t => {
  const { root, write } = fixture(t);
  write('apps/admin/src/module.ts', "import '@your-erp/admin/shared';");
  assert.deepEqual(checkAppBoundaries(root), []);
});
