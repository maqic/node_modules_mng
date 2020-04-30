#! /usr/bin/env node
const program = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const rimraf = require("rimraf");

const { scanDir } = require('../index');
const pkg = require('../package.json');

program
  .option('-v, --version', 'cli version')
  .action(option => {
    console.log(pkg.version);
  });

program
  .command('list')
  .alias('ls')
  .description('list all node_modules under the [current] directory')
  .option('-d, --dir [directory]', 'directory path', process.cwd())
  .option('-s, --show-size', chalk.yellow('maybe low to calculate the size'))
  .action(option => {
    const spinner = ora().start('Nmm is scanning the directory...');
    const { dir = process.cwd(), showSize } = option;

    const list = scanDir(dir, {
      showSize,
    });
    spinner.stop();
    console.log(list.map(el => `${el.size ? `${el.size}\t` : ''}${chalk.blue(el.dir)}`).join('\n'));

    if (!list.length) {
      console.log(chalk.yellow('no node_modules folder are found'));
      return;
    }
  });

program
  .command('remove')
  .alias('rm')
  .description('remove all node_modules under the [current] directory')
  .option('-d, --dir [directory]', 'directory path', process.cwd())
  .option('-s, --show-size', chalk.yellow('maybe low to calculate the size'))
  .action(option => {
    const spinner = ora().start('Nmm is scanning the directory...');
    const { dir = process.cwd(), showSize } = option;

    const list = scanDir(dir, {
      showSize,
    });
    spinner.stop();
    console.log(list.map(el => `${el.size ? `${el.size}\t` : ''}${chalk.blue(el.dir)}`).join('\n'));

    if (!list.length) {
      console.log(chalk.yellow('no node_modules folder are found'));
      return;
    }

    inquirer.prompt([{
      type: 'confirm',
      name: 'removeConfirm',
      message: 'Are you sure to remove these folders?',
      default: false,
    }]).then(answers => {
      if (answers.removeConfirm) {
        spinner.start('Nmm is removing node_modules folders...');
        return Promise.all(list.map(el => new Promise(resolve => rimraf(el.dir, () => {
          resolve('done');
        }))));
      }

      return Promise.resolve('canceled');
    }).then(result => {
      if (result === 'canceled') {
        console.log('remove task canceled');
      }
      if (spinner.isSpinning) {
        spinner.stop();
        console.log(chalk.green(`🎉 ${list.length} ${list.length > 1 ? 'folders' : 'folder'} removed!`));
      }
    });
  });

program.parse(process.argv);
