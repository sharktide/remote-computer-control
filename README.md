# Remote Computer Control

Remote Computer control is a project developed by me with the purpose to have a computer be controllde by any microcontroller or serial device, especially an arduino or micro:bit. 

## Dependencies

AutoHotKey 1.1 or later
Device with serial capabilites (Arduino, Micro:bit)
Windows Machine

## Currently, this app is not avalible as a pakcaged app, so you will need to install npm and autohotkey. Clone this repository and run 
```shell
npm install electron serialport
```
Then, edit the *main.js* file on lines 55 and 56 to the desired COM port and BAUD rate


Then run the file called *process.ahk* in the root directory of this project. 
Then run 
```shell
npm start
```

In this case, whenever the number 7 is received from the serial monitor, the congruent symbol (≅) is pressed on your computer. Feel free to adjust main.js to change this or add more presses.