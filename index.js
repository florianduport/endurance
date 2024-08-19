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

    const processDirectory = (dirPath, moduleName) => {
      fs.readdirSync(dirPath, { withFileTypes: true }).forEach(dirent => {
        const oldPath = path.join(dirPath, dirent.name);
        const newPath = path.join(dirPath, dirent.name.replace(/{module-name}/g, moduleName));

        if (dirent.isDirectory()) {
          fs.renameSync(oldPath, newPath);
          processDirectory(newPath, moduleName);
        } else if (dirent.isFile()) {
          fs.renameSync(oldPath, newPath);
          replaceModuleNameInFile(newPath, moduleName);
        }
      });
    };

    fs.copy(templatePath, modulePath)
      .then(() => {
        processDirectory(modulePath, moduleName);
        console.log('Module created successfully');
      })
      .catch(err => {
        console.error('Error creating module:', err);
      });
  });

program.parse(process.argv);
