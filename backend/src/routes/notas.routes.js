// src/routes/notas.routes.js - Versión corregida

import { Router } from "express";

// Import ALL functions from notas.controller.js
import {
    getMencionById,
    getmediosvt,
    getNotasTemas,
    getNotesById,
    getTemasGenerales,
    getCoberturas,
    getTemasGeneralesById,
    getCoberturaId,
    getMencion,
    getMedio,
    getTipos,
    deleteMensiones,
    deleteCoberturas,
    deleteTemas,
    InsertCoberturas,
    InsertTema,
    InsertMencions,
    updateNoticia,
    updateFechaNoticia,
    getTrancriptions,
    getMediaCuts, // Función principal actualizada
    obtenerRangoCortes, // Nueva función ✓
    buscarCortePorNombre, // Nueva función ✓
    validarCoherenciaCortesHTTP, // Nueva función (cambié el nombre para evitar conflicto)
    getEstadisticasCortes, // Nueva función ✓
    getContextoNavegacionCorte, // Nueva función ✓
    getPalabras,
    InserNoticia,
    getMedia,
    getProgramas,
    getMynotes,
    login,
    uploadFile,
    takeCapture,
    uploadCaptureMiddleware,
    editNotes,
    getMynotesdsk,
    getMediaCutsAll // Nueva función para obtener todos los cortes de un medio (funcionalidad antigua)
} from "../controllers/notas.controller.js";

// Import ALL functions from cortador.controller.js
import {
    InserNoticiaTresCortes,
    getEstadoCortes,
    getLogsCortes
} from "../controllers/cortador.controller.js";

const router = Router();

// =============================================
// ROUTES FOR THREE CUTS MANAGEMENT (from cortador.controller.js)
// =============================================

router.post("/cortador/tres-cortes", InserNoticiaTresCortes);
router.get("/cortador/estado-cortes", getEstadoCortes);
router.get("/cortador/logs-cortes", getLogsCortes);
router.post('/cortesMedioAll/:id', getMediaCutsAll);
// =============================================
// ROUTES FOR ENHANCED CUTS NAVIGATION (from notas.controller.js)
// =============================================

// *** RUTA CRÍTICA ACTUALIZADA ***
// Esta ruta ahora maneja el contexto de cortes (anterior, actual, posterior)
router.post("/cortesMedio/:id", getMediaCuts);

// Nuevas rutas para manejo avanzado de cortes
router.post("/cortes/rango", obtenerRangoCortes);
router.get("/corte/buscar/:idMedio/:nombreArchivo", buscarCortePorNombre);
router.post("/cortes/validar-coherencia", validarCoherenciaCortesHTTP);
router.get("/cortes/estadisticas/:idMedio/:fecha", getEstadisticasCortes);
router.get("/corte/contexto/:idMedio/:idRegistro", getContextoNavegacionCorte);

// =============================================
// GENERAL NOTES ROUTES (from notas.controller.js)
// =============================================

router.post("/editnotes/:id", editNotes);
router.post("/transcriptions/:id", getTrancriptions);
router.post("/media", getMedia);
router.post("/media/capture", uploadCaptureMiddleware, takeCapture);
router.get("/palabras", getPalabras);
router.get("/mediosvt", getmediosvt);
router.get("/getNotasTemas", getNotasTemas);
router.get("/nota/:id", getNotesById);
router.get("/menciones/:id", getMencionById);
router.get("/temas/:id", getTemasGeneralesById);
router.get("/coberturas/:id", getCoberturaId);
router.get("/menciones/", getMencion);
router.get("/temas/", getTemasGenerales);
router.get("/coberturas/", getCoberturas);
router.get("/medio/:id", getMedio);
router.get("/programas/:id", getProgramas);
router.post("/mynotes", getMynotes);
router.get("/mynotesdsk/:id", getMynotesdsk);
router.get("/tipos", getTipos);

// Deletion routes
router.post("/borrarmenciones/:id", deleteMensiones);
router.post("/borrarCoberturas/:id", deleteCoberturas);
router.post("/borrarTemas/:id", deleteTemas);

// Insertion/Update routes
router.post("/tema/:id", InsertTema);
router.post("/cobertura/:id", InsertCoberturas);
router.post("/menciones/:id", InsertMencions);
router.post("/actualizarnota/:id", updateNoticia);
router.post("/actualizarfechanota/:id", updateFechaNoticia);
router.post("/insertnota/", InserNoticia);

// Authentication route
router.post('/login', login);

// File upload route
router.post('/upload', uploadFile);

export default router;