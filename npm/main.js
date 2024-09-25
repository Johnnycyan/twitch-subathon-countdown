const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Get the base directory where the .exe is located, then move up one level
const baseDir = path.dirname(path.dirname(app.getPath('exe')));

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');
  
  // Remove the menu
  win.removeMenu();
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

function settingsToString(settings) {
  let result = '';
  for (const [key, value] of Object.entries(settings)) {
      if (key === 'cssVariables') continue; // Skip cssVariables
      if (typeof value === 'string') {
          result += `var ${key} = "${value}"\n`;
      } else if (Array.isArray(value)) {
          result += `var ${key} = [${value.join(', ')}]\n`;
      } else {
          result += `var ${key} = ${value}\n`;
      }
  }
  return result;
}

ipcMain.on('save-settings', (event, settings) => {
  const configPath = path.join(baseDir, 'config.js');
  const { cssVariables, ...configSettings } = settings; // Separate cssVariables from other settings
  const configContent = settingsToString(configSettings);
  
  fs.writeFile(configPath, configContent, (err) => {
      if (err) {
          event.reply('save-settings-response', { success: false, message: err.message });
      } else {
          // Save CSS variables to vars.css
          const cssVarsPath = path.join(baseDir, 'css', 'vars.css');
          const cssVarsContent = `:root {\n${Object.entries(cssVariables).map(([key, value]) => `  --${key}: ${value};`).join('\n')}\n}`;
          
          fs.writeFile(cssVarsPath, cssVarsContent, (cssErr) => {
              if (cssErr) {
                  event.reply('save-settings-response', { success: false, message: cssErr.message });
              } else {
                  event.reply('save-settings-response', { success: true });
              }
          });
      }
  });
});

ipcMain.on('load-settings', (event) => {
  const configPath = path.join(baseDir, 'config.js');
  const cssVarsPath = path.join(baseDir, 'css', 'vars.css');
  
  fs.readFile(configPath, 'utf8', (err, data) => {
      if (err) {
          event.reply('load-settings-response', { success: false, message: err.message });
      } else {
          const settings = {};
          data.split('\n').forEach(line => {
              const match = line.match(/var\s+(\w+)\s*=\s*(.*)/);
              if (match) {
                  const [, key, value] = match;
                  try {
                      settings[key] = JSON.parse(value);
                  } catch {
                      settings[key] = value.replace(/"/g, '');
                  }
              }
          });

          // Load CSS variables
          fs.readFile(cssVarsPath, 'utf8', (cssErr, cssData) => {
              if (!cssErr) {
                  const cssVars = {};
                  cssData.match(/--[\w-]+:\s*[^;]+/g)?.forEach(match => {
                      const [key, value] = match.split(':').map(s => s.trim());
                      cssVars[key.slice(2)] = value;
                  });
                  settings.cssVariables = cssVars;
              }
              event.reply('load-settings-response', { success: true, settings });
          });
      }
  });
});
