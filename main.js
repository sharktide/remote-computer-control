const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');
const Readline = require('@serialport/parser-readline');
const fs = require('fs');
const os = require('os');

const tempDir = os.tmpdir();
const tempFilePath = path.join(tempDir, 'ahk_input.txt');
const irdata7 = '{U+2245}';

let port; // This will hold the active serial port object
let mainWindow; // To keep track of the main window

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  // List available serial ports and send them to the renderer process
  SerialPort.list()
    .then(ports => {
      const availablePorts = ports.map(port => port.path);
      mainWindow.webContents.send('available-ports', availablePorts);
    })
    .catch(err => {
      console.error('Error listing ports:', err);
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
    port.close((err) => {
      if (err) {
        console.error('Error closing port: ', err.message);
      } else {
        console.log('Port closed');
      }
    });
});

// Handle serial connection
ipcMain.on('connect-serial', (event, { comPort, baudRate }) => {
  if (port) {
    port.close();
    console.log('Port closed');
  }

  port = new SerialPort({
    path: comPort,
    baudRate: baudRate,
  });

  //const parser = port.pipe(new Readline({ delimiter: '\n' }));

  port.on('open', () => {
    console.log(`Port ${comPort} opened at ${baudRate} baud`);
  });
  let serialData = ''; // Store incoming data

  port.on('data', function (data) {
    serialData += data.toString();
    let completeData = serialData.split('\n');
    serialData = completeData.pop();
  
    completeData.forEach(line => {
      console.log('Data:', line.trim());
      BrowserWindow.getAllWindows()[0].webContents.send('serial-data', line.trim());
      if (line.trim() === '7') {
          console.log('Simulating keypress for ≅ symbol');
          fs.writeFile(tempFilePath, irdata7, (err) => {
              if (err) {
                console.error('Error writing to temp file:', err);
                return;
              }
              console.log(`File written to: ${tempFilePath}`);
          });
      }
    });
  });

  port.on('error', (err) => {
    console.error('Error:', err.message);
  });
});

// IPC handling for sending commands to the serial port
ipcMain.on('send-command', (event, command) => {
  if (port) {
    console.log(`Sending command: ${command}`);
    port.write(`${command}\n`, (err) => {
      if (err) {
        console.error(`Error writing to port: ${err.message}`);
      }
    });
  } else {
    console.log('No port is open');
  }
});
