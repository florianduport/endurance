#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import packageJson from './package.json' assert { type: 'json' };

const program = new Command();

program.version(packageJson.version, '-v, --version', 'output the current version')
  .description('Endurance CLI to bootstrap new projects');

program
  .command('new-project')
  .description('Create a new project')
  .action(() => {

    const findModulePath = (moduleName) => {
      const possiblePaths = [
        path.resolve(path.dirname(''), 'node_modules', moduleName), 
        path.resolve(path.dirname(''), 'node_modules', 'endurance', 'node_modules', moduleName) 
      ];

      for (const modulePath of possiblePaths) {
        if (fs.existsSync(modulePath)) {
          return modulePath;
        }
      }

      throw new Error(`Module ${moduleName} not found in expected locations.`);
    };

    try {
      const templatePath = findModulePath('endurance-template');
      const currentPath = process.cwd();

      fs.copy(templatePath, currentPath)
        .then(() => {
          console.log('Project created successfully');
        })
        .catch(err => {
          console.error('Error copying template:', err);
        });
    } catch (err) {
      console.error(err.message);
    }
  });

program
  .command('new-module <moduleName>')
  .description('Create a new module')
  .action(moduleName => {

    const findModulePath = (moduleName) => {
      const possiblePaths = [
        path.resolve(path.dirname(''), 'node_modules', moduleName), 
        path.resolve(path.dirname(''), 'node_modules', 'endurance', 'node_modules', moduleName) 
      ];

      for (const modulePath of possiblePaths) {
        if (fs.existsSync(modulePath)) {
          return modulePath;
        }
      }

      throw new Error(`Module ${moduleName} not found in expected locations.`);
    };

    try {
      const templatePath = findModulePath('endurance-template-module');
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
          } else if (dirent.isFile() && dirent.name !== 'package.json') {
            fs.copySync(srcPath, destPath);
            replaceModuleNameInFile(destPath, moduleName);
          }
        });
      };

      fs.ensureDirSync(modulePath);
      processDirectory(templatePath, modulePath, moduleName);

      console.log(`Module "${moduleName}" created successfully in ${modulePath}`);
    } catch (err) {
      console.error(err.message);
    }
  });

program
  .command('list-events')
  .description('List all available events across modules and specific node_modules')
  .action(() => {
    const searchEventsInDirectory = (dirPath, results = [], moduleName = '') => {
      fs.readdirSync(dirPath, { withFileTypes: true }).forEach(dirent => {
        const fullPath = path.join(dirPath, dirent.name);

        if (dirent.isDirectory()) {
          searchEventsInDirectory(fullPath, results, moduleName || dirent.name);
        } else if (dirent.isFile() && fullPath.endsWith('.js')) {
          const fileContent = fs.readFileSync(fullPath, 'utf8');
          const eventMatches = fileContent.match(/emitter\.emit\((eventTypes\.[\w_]+)/g);

          if (eventMatches) {
            eventMatches.forEach(event => {
              results.push({ event, file: fullPath, module: moduleName || 'Unknown module' });
            });
          }
        }
      });

      return results;
    };

    let results = [];

    const modulesPath = path.resolve(process.cwd(), 'modules');
    results = searchEventsInDirectory(modulesPath, results);

    const nodeModulesPath = path.resolve(process.cwd(), 'node_modules');
    const enduranceCorePath = path.join(nodeModulesPath, 'endurance-core');
    const edrmModules = fs.readdirSync(nodeModulesPath).filter(dir => dir.startsWith('edrm-'));

    if (fs.existsSync(enduranceCorePath)) {
      results = searchEventsInDirectory(enduranceCorePath, results, 'endurance-core');
    }

    edrmModules.forEach(moduleName => {
      const modulePath = path.join(nodeModulesPath, moduleName);
      results = searchEventsInDirectory(modulePath, results, moduleName);
    });

    if (results.length === 0) {
      console.log('No events found.');
    } else {
      results.forEach(result => {
        console.log(`Event: ${result.event} | File: ${result.file} | Module: ${result.module}`);
      });
    }
  });

program
  .command('list-env-vars')
  .description('List all environment variables used across modules and specific node_modules')
  .action(() => {
    const searchEnvVarsInDirectory = (dirPath, results = [], moduleName = '') => {
      fs.readdirSync(dirPath, { withFileTypes: true }).forEach(dirent => {
        const fullPath = path.join(dirPath, dirent.name);

        if (dirent.isDirectory()) {
          searchEnvVarsInDirectory(fullPath, results, moduleName || dirent.name);
        } else if (dirent.isFile() && fullPath.endsWith('.js')) {
          const fileContent = fs.readFileSync(fullPath, 'utf8');
          const envVarMatches = fileContent.match(/process\.env\.[\w_]+/g);

          if (envVarMatches) {
            envVarMatches.forEach(envVar => {
              results.push({ envVar, file: fullPath, module: moduleName || 'Unknown module' });
            });
          }
        }
      });

      return results;
    };

    let results = [];

    const modulesPath = path.resolve(process.cwd(), 'modules');
    results = searchEnvVarsInDirectory(modulesPath, results);

    const nodeModulesPath = path.resolve(process.cwd(), 'node_modules');
    const enduranceCorePath = path.join(nodeModulesPath, 'endurance-core');
    const edrmModules = fs.readdirSync(nodeModulesPath).filter(dir => dir.startsWith('edrm-'));

    if (fs.existsSync(enduranceCorePath)) {
      results = searchEnvVarsInDirectory(enduranceCorePath, results, 'endurance-core');
    }

    edrmModules.forEach(moduleName => {
      const modulePath = path.join(nodeModulesPath, moduleName);
      results = searchEnvVarsInDirectory(modulePath, results, moduleName);
    });

    if (results.length === 0) {
      console.log('No environment variables found.');
    } else {
      results.forEach(result => {
        console.log(`Environment Variable: ${result.envVar} | File: ${result.file} | Module: ${result.module}`);
      });
    }
  });

program.parse(process.argv);
