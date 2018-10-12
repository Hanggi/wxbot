"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var autoUpdater = require("electron-updater").autoUpdater;
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";
autoUpdater.logger.info('App starting...');
// var Menu = require("menu");
var win, serve;
var args = process.argv.slice(1);
serve = args.some(function (val) { return val === '--serve'; });
function createWindow() {
    var electronScreen = electron_1.screen;
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        x: 100,
        y: 100,
        width: size.width - 200,
        height: size.height - 200,
        webPreferences: {
            webSecurity: false
        }
    });
    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(__dirname + "/node_modules/electron")
        });
        win.loadURL('http://localhost:4200');
        win.webContents.openDevTools();
        console.log("Server mode;");
    }
    else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    var template = [
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                // {role: 'pasteandmatchstyle'},
                // {role: 'delete'},
                { role: 'selectall' }
            ]
        }
    ];
    //
    if (process.platform === 'darwin') {
        template.unshift({
            label: "Dvinqi",
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services', submenu: [] },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });
    }
    var menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
    // autoUpdater.checkForUpdatesAndNotify();
    // console.log(autoUpdater)
    autoUpdater.checkForUpdatesAndNotify();
    // console.log("aaaa")
    electron_1.ipcMain.on("checkForUpdate", function () {
        //执行自动更新检查
        console.log("check for update");
        autoUpdater.checkForUpdatesAndNotify();
    });
    autoUpdater.on('checking-for-update', function () {
        console.log('Checking for update...');
    });
    autoUpdater.on('update-available', function (info) {
        console.log('Update available.');
    });
    autoUpdater.on('update-not-available', function (info) {
        console.log('Update not available.');
    });
    autoUpdater.on('error', function (err) {
        console.log('Error in auto-updater. ' + err);
    });
    autoUpdater.on('download-progress', function (progressObj) {
        var speed = progressObj.bytesPerSecond / 1000 + "KB/s";
        var percentage = progressObj.percent.toFixed(2) + '%';
        var files = (progressObj.transferred / 1000000).toFixed(0) + "/" + (progressObj.total / 1000000).toFixed(0);
        console.log(percentage);
        win.webContents.send('downloadProgress', {
            speed: speed,
            percentage: percentage,
            files: files
        });
    });
    autoUpdater.on('update-downloaded', function (info) {
        console.log('Update downloaded');
        electron_1.ipcMain.on('doUpdateNow', function (e, arg) {
            console.log(arg);
            console.log("开始更新");
            //some code here to handle event
            autoUpdater.quitAndInstall();
        });
        win.webContents.send('isUpdateNow');
    });
}
// autoUpdater.setFeedURL({
// 	provider: "s3", // 这里还可以是 github, s3, bintray
// 	url: "https://s3.console.aws.amazon.com/s3/buckets/davinqi/?region=us-east-1&tab=overview"
// });
try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    electron_1.app.on('ready', createWindow);
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
    // let mainWindow = null;
    //
    // const isAlreadyRunning = app.makeSingleInstance(() => {
    // 	if (mainWindow) {
    // 		if (mainWindow.isMinimized()) {
    // 			mainWindow.restore();
    // 		}
    //
    // 		mainWindow.show();
    // 	}
    // });
    //
    // if (isAlreadyRunning) {
    // 	alert("请勿打开多个")
    // 	app.quit();
    // }
}
catch (e) {
    // Catch Error
    // throw e;
}
//https://github.com/DavinqiRobot/Davinqi-wk/releases/download/v1.3.1/Davinqi.Setup.1.3.1.exe.blockmap
//https://github.com/DavinqiRobot/Davinqi-wk/releases/download/v1.3.1/Davinqi-Setup-1.3.1.exe.blockmap
