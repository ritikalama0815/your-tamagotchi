//first thing electron runs when you launch the app
const { app, BrowserWindow, ipcMain} = require('electron');
require('electron-reload')(__dirname) //app will start automatically when there are any changes saved


function createWindow() {
    //this is how electron creates window on desktop
    const window = new BrowserWindow({
        width: 320,
        height: 450,
        resizable: false,
        maximizable: false,
        fullscreenable: false,
        center: true,
        frame:false,
        transparent: true,
        alwaysOnTop: true, //stays visible on desktop
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    window.loadFile('index.html');
    ipcMain.on('window:minimize', ()=> window.minimize());
    ipcMain.on('window:close', ()=> window.close());
}

app.whenReady().then(createWindow) //wait until the app is ready