const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');
const fs = require('fs');
const os = require('os');

const tempDir = os.tmpdir();
const tempFilePath = path.join(tempDir, 'ahk_input.txt');
const configFilePath = path.join(__dirname, 'config.json');

// Default serial mappings
let serialMappings = {
  '7': '{U+2245}',  // Congruency symbol
  '8': '{U+00B5}',  // Micro symbol (µ)
  '9': '{U+03C0}',  // Pi symbol (π)
};

// Load mappings from config file if it exists
function loadMappingsFromFile() {
  if (fs.existsSync(configFilePath)) {
    fs.readFile(configFilePath, (err, data) => {
      if (err) {
        console.error('Error reading mappings file:', err);
      } else {
        serialMappings = JSON.parse(data);
        console.log('Mappings loaded:', serialMappings);
      }
    });
  }
}

// Save mappings to config file
function saveMappingsToFile() {
  fs.writeFile(configFilePath, JSON.stringify(serialMappings), (err) => {
    if (err) {
      console.error('Error saving mappings:', err);
    } else {
      console.log('Mappings saved');
    }
  });
}

// Handle serial connection
let port;
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

app.whenReady().then(() => {
  loadMappingsFromFile();
  createWindow();
});

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



// Handle adding a new serial mapping from the renderer
ipcMain.on('add-mapping', (event, { serialData, unicodeKey }) => {
  serialMappings[serialData] = unicodeKey;

  // Save mappings to the file
  saveMappingsToFile();

  // Send updated mappings to the renderer
  mainWindow.webContents.send('current-mappings', serialMappings);
  console.log('Updated serial mappings:', serialMappings);
});

// Handle deleting a serial mapping
ipcMain.on('delete-mapping', (event, serialData) => {
    if (serialMappings[serialData]) {
      delete serialMappings[serialData];  // Remove the mapping
      saveMappingsToFile();  // Save updated mappings
  
      // Send updated mappings to the renderer
      mainWindow.webContents.send('current-mappings', serialMappings);
      console.log(`Deleted mapping for serial data: ${serialData}`);
    } else {
      console.log(`No mapping found for serial data: ${serialData}`);
    }
  });
  

// Handle the port opening
ipcMain.on('connect-serial', (event, { comPort, baudRate }) => {
    if (port) {
        port.close();
        console.log('Port closed');
    }

    port = new SerialPort({
        path: comPort,
        baudRate: baudRate,
    });

    port.on('open', () => {
        console.log(`Port ${comPort} opened at ${baudRate} baud`);
    });

    port.on('error', (err) => {
        console.error('Error:', err.message);
    });
    // Handle serial data
    let serialData = '';
    port.on('data', (data) => {
    serialData += data.toString();
    let completeData = serialData.split('\n');
    serialData = completeData.pop();

    completeData.forEach(line => {
        const trimmedLine = line.trim();
        console.log('Data:', trimmedLine);
        mainWindow.webContents.send('serial-data', trimmedLine);

        // Check if there's a mapping for the serial data received
        if (serialMappings[trimmedLine]) {
        const unicodeSymbol = serialMappings[trimmedLine];
        console.log(`Simulating keypress for: ${unicodeSymbol}`);

        fs.writeFile(tempFilePath, unicodeSymbol, (err) => {
            if (err) {
            console.error('Error writing to temp file:', err);
            return;
            }
            console.log(`File written to: ${tempFilePath}`);
        });
        }
    });
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

app.on('before-quit', () => {
  if (port && port.isOpen) {
    port.close((err) => {
      if (err) {
        console.error('Error closing port: ', err.message);
      } else {
        console.log('Port closed');
      }
    });
  }
});
