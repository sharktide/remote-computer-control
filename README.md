# Remote Computer Control

Remote Computer control is a project developed by me with the purpose to have a computer be controllde by any microcontroller or serial device, especially an arduino or micro:bit. 

## Dependencies

AutoHotKey 1.1 or later
Device with serial capabilites (Arduino, Micro:bit)
Windows Machine

Currently, this app is not avalible as a pakcaged app, so you will need to install npm and autohotkey. Clone this repository and run 
```shell
npm install electron serialport
```


Then run the file called *process.ahk* in the root directory of this project. 
Then run 
```shell
npm start
```

Once the app launches, you can add listeners for serial messages and link them to a corresponding unicode key to be typed!

