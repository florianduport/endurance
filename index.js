#!/usr/bin/env node

const { Command } = require('commander');
const ncp = require('ncp').ncp;
const path = require('path');
const fs = require('fs');

const program = new Command();

program
  .version('1.0.0')
  .description('Endurance CLI to bootstrap new projects');

program
  .command('new')
  .description('Create a new project')
  .action(() => {
    const templatePath = path.resolve(__dirname, 'node_modules', 'endurance-template');
    const currentPath = process.cwd();

    ncp(templatePath, currentPath, (err) => {
      if (err) {
        return console.error(err);
      }
      console.log('Project created successfully');
    });
  });

program.parse(process.argv);