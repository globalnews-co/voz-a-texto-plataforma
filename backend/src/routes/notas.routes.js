import { Router } from "express";
//Agrego getNotasTemas de controllador notas.controller
import {getMencionById, 
    getmediosvt,
    getNotasTemas,
    getNotesById,
    getTemasGenerales,
    getCoberturas,
    getTemasGeneralesById,
    getCoberturaId,getMencion,
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
    getMediaCuts,
    getPalabras,
    InserNoticia,
    getMedia,
    getProgramas,
    getMynotes,
    login,uploadFile,
    editNotes,getMynotesdsk} from "../controllers/notas.controller.js"
const router =Router()

router.post("/editnotes/:id",editNotes)

router.post("/transcriptions/:id",getTrancriptions)

router.post("/media",getMedia)

router.post("/cortesMedio/:id",getMediaCuts)

router.get("/palabras",getPalabras)


router.get("/mediosvt",getmediosvt )
//Agrego una router.get con el nombre de la constante de notas.controller en este caso getNotasTemas, y le cambio la ruta /getNotasTemas
router.get("/getNotasTemas",getNotasTemas )

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

//deletes 



router.post("/borrarmenciones/:id",deleteMensiones);

router.post("/borrarCoberturas/:id",deleteCoberturas);

router.post("/borrarTemas/:id",deleteTemas);
//insert

router.post("/tema/:id",InsertTema);

router.post("/cobertura/:id",InsertCoberturas)

router.post("/menciones/:id",InsertMencions)

router.post("/actualizarnota/:id",updateNoticia)

router.post("/actualizarfechanota/:id",updateFechaNoticia)

router.post("/insertnota/",InserNoticia)


//login


router.post('/login',login)


//subir archivo

router.post('/upload',uploadFile)

export default router
