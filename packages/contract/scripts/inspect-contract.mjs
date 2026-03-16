#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CONTRACT_ENTRY = path.join(ROOT_DIR, 'src', 'operations', 'contract.ts');

const ANSI = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  orange: '\x1b[38;5;208m',
};

const METHOD_COLORS = {
  GET: ANSI.green,
  POST: ANSI.blue,
  PATCH: ANSI.yellow,
  PUT: ANSI.orange,
  DELETE: ANSI.red,
};

const fileCache = new Map();

function readSourceFile(filePath) {
  const normalizedPath = path.resolve(filePath);
  if (!fileCache.has(normalizedPath)) {
    const content = fs.readFileSync(normalizedPath, 'utf8');
    const sourceFile = ts.createSourceFile(normalizedPath, content, ts.ScriptTarget.Latest, true);
    fileCache.set(normalizedPath, sourceFile);
  }
  return fileCache.get(normalizedPath);
}

function getPropertyName(propertyName) {
  if (ts.isIdentifier(propertyName) || ts.isStringLiteral(propertyName)) {
    return propertyName.text;
  }
  return propertyName.getText();
}

function resolveImport(currentFilePath, specifier) {
  if (specifier.startsWith('@/')) {
    return path.join(ROOT_DIR, 'src', specifier.slice(2)) + '.ts';
  }

  if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
    return null;
  }

  const resolved = path.resolve(path.dirname(currentFilePath), specifier);
  const candidates = [
    resolved,
    `${resolved}.ts`,
    path.join(resolved, 'index.ts'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Unable to resolve import "${specifier}" from ${currentFilePath}`);
}

function collectExportsAndImports(sourceFile) {
  const exports = new Map();
  const imports = new Map();

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && statement.importClause && ts.isStringLiteral(statement.moduleSpecifier)) {
      const importPath = resolveImport(sourceFile.fileName, statement.moduleSpecifier.text);
      if (!importPath) {
        continue;
      }
      const namedBindings = statement.importClause.namedBindings;
      if (namedBindings && ts.isNamedImports(namedBindings)) {
        for (const element of namedBindings.elements) {
          const localName = element.name.text;
          const importedName = element.propertyName ? element.propertyName.text : element.name.text;
          imports.set(localName, {
            filePath: importPath,
            exportName: importedName,
          });
        }
      }
    }

    if (!ts.isVariableStatement(statement)) {
      continue;
    }

    const isExported = statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    if (!isExported) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        exports.set(declaration.name.text, declaration.initializer);
      }
    }
  }

  return { exports, imports };
}

function isContractCall(expression, methodName) {
  return (
    ts.isCallExpression(expression) &&
    ts.isPropertyAccessExpression(expression.expression) &&
    expression.expression.name.text === methodName &&
    ts.isIdentifier(expression.expression.expression) &&
    expression.expression.expression.text === 'c'
  );
}

function isRouterCall(expression) {
  return isContractCall(expression, 'router');
}

function isEndpointCall(expression) {
  return isContractCall(expression, 'query') || isContractCall(expression, 'mutation');
}

function getObjectLiteralArgument(callExpression) {
  const [firstArg] = callExpression.arguments;
  return firstArg && ts.isObjectLiteralExpression(firstArg) ? firstArg : null;
}

function getStringProperty(objectLiteral, propertyName) {
  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property) || getPropertyName(property.name) !== propertyName) {
      continue;
    }

    const initializer = property.initializer;
    if (ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer)) {
      return initializer.text;
    }
  }
  return '';
}

function readExportedInitializer(filePath, exportName) {
  const sourceFile = readSourceFile(filePath);
  const { exports } = collectExportsAndImports(sourceFile);
  const initializer = exports.get(exportName);

  if (!initializer) {
    throw new Error(`Export "${exportName}" not found in ${filePath}`);
  }

  return { initializer, sourceFile };
}

function visitNode(initializer, filePath, imports, namePrefix, rows) {
  if (isRouterCall(initializer)) {
    const objectLiteral = getObjectLiteralArgument(initializer);
    if (!objectLiteral) {
      return;
    }

    for (const property of objectLiteral.properties) {
      if (!ts.isPropertyAssignment(property)) {
        continue;
      }

      const propertyName = getPropertyName(property.name);
      const nextNamePrefix = [...namePrefix, propertyName];
      const value = property.initializer;

      if (isRouterCall(value) || isEndpointCall(value)) {
        visitNode(value, filePath, imports, nextNamePrefix, rows);
        continue;
      }

      if (ts.isIdentifier(value)) {
        const imported = imports.get(value.text);
        if (!imported) {
          continue;
        }

        const { initializer: importedInitializer, sourceFile: importedFile } = readExportedInitializer(
          imported.filePath,
          imported.exportName,
        );
        const { imports: importedImports } = collectExportsAndImports(importedFile);
        visitNode(importedInitializer, imported.filePath, importedImports, nextNamePrefix, rows);
      }
    }
    return;
  }

  if (isEndpointCall(initializer)) {
    const objectLiteral = getObjectLiteralArgument(initializer);
    if (!objectLiteral) {
      return;
    }

    rows.push({
      name: namePrefix.join('.'),
      summary: getStringProperty(objectLiteral, 'summary'),
      method: getStringProperty(objectLiteral, 'method'),
      path: getStringProperty(objectLiteral, 'path'),
    });
  }
}

function colorizeOperationName(name, method) {
  const color = METHOD_COLORS[method] ?? ANSI.magenta;
  return `${color}${name}${ANSI.reset}`;
}

function createTreeNode(name = '') {
  return {
    name,
    children: new Map(),
    endpoint: null,
  };
}

function buildTree(rows) {
  const root = createTreeNode();

  for (const row of rows) {
    const parts = row.name.split('.');
    let currentNode = root;

    for (const part of parts) {
      if (!currentNode.children.has(part)) {
        currentNode.children.set(part, createTreeNode(part));
      }
      currentNode = currentNode.children.get(part);
    }

    currentNode.endpoint = row;
  }

  return root;
}

function getMaxLabelWidth(rows) {
  return rows.reduce((maxWidth, row) => {
    const parts = row.name.split('.');
    const depth = parts.length - 1;
    const leafName = parts.at(-1) ?? row.name;
    return Math.max(maxWidth, depth * 2 + leafName.length);
  }, 0);
}

function printTree(node, maxLabelWidth, depth = 0) {
  const indent = ' '.repeat(depth * 2);

  if (node.name) {
    if (node.endpoint) {
      const summary = node.endpoint.summary || '-';
      const pathText = node.endpoint.path ? `${ANSI.dim}${node.endpoint.path}${ANSI.reset}` : '';
      const paddedName = node.name.padEnd(Math.max(maxLabelWidth - indent.length, node.name.length), ' ');
      const line = [
        `${indent}${ANSI.gray}-${ANSI.reset} ${colorizeOperationName(paddedName, node.endpoint.method)}`,
        summary,
        pathText,
      ]
        .filter(Boolean)
        .join('  ');
      process.stdout.write(`${line}\n`);
    } else {
      process.stdout.write(`${indent}${ANSI.bold}${node.name}${ANSI.reset}\n`);
    }
  }

  const childNodes = Array.from(node.children.values());
  const endpointChildren = childNodes.filter((childNode) => childNode.endpoint);
  const routerChildren = childNodes.filter((childNode) => !childNode.endpoint);

  for (const childNode of [...endpointChildren, ...routerChildren]) {
    printTree(childNode, maxLabelWidth, node.name ? depth + 1 : depth);
  }
}

function main() {
  const { initializer, sourceFile } = readExportedInitializer(CONTRACT_ENTRY, 'contract');
  const { imports } = collectExportsAndImports(sourceFile);
  const rows = [];

  visitNode(initializer, CONTRACT_ENTRY, imports, [], rows);

  const filteredRows = rows.filter((row) => row.name && row.method);
  const tree = buildTree(filteredRows);
  const maxLabelWidth = getMaxLabelWidth(filteredRows);
  const topLevelNodes = Array.from(tree.children.values());

  topLevelNodes.forEach((node, index) => {
    printTree(node, maxLabelWidth);
    if (index < topLevelNodes.length - 1) {
      process.stdout.write('\n');
    }
  });
}

main();
