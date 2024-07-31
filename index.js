#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');

const program = new Command();

program
  .version('1.0.0')
  .description('Endurance CLI to bootstrap new projects');

program
  .command('new')
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

program.parse(process.argv);
