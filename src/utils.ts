import fs from 'fs-extra';
import path from 'path';
import camelCase from 'camelcase';

import { PackageJson } from './types';

// Remove the package name scope if it exists
export const removeScope = (name: string) => name.replace(/^@.*\//, '');

// UMD-safe package name
export const safeVariableName = (name: string) =>
  camelCase(
    removeScope(name)
      .toLowerCase()
      .replace(/((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '')
  );

export const safePackageName = (name: string) =>
  name
    .toLowerCase()
    .replace(/(^@.*\/)|((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '');

// FIXME: bundle in polyfills as TSDX can't (yet) ensure they're installed as deps
const notSupportYet = (id: string) => id.startsWith('regenerator-runtime');
const pathful = (id: string) => id.startsWith('.') || path.isAbsolute(id);
const wannaEmbed = (deps: string[], id: string) =>
  deps.some(dep => id.startsWith(dep));

function external(id: string) {
  if (notSupportYet(id)) {
    return false;
  }

  if (pathful(id)) {
    return false;
  }

  if (wannaEmbed(external.dependencies || [], id)) {
    return false;
  }

  return true;
}
external.dependencies = [] as string[];
export { external };

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
export const appDirectory = fs.realpathSync(process.cwd());
export const resolveApp = function(relativePath: string) {
  return path.resolve(appDirectory, relativePath);
};

// Taken from Create React App, react-dev-utils/clearConsole
// @see https://github.com/facebook/create-react-app/blob/master/packages/react-dev-utils/clearConsole.js
export function clearConsole() {
  process.stdout.write(
    process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H'
  );
}

export function getReactVersion({
  dependencies,
  devDependencies,
}: PackageJson) {
  return (
    (dependencies && dependencies.react) ||
    (devDependencies && devDependencies.react)
  );
}

export function getNodeEngineRequirement({ engines }: PackageJson) {
  return engines && engines.node;
}
