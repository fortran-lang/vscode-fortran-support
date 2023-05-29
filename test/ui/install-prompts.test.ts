import { strictEqual } from 'assert';
import { spawnSync } from 'child_process';
import * as path from 'path';

import { VSBrowser, WebDriver, Workbench } from 'vscode-extension-tester';

describe('Download dependencies', () => {
  let browser: VSBrowser;
  let driver: WebDriver;

  before(async () => {
    spawnSync('python3', ['-m', 'pip', 'uninstall', 'fortls', 'findent', '-y']);
    browser = VSBrowser.instance;
    driver = browser.driver;
    const root = path.resolve(__dirname, '../../../test/fortran/lsp');
    await browser.openResources(root);
    await browser.openResources(`${path.resolve(root, 'main.f90')}`);
  });

  describe('Download fortls language server', () => {
    it('install via pip', async () => {
      const workbench = new Workbench();
      const infos = await workbench.getNotifications();

      for (const info of infos) {
        const message = await info.getMessage();
        const actions = await info.getActions();
        const title = await actions[0].getTitle();
        console.log(message);
        await info.takeAction(title);
        strictEqual(title, 'Install');
      }
    });
  });

  describe('Download findent', () => {
    it('install via pip', async () => {
      const workbench = new Workbench();
      await workbench.executeCommand('Format Document');
      const infos = await workbench.getNotifications();

      for (const info of infos) {
        const message = await info.getMessage();
        const actions = await info.getActions();
        const title = await actions[0].getTitle();
        console.log(`2nd lool: ${message}`);
        await info.takeAction(title);
        strictEqual(title, 'Install');
      }
    });
  });
});
