import autoUpdate from './autoUpdate';
import settings from './settings';
import appIndicator from './appIndicator';
import download from './download';
import cld from './cld';
import dnd from './dnd';
import desktopCapturer from './desktopCapturer';
import focusState from './focusState';
import fullscreenStatus from './fullscreen';
import subscriptionWindow from './subscriptionWindow';
import serviceCache from './serviceCache';
import browserViewManager from './browserViewManager';
import overlayWindow from './overlayWindow';

export default (params) => {
  settings(params);
  autoUpdate(params);
  appIndicator(params);
  download(params);
  cld(params);
  dnd();
  desktopCapturer();
  focusState(params);
  fullscreenStatus(params);
  subscriptionWindow(params);
  serviceCache();
  browserViewManager(params);
  overlayWindow(params);
};
