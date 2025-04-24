const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
  name: 'BackendVT',
  description: 'Node.js Express App as a Windows Service BACKEND VT',
  script: path.join(__dirname, 'src/index.js') // Ruta al archivo de entrada de tu aplicación
});

svc.on('install', () => {
  svc.start();
});

svc.install();
