'use strict'

const electron = require('electron')
const runInBrowser = require('electron-run-in-browser')
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

  win.webContents.on('dom-ready', function (e) {
    runInBrowser(win, interceptLinks, function () {})
  })
})

function interceptLinks () {
  const shell = require('electron').shell

  document.querySelectorAll('a[href^="http"]').forEach(elem => {
    elem.onclick = function () {
      shell.openExternal(elem.getAttribute('href'))
      return false
    }
  })
}
