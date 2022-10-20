const {app, BrowserWindow, dialog, Menu} = require('electron');
const path = require('path');
const {autoUpdater} = require('electron-updater');
const log = require('electron-log');

const menuTemplate = [{
    label: 'Help', submenu: [{
        label: 'Check for updates', enabled: true, click: () => autoUpdater.checkForUpdatesAndNotify()
    }, {type: 'separator'}, {role: 'quit'}]
}];

autoUpdater.autoDownload = false;
autoUpdater.logger = log;
log.info('App starting...');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800, height: 600, webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
    createWindow();
});

let updater;
autoUpdater.autoDownload = false;

autoUpdater.on('error', (error) => {
    dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString());
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

autoUpdater.on('update-available', () => {
    log.info('update available');
    dialog.showMessageBox({
        type: 'info', title: 'Found Updates', message: 'Found updates, do you want update now?', buttons: ['Sure', 'No']
    }).then((buttonIndex) => {
        if (buttonIndex.response === 0) {
            autoUpdater.downloadUpdate();
        } else {
            console.log("skipping update");
        }
    });
});

autoUpdater.on('update-not-available', () => {
    dialog.showMessageBox({
        title: 'No Updates', message: 'Current version is up-to-date.'
    });
});

autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        title: 'Install Updates', message: 'Updates downloaded, application will be quit for update...'
    }).then(() => {
        setImmediate(() => autoUpdater.quitAndInstall());
    });
});
