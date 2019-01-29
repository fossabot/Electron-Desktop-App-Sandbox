

const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for the app to be ready.
app.on('ready', function(){

    // Create new Window.
    mainWindow = new BrowserWindow({});

    //Load the HTML file in the window. 
    //Below code is passing "file://dirname/mainWindow.html" path to "MainWindow.loadURL".
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //Quit App when closed - Completely, including Sub Window.
    mainWindow.on('closed', function(){
        app.quit();
    });


    //Build Menu from Template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    // Insert the Menu.
    Menu.setApplicationMenu(mainMenu);

});

// Handle Create Add Window
function createAddWindow(){
    // Create new Window.
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item'
    });

    //Load the HTML file in the window. 
    //Below code is passing "file://dirname/mainWindow.html" path to "MainWindow.loadURL".
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    })); 

    // Garbage Collection Handle.
    addWindow.on('close', function(){
        addWindow = null;
    });
}

// Catch item:add.
ipcMain.on('item:add', function(e, item){
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

// Create Menu Template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu:[
            {
                label:'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label:'Clear Items',
                click()
                {
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label:'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// If MacOS, add empty object to Menu.
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add Developer Tools item if not in Production.
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu:[
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusWindow){
                    focusWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}
