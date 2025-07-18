"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = require("express");
var _notas = require("../controllers/notas.controller");
//Agrego getNotasTemas de controllador notas.controller

var router = (0, _express.Router)();
router.post("/editnotes/:id", _notas.editNotes);
router.post("/transcriptions/:id", _notas.getTrancriptions);
router.post("/media", _notas.getMedia);
router.post("/cortesMedio/:id", _notas.getMediaCuts);
router.get("/palabras", _notas.getPalabras);
router.get("/mediosvt", _notas.getmediosvt);
//Agrego una router.get con el nombre de la constante de notas.controller en este caso getNotasTemas, y le cambio la ruta /getNotasTemas
router.get("/getNotasTemas", _notas.getNotasTemas);
router.get("/nota/:id", _notas.getNotesById);
router.get("/menciones/:id", _notas.getMencionById);
router.get("/temas/:id", _notas.getTemasGeneralesById);
router.get("/coberturas/:id", _notas.getCoberturaId);
router.get("/menciones/", _notas.getMencion);
router.get("/temas/", _notas.getTemasGenerales);
router.get("/coberturas/", _notas.getCoberturas);
router.get("/medio/:id", _notas.getMedio);
router.get("/programas/:id", _notas.getProgramas);
router.post("/mynotes", _notas.getMynotes);
router.get("/mynotesdsk/:id", _notas.getMynotesdsk);
router.get("/tipos", _notas.getTipos);

//deletes 

router.post("/borrarmenciones/:id", _notas.deleteMensiones);
router.post("/borrarCoberturas/:id", _notas.deleteCoberturas);
router.post("/borrarTemas/:id", _notas.deleteTemas);
//insert

router.post("/tema/:id", _notas.InsertTema);
router.post("/cobertura/:id", _notas.InsertCoberturas);
router.post("/menciones/:id", _notas.InsertMencions);
router.post("/actualizarnota/:id", _notas.updateNoticia);
router.post("/actualizarfechanota/:id", _notas.updateFechaNoticia);
router.post("/insertnota/", _notas.InserNoticia);

//login

router.post('/login', _notas.login);

//subir archivo

router.post('/upload', _notas.uploadFile);
var _default = router;
exports["default"] = _default;