import { ipcMain, BrowserWindow, app } from 'electron';
import { autoUpdater } from 'electron-updater';
import { appEvents } from '../..';
import { isWinPortable } from '../../environment';
import { openExternalUrl } from '../../helpers/url-helpers';
import { GITHUB_FERDIUM_URL } from '../../config';

const debug = require('../../preload-safe-debug')('Ferdium:ipcApi:autoUpdate');

export default (params: { mainWindow: BrowserWindow; settings: any }) => {
  const enableUpdate = Boolean(params.settings.app.get('automaticUpdates'));

  // remove after getting out of dev mode
  autoUpdater.forceDevUpdateConfig = true;

  if (!enableUpdate || isWinPortable) {
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.autoDownload = false;
  } else {
    ipcMain.on('autoUpdate', (event, args) => {
      if (enableUpdate) {
        try {
          autoUpdater.autoInstallOnAppQuit = false;
          autoUpdater.allowPrerelease = Boolean(
            params.settings.app.get('beta'),
          );

          if (args.action === 'check') {
            debug('checking for update');
            autoUpdater.checkForUpdates();
            // } else if (args.action === 'openRelease') {
            //   const updateVersion = app.updateVersion;
            //   openExternalUrl(
            //     `${GITHUB_FERDIUM_URL}/ferdium-app/releases/${updateVersion}`,
            //     true,
            //   );
          } else if (args.action === 'install') {
            debug('installing update');

            appEvents.emit('install-update');

            const openedWindows = BrowserWindow.getAllWindows();
            for (const window of openedWindows) window.close();

            autoUpdater.quitAndInstall();
          }
        } catch (error) {
          event.sender.send('autoUpdate', { error });
        }
      }
    });

    autoUpdater.on('update-not-available', () => {
      debug('update-not-available');
      params.mainWindow.webContents.send('autoUpdate', { available: false });
    });

    autoUpdater.on('update-available', event => {
      debug('update-available');

      if (enableUpdate) {
        params.mainWindow.webContents.send('autoUpdate', {
          version: event.version,
          available: true,
        });
        if (isWinPortable)
          params.mainWindow.webContents.send('autoUpdate', {
            downloaded: true,
          });
      }
    });

    autoUpdater.on('download-progress', progressObj => {
      let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
      logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`;
      logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`;

      debug(logMessage);
    });

    autoUpdater.on('update-downloaded', () => {
      debug('update-downloaded');
      params.mainWindow.webContents.send('autoUpdate', { downloaded: true });
    });

    autoUpdater.on('error', error => {
      debug('update-error');
      params.mainWindow.webContents.send('autoUpdate', { error });
    });
  }
};
