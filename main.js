const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport')
const Readline = require('@serialport/parser-readline');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');

const tempDir = os.tmpdir();
const tempFilePath = path.join(tempDir, 'ahk_input.txt');
const irdata7 = '{U+2245}';


function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
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
  

// Initialize the serial port with 'COM9'
const port = new SerialPort({
    path: 'COM9',
    baudRate: 9600,
})

let serialData = ''; // Store incoming data

// Handle data coming in from the serial port



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



// Handle the port opening
port.on('open', () => {
  console.log('Port opened');
});

// Handle errors
port.on('error', (err) => {
  console.error('Error: ', err.message);
});

// IPC handling: Sending commands to the serial port
ipcMain.on('send-command', (event, command) => {
  console.log(`Sending command: ${command}`);
  port.write(`${command}\n`, (err) => {
    if (err) {
      console.error(`Error writing to port: ${err.message}`);
    }
  });
});

/*


   Copyright 2025 Rihaan Meher

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/