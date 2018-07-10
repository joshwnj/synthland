'use strict'

const electron = require('electron')
const { 
  app, 
  BrowserWindow
} = electron

app.on('ready', () => {
  const win = new BrowserWindow({
    width: 600,
    height: 400
  })
  
  win.loadURL(`file://${__dirname}/dist/index.html`)
})
