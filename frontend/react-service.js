const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
  name: 'FrontendVT',
  description: 'React App as a Windows Service VOZ A TEXTO FRONT',
  script: path.join(__dirname, 'node_modules/serve/build/main.js'),
  scriptOptions: `-s "${path.join(__dirname, 'build')}" -l 3033`
});

svc.on('install', () => {
  svc.start();
});

svc.install();
