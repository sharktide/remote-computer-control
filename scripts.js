const { ipcRenderer } = require('electron');

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'styles.css';
document.head.appendChild(link);

// Display available serial ports
ipcRenderer.on('available-ports', (event, ports) => {
    const comPortSelect = document.getElementById('comPort');
    ports.forEach(port => {
    const option = document.createElement('option');
    option.value = port;
    option.textContent = port;
    comPortSelect.appendChild(option);
    });
});

// Display current mappings and add a "Delete" button
ipcRenderer.on('current-mappings', (event, mappings) => {
    const mappingsOutput = document.getElementById('mappings');
    mappingsOutput.innerHTML = '';  // Clear previous mappings

    for (let serialData in mappings) {
        const unicodeKey = mappings[serialData];
        const div = document.createElement('div');
        div.textContent = `${serialData}: ${unicodeKey}`;
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.id = 'delMappingButton';
        deleteButton.onclick = () => {
            const confirmation = confirm(`Are you sure you want to delete the mapping, "${serialData}: ${unicodeKey}"?`);
            if (confirmation) {
                deleteMapping(serialData);
            }
        };
        
        div.appendChild(deleteButton);
        mappingsOutput.appendChild(div);
    }
});

// Add new serial event mapping
function addMapping() {
    const serialData = document.getElementById('serialData').value.trim();
    const unicodeKey = document.getElementById('unicodeKey').value.trim();

    if (serialData && unicodeKey) {
    ipcRenderer.send('add-mapping', { serialData, unicodeKey });
    }
}

// Delete a serial event mapping
function deleteMapping(serialData) {
    ipcRenderer.send('delete-mapping', serialData);
}

// Connect to the serial port
function connectSerial() {
    const comPort = document.getElementById('comPort').value;
    const baudRate = parseInt(document.getElementById('baudRate').value, 10);
    document.getElementById('connectcontainer').style.display = 'none'
    ipcRenderer.send('connect-serial', { comPort, baudRate });
}

// Send command to serial port
function sendCommand() {
    const command = document.getElementById('command').value;
    ipcRenderer.send('send-command', command);
}

// Display serial data output
ipcRenderer.on('serial-data', (event, data) => {
    const output = document.getElementById('output');
    output.textContent += `\n${data}`;
});