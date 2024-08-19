#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const packageJson = require('./package.json');

const program = new Command();

program.version(packageJson.version, '-v, --version', 'output the current version')
  .description('Endurance CLI to bootstrap new projects');

program
  .command('new-project')
  .description('Create a new project')
  .action(() => {
    // Obtenir le chemin du module endurance-template dans node_modules
    const templatePath = path.resolve(__dirname, 'node_modules', 'endurance-template');
    const currentPath = process.cwd();

    // Copier les fichiers depuis templatePath vers currentPath
    fs.copy(templatePath, currentPath)
      .then(() => {
        console.log('Project created successfully');
      })
      .catch(err => {
        console.error(err);
      });
  });

  program
  .command('new-module <moduleName>')
  .description('Create a new module')
  .action(moduleName => {
    const templatePath = path.resolve(__dirname, 'node_modules', 'endurance-template-module');
    const currentPath = process.cwd();
    const modulePath = path.resolve(currentPath, 'modules', moduleName);

    const replaceModuleNameInFile = (filePath, moduleName) => {
      const data = fs.readFileSync(filePath, 'utf8');
      const result = data.replace(/{module-name}/g, moduleName);
      fs.writeFileSync(filePath, result, 'utf8');
    };

    const processDirectory = (srcDir, destDir, moduleName) => {
      fs.readdirSync(srcDir, { withFileTypes: true }).forEach(dirent => {
        const srcPath = path.join(srcDir, dirent.name);
        const destPath = path.join(destDir, dirent.name.replace(/{module-name}/g, moduleName));

        if (dirent.isDirectory()) {
          fs.ensureDirSync(destDir);
          processDirectory(srcPath, destDir, moduleName);
        } else if (dirent.isFile() && dirent.name !== 'package.json') {
          fs.copySync(srcPath, destPath);
          replaceModuleNameInFile(destPath, moduleName);
        }
      });
    };

    fs.ensureDirSync(modulePath);
    processDirectory(templatePath, modulePath, moduleName);

    console.log(`Module "${moduleName}" created successfully in ${modulePath}`);
  });

program.parse(process.argv);
