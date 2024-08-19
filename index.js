#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');

const program = new Command();

program
  .version('1.0.0')
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
          fs.ensureDirSync(destPath);
          processDirectory(srcPath, destPath, moduleName);
        } else if (dirent.isFile()) {
          fs.copySync(srcPath, destPath);
          replaceModuleNameInFile(destPath, moduleName);
        }
      });
    };

    fs.ensureDirSync(modulePath); 

    processDirectory(templatePath, modulePath, moduleName);

    console.log('Module created successfully');
  });


program.parse(process.argv);
