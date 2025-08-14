import { getConnection, querys, sql } from "../database/index.js"
import ffmpeg from 'fluent-ffmpeg';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from "dotenv";
import moment from 'moment';
import axios from 'axios';
import { exec } from 'child_process';

config();
let tempFiles = [];

const configureFFmpeg = () => {
  const ffmpegPath = process.env.FFMPEG_PATH;

  if (ffmpegPath && ffmpegPath.trim() !== '' && ffmpegPath !== 'undefined') {
    if (fs.existsSync(ffmpegPath)) {
      ffmpeg.setFfmpegPath(ffmpegPath);
      return true;
    }
  }

  const isWindows = process.platform === 'win32';

  if (isWindows) {
    const commonPaths = [
      'C:\\ffmpeg\\bin\\ffmpeg.exe',
      'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
      'C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe',
      path.join(process.cwd(), 'ffmpeg', 'bin', 'ffmpeg.exe'),
      path.join(process.cwd(), 'bin', 'ffmpeg.exe')
    ];

    for (const testPath of commonPaths) {
      if (fs.existsSync(testPath)) {
        ffmpeg.setFfmpegPath(testPath);
        return true;
      }
    }
  }

  try {
    ffmpeg.setFfmpegPath('ffmpeg');
    return true;
  } catch (error) {
    return false;
  }
};

let ffmpegConfigured = false;
try {
  ffmpegConfigured = configureFFmpeg();

  if (ffmpegConfigured) {
    ffmpeg.getAvailableFormats((err, formats) => {
      if (err) {
        ffmpegConfigured = false;
      }
    });
  }

} catch (error) {
  ffmpegConfigured = false;
}

export const isFFmpegAvailable = () => {
  return ffmpegConfigured;
};

const captureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'form-captures');

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `nota_${timestamp}.png`;
    cb(null, filename);
  }
});

const obtenerDuracionArchivo = (rutaArchivo) => {
  return new Promise((resolve, reject) => {
    console.log(`[DEBUG] Obteniendo duración del archivo: ${rutaArchivo}`);

    ffmpeg.ffprobe(rutaArchivo, (err, metadata) => {
      if (err) {
        console.error(`[ERROR] No se pudo obtener metadata del archivo: ${rutaArchivo}`, err.message);
        reject(err);
      } else {
        const duracion = metadata.format.duration;
        console.log(`[DEBUG] Duración obtenida del archivo ${path.basename(rutaArchivo)}: ${duracion} segundos`);
        console.log(`[DEBUG] Metadata completa:`, {
          duration: metadata.format.duration,
          bit_rate: metadata.format.bit_rate,
          size: metadata.format.size,
          format_name: metadata.format.format_name
        });
        resolve(Math.floor(duracion));
      }
    });
  });
};

// Función nueva para obtener duración de archivo remoto
const obtenerDuracionArchivoRemoto = async (url) => {
    return new Promise((resolve, reject) => {
        console.log(`[DEBUG] Obteniendo duración de archivo remoto: ${url}`);
        
        ffmpeg.ffprobe(url, (err, metadata) => {
            if (err) {
                console.error(`[ERROR] No se pudo obtener metadata del archivo remoto: ${url}`, err.message);
                reject(err);
            } else {
                const duracion = metadata.format.duration;
                console.log(`[DEBUG] Duración obtenida remotamente: ${duracion}s = ${Math.floor(duracion/60)}:${(duracion%60).toFixed(0).padStart(2,'0')}`);
                resolve(Math.floor(duracion));
            }
        });
    });
};

const calcularDuracionTotal = async (tiempoInicio, tiempoFin, cortesInvolucrados, esCorteFusionado) => {
    console.log(`[DEBUG] Calculando duración total. esCorteFusionado: ${esCorteFusionado}`);
    
    let duracionTotal = 0;

    if (esCorteFusionado && cortesInvolucrados && cortesInvolucrados.length > 1) {
        console.log(`[DEBUG] Procesando ${cortesInvolucrados.length} cortes fusionados`);
        
        for (let i = 0; i < cortesInvolucrados.length; i++) {
            const corte = cortesInvolucrados[i];
            let duracionSegmento = 0;
            
            console.log(`[DEBUG] Procesando corte ${i + 1}:`, {
                esCorteCompleto: corte.esCorteCompleto,
                tiempoInicio: corte.tiempoInicio,
                tiempoFin: corte.tiempoFin,
                linkStreaming: corte.linkStreaming
            });
            
            if (corte.esCorteCompleto) {
                duracionSegmento = 300;
                console.log(`[DEBUG] Corte ${i + 1} es completo, asignando 300 segundos`);
            } else {
                const inicio = corte.tiempoInicio || 0;
                let fin = corte.tiempoFin;
                
                console.log(`[DEBUG] Corte ${i + 1} - Tiempo inicio: ${inicio}, Tiempo fin original: ${fin}`);
                
                if (fin === null || fin === undefined || fin === 0) {
                    console.log(`[DEBUG] Corte ${i + 1} sin tiempo fin, obteniendo duración real del archivo`);
                    try {
                        const duracionCompleta = await obtenerDuracionArchivoRemoto(corte.linkStreaming);
                        console.log(`[DEBUG] Corte ${i + 1} - Duración completa del archivo: ${duracionCompleta} segundos`);
                        
                        fin = duracionCompleta;
                        console.log(`[DEBUG] Corte ${i + 1} - Tiempo fin actualizado a: ${fin}`);
                        
                    } catch (error) {
                        console.error(`[ERROR] Corte ${i + 1} - Error obteniendo duración:`, error.message);
                        fin = inicio + 60;
                        console.log(`[DEBUG] Corte ${i + 1} - Usando duración por defecto: ${fin} (inicio + 60)`);
                    }
                }
                
                if (fin > inicio) {
                    duracionSegmento = fin - inicio;
                    console.log(`[DEBUG] Corte ${i + 1} - Duración calculada: ${duracionSegmento} segundos (${fin} - ${inicio})`);
                } else {
                    duracionSegmento = 30;
                    console.log(`[DEBUG] Corte ${i + 1} - Fin <= inicio, usando duración por defecto: 30 segundos`);
                }
            }
            
            duracionTotal += duracionSegmento;
            console.log(`[DEBUG] Corte ${i + 1} - Duración del segmento: ${duracionSegmento}s, Duración total acumulada: ${duracionTotal}s`);
        }
    } else {
        console.log(`[DEBUG] Procesando corte único`);
        console.log(`[DEBUG] Datos del corte único:`, {
            tiempoInicio: tiempoInicio,
            tiempoFin: tiempoFin
        });
        
        if (tiempoInicio && tiempoFin && tiempoInicio.tiempo !== undefined && tiempoFin.tiempo !== undefined) {
            duracionTotal = tiempoFin.tiempo - tiempoInicio.tiempo;
            console.log(`[DEBUG] Duración calculada del corte único: ${duracionTotal}s (${tiempoFin.tiempo} - ${tiempoInicio.tiempo})`);
        } else {
            duracionTotal = 60;
            console.log(`[DEBUG] Datos de tiempo incompletos, usando duración por defecto: 60 segundos`);
        }
    }

    const duracionFinal = Math.max(duracionTotal, 1);
    console.log(`[DEBUG] Duración total final: ${duracionFinal} segundos`);
    
    return duracionFinal;
};

const probarExtraccion = () => {
    console.log("=== PRUEBAS DE EXTRACCIÓN ===");
    
    // Caso 1: 4594120250721_133000 → 2025-07-21 13:30:00
    const fecha1 = extraerFechaDeNombreMedio("4594120250721_133000");
    console.log("Caso 1:", fecha1?.toISOString());
    
    // Caso 2: 4594120250721_134500 → 2025-07-21 13:45:00  
    const fecha2 = extraerFechaDeNombreMedio("4594120250721_134500");
    console.log("Caso 2:", fecha2?.toISOString());
    
    // Verificación de cálculos
    if (fecha1) {
        const inicioConTiempo = new Date(fecha1.getTime() + (600 * 1000)); // +10 minutos
        console.log("Inicio calculado (13:30 + 10min):", inicioConTiempo.toISOString());
        console.log("Debe ser: 2025-07-21T13:40:00.000Z");
    }
    
    if (fecha2) {
        const finConTiempo = new Date(fecha2.getTime() + (60 * 1000)); // +1 minuto
        console.log("Fin calculado (13:45 + 1min):", finConTiempo.toISOString());
        console.log("Debe ser: 2025-07-21T13:46:00.000Z");
    }
    
    console.log("=== FIN PRUEBAS ===");
};

const extraerFechaDeNombreMedio = (nombreMedio) => {
    console.log(`[DEBUG] Extrayendo fecha de NombreMedio: ${nombreMedio}`);
    
    // Formato observado: 4594120250721_133000
    // MMMM + YYYYMMDD_HHMMSS donde MMMM es el medio (4594), luego año completo (2025), mes (07), día (21)
    const regex = /(\d{4})(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})$/;
    const match = nombreMedio.match(regex);
    
    if (!match) {
        console.error(`[ERROR] No se pudo extraer fecha de: ${nombreMedio}`);
        console.error(`[ERROR] Formato esperado: MMMMYYYYMMDD_HHMMSS`);
        return null;
    }
    
    // Extraer componentes correctamente
    const medio = match[1];     // 4594
    const year = match[2];      // 2025
    const month = match[3];     // 07
    const day = match[4];       // 21
    const hour = match[5];      // 13
    const minute = match[6];    // 30 (para _133000) o 45 (para _134500)
    const second = match[7];    // 00
    
    // Construir fecha ISO (en UTC para evitar problemas de timezone)
    const fechaISO = `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
    const fecha = new Date(fechaISO);
    
    console.log(`[DEBUG] Fecha extraída exitosamente:`, {
        nombreMedio,
        medio,
        year,
        month,
        day,
        hour,
        minute,
        second,
        fechaISO,
        fechaFinal: fecha.toISOString()
    });
    
    return fecha;
};

const calcularFechasCorrectas = (tiempoInicio, tiempoFin, cortesInvolucrados, esCorteFusionado) => {
    console.log(`[DEBUG] Calculando fechas correctas usando NombreMedio:`);
    console.log(`  - esCorteFusionado: ${esCorteFusionado}`);
    
    let fechaInicioCalculada, fechaFinCalculada, fechaTransmitida;

    if (esCorteFusionado && cortesInvolucrados && cortesInvolucrados.length > 1) {
        // Para cortes fusionados
        const primerCorte = cortesInvolucrados[0];
        const ultimoCorte = cortesInvolucrados[cortesInvolucrados.length - 1];

        console.log(`[DEBUG] Primer corte nombreCorte: ${primerCorte.nombreCorte}`);
        console.log(`[DEBUG] Último corte nombreCorte: ${ultimoCorte.nombreCorte}`);

        // Extraer fecha real del primer corte
        const fechaPrimerCorte = extraerFechaDeNombreMedio(primerCorte.nombreCorte);
        if (!fechaPrimerCorte) {
            throw new Error(`No se pudo extraer fecha del primer corte: ${primerCorte.nombreCorte}`);
        }
        
        // Extraer fecha real del último corte
        const fechaUltimoCorte = extraerFechaDeNombreMedio(ultimoCorte.nombreCorte);
        if (!fechaUltimoCorte) {
            throw new Error(`No se pudo extraer fecha del último corte: ${ultimoCorte.nombreCorte}`);
        }

        // Calcular fechas correctas
        fechaInicioCalculada = new Date(fechaPrimerCorte.getTime() + (primerCorte.tiempoInicio * 1000));
        fechaFinCalculada = new Date(fechaUltimoCorte.getTime() + (ultimoCorte.tiempoFin * 1000));
        fechaTransmitida = new Date(fechaPrimerCorte);

        console.log(`[DEBUG] Cálculo fusionado CORRECTO:`);
        console.log(`  - Primer corte: ${primerCorte.nombreCorte} → ${fechaPrimerCorte.toISOString()}`);
        console.log(`  - Tiempo inicio: ${primerCorte.tiempoInicio}s`);
        console.log(`  - Fecha inicio final: ${fechaInicioCalculada.toISOString()}`);
        console.log(`  - Último corte: ${ultimoCorte.nombreCorte} → ${fechaUltimoCorte.toISOString()}`);
        console.log(`  - Tiempo fin: ${ultimoCorte.tiempoFin}s`);
        console.log(`  - Fecha fin final: ${fechaFinCalculada.toISOString()}`);

        // Calcular duración inicial (será refinada después con archivos reales)
        const duracionPorFechas = (fechaFinCalculada - fechaInicioCalculada) / 1000;
        console.log(`[DEBUG] Duración inicial por fechas: ${duracionPorFechas}s = ${Math.floor(duracionPorFechas/60)}:${(duracionPorFechas%60).toFixed(0).padStart(2,'0')}`);

    } else {
        // Para corte único
        const corte = tiempoInicio.corte;
        
        // Extraer fecha real del NombreMedio
        const fechaCorte = extraerFechaDeNombreMedio(corte.NombreMedio);
        if (!fechaCorte) {
            throw new Error(`No se pudo extraer fecha del corte: ${corte.NombreMedio}`);
        }

        fechaInicioCalculada = new Date(fechaCorte.getTime() + (tiempoInicio.tiempo * 1000));
        fechaFinCalculada = new Date(fechaCorte.getTime() + (tiempoFin.tiempo * 1000));
        fechaTransmitida = new Date(fechaCorte);

        console.log(`[DEBUG] Cálculo único CORRECTO:`);
        console.log(`  - NombreMedio: ${corte.NombreMedio} → ${fechaCorte.toISOString()}`);
        console.log(`  - Tiempo inicio: ${tiempoInicio.tiempo}s`);
        console.log(`  - Tiempo fin: ${tiempoFin.tiempo}s`);
        console.log(`  - Fecha inicio final: ${fechaInicioCalculada.toISOString()}`);
        console.log(`  - Fecha fin final: ${fechaFinCalculada.toISOString()}`);
    }

    return {
        fechaInicio: fechaInicioCalculada,
        fechaFin: fechaFinCalculada,
        fechaTransmitida: fechaTransmitida
    };
};

export const InserNoticiaTresCortes = async (req, res) => {
    let transaction;
    tempFiles = [];

    try {
        const {
            titulo,
            aclaracion,
            entrevistado,
            medioid,
            programaid,
            conductores,
            tiponoticiaid,
            tipotonoid,
            userid,
            fechaAlta,
            tiempoInicio,
            tiempoFin,
            esCorteFusionado,
            cortesInvolucrados,
            temas = [],
            coberturas = []
        } = req.body;

        console.log(`[DEBUG] === INICIO PROCESAMIENTO CON FECHAS ===`);

        const fechaAltaValida = fechaAlta || new Date().toISOString();
        
        if (!titulo || !aclaracion || !tiempoInicio || !tiempoFin || !userid || !medioid) {
            return res.status(400).json({
                error: 'Faltan datos obligatorios'
            });
        }

        // **CALCULAR FECHAS CORRECTAS USANDO NOMBREMEDIO**
        const fechasCorrectas = calcularFechasCorrectas(tiempoInicio, tiempoFin, cortesInvolucrados, esCorteFusionado);
        
        console.log(`[DEBUG] Fechas calculadas para BD:`);
        console.log(`  - Inicio: ${fechasCorrectas.fechaInicio.toISOString()}`);
        console.log(`  - Fin: ${fechasCorrectas.fechaFin.toISOString()}`);
        console.log(`  - Duración calculada: ${(fechasCorrectas.fechaFin - fechasCorrectas.fechaInicio) / 1000}s`);

        const pool = await getConnection();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Calcular duración basada en fechas reales
        const duracionReal = Math.ceil((fechasCorrectas.fechaFin - fechasCorrectas.fechaInicio) / 1000);
        let cantidadCortes = cortesInvolucrados ? cortesInvolucrados.length : 1;

        const insertNoticia = `
            INSERT INTO [AuditoriaRadioTelevision].[dbo].[Noticias] (
                [Aclaracion], [Entrevistado], [MedioID], [ProgramaID], [Conductores], 
                [TipoNoticiaID], [Titulo], [TipoTonoID], [FechaInicio], [FechaFin], 
                [Duracion], [FechaTransmitido], [UserID], [FlagCortado], [FlagProcesado], 
                [AVE_opcion], [ClavesClasificacion]
            ) 
            VALUES (
                @aclaracion, @entrevistado, @medioid, @programaid, @conductores,
                @tiponoticiaid, @titulo, @tipotonoid, @fechaInicio, @fechaFin,
                @duracion, @fechaTransmitido, @userid, @flagCortado, 'P',
                1, ''
            );
            SELECT SCOPE_IDENTITY() AS noticiaId;
        `;

        const request = new sql.Request(transaction);
        const resultNoticia = await request
            .input('aclaracion', sql.Text, aclaracion)
            .input('entrevistado', sql.VarChar(255), entrevistado || '')
            .input('medioid', sql.Int, medioid)
            .input('programaid', sql.Int, programaid || 0)
            .input('conductores', sql.VarChar(255), conductores || '')
            .input('tiponoticiaid', sql.Int, tiponoticiaid || 1)
            .input('tipotonoid', sql.Int, tipotonoid || 5)
            .input('titulo', sql.VarChar(255), titulo)
            .input('fechaInicio', sql.DateTime, fechasCorrectas.fechaInicio)
            .input('fechaFin', sql.DateTime, fechasCorrectas.fechaFin)
            .input('duracion', sql.Int, duracionReal)
            .input('fechaTransmitido', sql.DateTime, fechasCorrectas.fechaTransmitida)
            .input('userid', sql.UniqueIdentifier, userid)
            .input('flagCortado', sql.Char(1), 'P')
            .query(insertNoticia);

        const noticiaId = resultNoticia.recordset[0].noticiaId;

        console.log(`[SUCCESS] Noticia creada con ID: ${noticiaId}`);
        console.log(`[SUCCESS] Duración en BD: ${duracionReal} segundos`);

        // Insertar registros de cortes
        if (esCorteFusionado && cortesInvolucrados && cortesInvolucrados.length > 1) {
            for (let i = 0; i < cortesInvolucrados.length; i++) {
                const corte = cortesInvolucrados[i];

                const insertCorte = `
                    INSERT INTO [Videoteca_dev].[dbo].[NoticiasVT] (
                        [IDNoticia], [CorteUrl], [inicio], [fin], [Estado]
                    ) VALUES (
                        @noticiaId, @corteUrl, @inicio, @fin, @estado
                    )`;

                const requestCorte = new sql.Request(transaction);
                await requestCorte
                    .input('noticiaId', sql.Int, noticiaId)
                    .input('corteUrl', sql.VarChar(500), corte.linkStreaming)
                    .input('inicio', sql.Int, corte.tiempoInicio || 0)
                    .input('fin', sql.Int, corte.tiempoFin || null)
                    .input('estado', sql.Char(1), 'P')
                    .query(insertCorte);
            }
        }

        // Insertar temas y coberturas...
        if (temas && temas.length > 0) {
            for (const tema of temas) {
                const insertTema = `
                    INSERT INTO [AuditoriaRadioTelevision].[dbo].[NoticiasTemasGenerales] (
                        [NoticiaID], [TemaGeneralID], [FechaAlta], [UserID]
                    ) VALUES (@noticiaId, @temaId, @fechaAlta, @userId)`;

                const requestTema = new sql.Request(transaction);
                await requestTema
                    .input('noticiaId', sql.Int, noticiaId)
                    .input('temaId', sql.Int, tema)
                    .input('fechaAlta', sql.DateTime, fechaAltaValida)
                    .input('userId', sql.UniqueIdentifier, userid)
                    .query(insertTema);
            }
        }

        if (coberturas && coberturas.length > 0) {
            for (const cobertura of coberturas) {
                const insertCobertura = `
                    INSERT INTO [AuditoriaRadioTelevision].[dbo].[NoticiasCoberturas] (
                        [NoticiaID], [CoberturaID], [FechaAlta]
                    ) VALUES (@noticiaId, @coberturaId, @fechaAlta)`;

                const requestCobertura = new sql.Request(transaction);
                await requestCobertura
                    .input('noticiaId', sql.Int, noticiaId)
                    .input('coberturaId', sql.Int, cobertura)
                    .input('fechaAlta', sql.DateTime, fechaAltaValida)
                    .query(insertCobertura);
            }
        }

        await transaction.commit();

        // **PROCESAR AUDIO USANDO FECHAS**
        let urlFinal = '';
        try {
            console.log(`[DEBUG] === INICIANDO PROCESAMIENTO DE AUDIO POR FECHAS ===`);
            
            urlFinal = await procesarCortesPorFechas(
                fechasCorrectas.fechaInicio,
                fechasCorrectas.fechaFin, 
                cortesInvolucrados, 
                noticiaId
            );
            
            await actualizarNoticiaConArchivoFinal(noticiaId, urlFinal);
            
        } catch (processingError) {
            console.error(`[ERROR] Error en procesamiento de audio:`, processingError);
            await marcarNoticiaComoError(noticiaId, processingError.message);
            urlFinal = cortesInvolucrados[0]?.linkStreaming || tiempoInicio.corte?.LinkStreamming || '';
        }

        // Limpiar archivos temporales
        tempFiles.forEach(file => {
            try {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            } catch (cleanupError) {
                console.warn('Error limpiando archivo temporal:', cleanupError);
            }
        });

        const respuesta = {
            success: true,
            noticiaId: noticiaId,
            cantidadCortes: cantidadCortes,
            duracionTotal: duracionReal,
            esCorteFusionado: esCorteFusionado,
            urlFinal: urlFinal,
            mensaje: `Noticia creada con duración exacta de ${Math.floor(duracionReal/60)}:${(duracionReal%60).toString().padStart(2,'0')}`,
            detalles: {
                titulo: titulo,
                fechaInicio: fechasCorrectas.fechaInicio.toISOString(),
                fechaFin: fechasCorrectas.fechaFin.toISOString(),
                duracionExacta: duracionReal
            }
        };

        console.log(`[DEBUG] === PROCESAMIENTO COMPLETADO ===`);
        console.log(`Noticia ID: ${noticiaId}, Duración final: ${duracionReal}s`);
        
        res.status(201).json(respuesta);

    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Error al revertir transacción:', rollbackError);
            }
        }

        tempFiles.forEach(file => {
            try {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            } catch (cleanupError) {
                console.warn('Error limpiando archivo temporal:', cleanupError);
            }
        });

        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: error.message
        });
    }
};

const actualizarDuracionNoticia = async (noticiaId, duracionReal) => {
    try {
        const pool = await getConnection();
        
        console.log(`[DEBUG] Actualizando duración de noticia ${noticiaId} a ${duracionReal} segundos`);
        
        await pool.request()
            .input('noticiaId', sql.Int, noticiaId)
            .input('duracion', sql.Int, duracionReal)
            .query(`
                UPDATE [AuditoriaRadioTelevision].[dbo].[Noticias] 
                SET [Duracion] = @duracion
                WHERE [NoticiaID] = @noticiaId
            `);
        
        console.log(`[DEBUG] Duración actualizada exitosamente en la base de datos`);
        
    } catch (error) {
        console.error(`[ERROR] Error actualizando duración en base de datos:`, error.message);
        // No lanzamos el error para no interrumpir el proceso principal
    }
};

const procesarMultiplesCortes = async (cortesInvolucrados, noticiaId) => {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const segmentosArchivos = [];
    let duracionRealTotal = 0; // Nueva variable para acumular duración real
    
    try {
        for (let i = 0; i < cortesInvolucrados.length; i++) {
            const corte = cortesInvolucrados[i];
            const nombreSegmento = `segmento_${i}_${noticiaId}.aac`;
            const rutaSegmento = path.join(tempDir, nombreSegmento);
            
            const archivoOriginal = await descargarArchivo(corte.linkStreaming, tempDir);
            
            let tiempoFin = corte.tiempoFin;
            if (tiempoFin === null || tiempoFin === undefined || tiempoFin === 0) {
                try {
                    const duracionCompleta = await obtenerDuracionArchivo(archivoOriginal);
                    const inicio = corte.tiempoInicio || 0;
                    tiempoFin = Math.min(inicio + 300, duracionCompleta);
                } catch (error) {
                    tiempoFin = (corte.tiempoInicio || 0) + 300;
                }
            }
            
            await cortarSegmento(
                archivoOriginal, 
                rutaSegmento, 
                corte.tiempoInicio || 0, 
                tiempoFin
            );
            
            // Obtener la duración real del segmento cortado
            const duracionRealSegmento = await obtenerDuracionArchivo(rutaSegmento);
            duracionRealTotal += duracionRealSegmento;
            
            console.log(`[DEBUG] Segmento ${i + 1} - Duración real: ${duracionRealSegmento}s`);
            
            segmentosArchivos.push(rutaSegmento);
            tempFiles.push(archivoOriginal, rutaSegmento);
        }
        
        console.log(`[DEBUG] Duración real total de todos los segmentos: ${duracionRealTotal}s`);
        
        const urlFinal = await unirYGuardarSegmentos(segmentosArchivos, noticiaId);
        
        // Actualizar la duración en la base de datos con la duración real
        await actualizarDuracionNoticia(noticiaId, Math.ceil(duracionRealTotal));
        
        return urlFinal;
        
    } catch (error) {
        throw error;
    }
};

// Función corregida para cortar con duración exacta
const cortarSegmento = (archivoEntrada, archivoSalida, inicio, fin) => {
    return new Promise((resolve, reject) => {
        console.log(`[DEBUG] Cortando segmento:`);
        console.log(`  - Archivo entrada: ${archivoEntrada}`);
        console.log(`  - Archivo salida: ${archivoSalida}`);
        console.log(`  - Inicio: ${inicio}s`);
        console.log(`  - Fin: ${fin}s`);
        console.log(`  - Duración a cortar: ${fin - inicio}s`);
        
        let comando = ffmpeg(archivoEntrada);
        
        if (fin !== null && fin !== undefined && fin > inicio) {
            // USAR -ss (inicio) y -to (fin) en lugar de -t (duración)
            // Esto es más preciso para obtener exactamente el rango deseado
            comando = comando
                .seekInput(inicio)
                .inputOptions(['-to', fin.toString()]);
            
            console.log(`[DEBUG] Usando -ss ${inicio} -to ${fin} para corte preciso`);
        } else {
            // Si no hay fin específico, cortar desde el inicio hasta el final
            comando = comando.seekInput(inicio);
            console.log(`[DEBUG] Cortando desde ${inicio}s hasta el final del archivo`);
        }
        
        comando
            .audioCodec('aac')
            .output(archivoSalida)
            .on('start', (commandLine) => {
                console.log(`[DEBUG] Comando FFmpeg iniciado: ${commandLine}`);
            })
            .on('progress', (progress) => {
                console.log(`[DEBUG] Progreso del corte: ${progress.percent || 0}% - Tiempo: ${progress.timemark || 'N/A'}`);
            })
            .on('end', () => {
                console.log(`[DEBUG] Corte completado exitosamente: ${archivoSalida}`);
                
                // Verificar el archivo generado
                if (fs.existsSync(archivoSalida)) {
                    const stats = fs.statSync(archivoSalida);
                    console.log(`[DEBUG] Archivo generado - Tamaño: ${stats.size} bytes`);
                    
                    // Obtener duración del archivo cortado
                    ffmpeg.ffprobe(archivoSalida, (err, metadata) => {
                        if (!err && metadata.format.duration) {
                            const duracionReal = metadata.format.duration;
                            const duracionEsperada = fin - inicio;
                            console.log(`[DEBUG] Duración real del archivo cortado: ${duracionReal}s`);
                            console.log(`[DEBUG] Duración esperada: ${duracionEsperada}s`);
                            console.log(`[DEBUG] Diferencia: ${Math.abs(duracionReal - duracionEsperada)}s`);
                        }
                    });
                }
                
                resolve();
            })
            .on('error', (error) => {
                console.error(`[ERROR] Error al cortar segmento:`, error.message);
                console.error(`[ERROR] Parámetros del corte:`, {
                    entrada: archivoEntrada,
                    salida: archivoSalida,
                    inicio: inicio,
                    fin: fin
                });
                reject(error);
            })
            .run();
    });
};

// Función corregida: usar duración exacta calculada
const concatenarPorFechas = async (fechaInicio, fechaFin, cortesInvolucrados, noticiaId) => {
    return new Promise(async (resolve, reject) => {
        const tempDir = path.join(process.cwd(), 'temp');
        const archivoFinal = path.join(tempDir, `noticia_${noticiaId}_fechas.mp4`);
        
        console.log(`[DEBUG] === CONCATENACIÓN CORREGIDA CON DURACIÓN EXACTA ===`);
        
        // Ordenar cortes por fecha
        const cortesOrdenados = cortesInvolucrados.sort((a, b) => {
            const fechaA = extraerFechaDeNombreMedio(a.nombreCorte);
            const fechaB = extraerFechaDeNombreMedio(b.nombreCorte);
            return fechaA - fechaB;
        });
        
        try {
            // Obtener duración real del primer archivo
            const primerCorte = cortesOrdenados[0];
            const fechaPrimerCorte = extraerFechaDeNombreMedio(primerCorte.nombreCorte);
            const offsetInicio = Math.max(0, (fechaInicio - fechaPrimerCorte) / 1000);
            
            console.log(`[DEBUG] Obteniendo duración real del primer archivo para cálculo exacto...`);
            const duracionRealPrimero = await obtenerDuracionArchivoRemoto(primerCorte.linkStreaming);
            const duracionPrimerCorte = duracionRealPrimero - offsetInicio;
            
            console.log(`[DEBUG] === CÁLCULO EXACTO ===`);
            console.log(`[DEBUG] Primer archivo duración real: ${duracionRealPrimero}s`);
            console.log(`[DEBUG] Offset: ${offsetInicio}s`);
            console.log(`[DEBUG] Duración primer corte: ${duracionPrimerCorte}s`);
            
            const filtrosConcat = [];
            const inputFiles = [];
            
            cortesOrdenados.forEach((corte, index) => {
                const fechaCorte = extraerFechaDeNombreMedio(corte.nombreCorte);
                
                let parametrosTrim = [];
                
                if (index === 0) {
                    // PRIMER CORTE: usar duración exacta calculada
                    parametrosTrim.push(`start=${offsetInicio}`);
                    parametrosTrim.push(`duration=${duracionPrimerCorte}`);
                    
                    console.log(`[DEBUG] PRIMER CORTE - DURACIÓN EXACTA:`);
                    console.log(`  - Archivo: ${corte.nombreCorte}`);
                    console.log(`  - Start: ${offsetInicio}s`);
                    console.log(`  - Duration: ${duracionPrimerCorte}s`);
                    
                } else if (index === cortesOrdenados.length - 1) {
                    // ÚLTIMO CORTE: desde el inicio hasta el tiempo exacto
                    const tiempoFinEnCorte = (fechaFin - fechaCorte) / 1000;
                    parametrosTrim.push(`start=0`);
                    parametrosTrim.push(`duration=${tiempoFinEnCorte}`);
                    
                    console.log(`[DEBUG] ÚLTIMO CORTE - DURACIÓN EXACTA:`);
                    console.log(`  - Archivo: ${corte.nombreCorte}`);
                    console.log(`  - Start: 0s`);
                    console.log(`  - Duration: ${tiempoFinEnCorte}s`);
                    
                } else {
                    // CORTES INTERMEDIOS: completos (si los hubiera)
                    // No agregar parámetros = usar completo
                }
                
                inputFiles.push(corte.linkStreaming);
                
                // Crear filtro para este segmento
                let filtro = `[${index}:a]`;
                if (parametrosTrim.length > 0) {
                    filtro += `atrim=${parametrosTrim.join(':')}[a${index}]`;
                } else {
                    filtro += `acopy[a${index}]`;
                }
                
                filtrosConcat.push(filtro);
            });
            
            // Calcular duración total esperada
            const segundoCorte = cortesOrdenados[1];
            const fechaSegundoCorte = extraerFechaDeNombreMedio(segundoCorte.nombreCorte);
            const duracionSegundoCorte = (fechaFin - fechaSegundoCorte) / 1000;
            const duracionTotalEsperada = duracionPrimerCorte + duracionSegundoCorte;
            
            console.log(`[DEBUG] === RESUMEN DURACIÓN EXACTA ===`);
            console.log(`[DEBUG] Primer corte: ${duracionPrimerCorte}s = ${Math.floor(duracionPrimerCorte/60)}:${(duracionPrimerCorte%60).toFixed(0).padStart(2,'0')}`);
            console.log(`[DEBUG] Segundo corte: ${duracionSegundoCorte}s = ${Math.floor(duracionSegundoCorte/60)}:${(duracionSegundoCorte%60).toFixed(0).padStart(2,'0')}`);
            console.log(`[DEBUG] Total esperado: ${duracionTotalEsperada}s = ${Math.floor(duracionTotalEsperada/60)}:${(duracionTotalEsperada%60).toFixed(0).padStart(2,'0')}`);
            
            // Filtro final de concatenación
            const labelsConcatenacion = cortesOrdenados.map((_, index) => `[a${index}]`).join('');
            const filtroConcatenacionFinal = `${labelsConcatenacion}concat=n=${cortesOrdenados.length}:v=0:a=1[outa]`;
            
            const filtroCompleto = filtrosConcat.join(';') + ';' + filtroConcatenacionFinal;
            
            console.log(`[DEBUG] Filtro FFmpeg FINAL EXACTO: ${filtroCompleto}`);
            
            // Ejecutar FFmpeg con filtro complejo
            let comando = ffmpeg();
            
            // Agregar todos los archivos de entrada
            inputFiles.forEach(archivo => {
                comando = comando.input(archivo);
            });
            
            comando
                .complexFilter(filtroCompleto)
                .map('[outa]')
                .audioCodec('aac')
                .output(archivoFinal)
                .on('start', (commandLine) => {
                    console.log(`[DEBUG] Comando FFmpeg FINAL: ${commandLine}`);
                })
                .on('progress', (progress) => {
                    console.log(`[DEBUG] Progreso: ${progress.percent || 0}% - ${progress.timemark || 'N/A'}`);
                })
                .on('end', () => {
                    console.log(`[DEBUG] === CONCATENACIÓN COMPLETADA ===`);
                    console.log(`[DEBUG] Archivo final: ${archivoFinal}`);
                    resolve(archivoFinal);
                })
                .on('error', (error) => {
                    console.error(`[ERROR] Error en concatenación:`, error.message);
                    reject(error);
                })
                .run();
                
        } catch (error) {
            console.error(`[ERROR] Error en concatenación:`, error.message);
            reject(error);
        }
    });
};

// Función corregida que calcula duración real con archivos reales
const calcularDuracionRealParaBD = async (fechaInicio, fechaFin, cortesInvolucrados) => {
    console.log(`[DEBUG] === CALCULANDO DURACIÓN REAL PARA BD ===`);
    
    const cortesOrdenados = cortesInvolucrados.sort((a, b) => {
        const fechaA = extraerFechaDeNombreMedio(a.nombreCorte);
        const fechaB = extraerFechaDeNombreMedio(b.nombreCorte);
        return fechaA - fechaB;
    });
    
    let duracionTotal = 0;
    
    try {
        // Primer corte: obtener duración real del archivo
        const primerCorte = cortesOrdenados[0];
        const fechaPrimerCorte = extraerFechaDeNombreMedio(primerCorte.nombreCorte);
        const offsetInicio = Math.max(0, (fechaInicio - fechaPrimerCorte) / 1000);
        
        console.log(`[DEBUG] === PRIMER CORTE ===`);
        console.log(`[DEBUG] Obteniendo duración real del archivo: ${primerCorte.linkStreaming}`);
        
        const duracionRealPrimero = await obtenerDuracionArchivoRemoto(primerCorte.linkStreaming);
        const duracionPrimerCorte = duracionRealPrimero - offsetInicio;
        
        console.log(`[DEBUG] Primer corte:`);
        console.log(`  - Duración real archivo: ${duracionRealPrimero}s = ${Math.floor(duracionRealPrimero/60)}:${(duracionRealPrimero%60).toFixed(0).padStart(2,'0')}`);
        console.log(`  - Offset inicio: ${offsetInicio}s = ${Math.floor(offsetInicio/60)}:${(offsetInicio%60).toFixed(0).padStart(2,'0')}`);
        console.log(`  - Duración final primer corte: ${duracionPrimerCorte}s = ${Math.floor(duracionPrimerCorte/60)}:${(duracionPrimerCorte%60).toFixed(0).padStart(2,'0')}`);
        
        duracionTotal += duracionPrimerCorte;
        
        // Segundo corte
        if (cortesOrdenados.length > 1) {
            const segundoCorte = cortesOrdenados[1];
            const fechaSegundoCorte = extraerFechaDeNombreMedio(segundoCorte.nombreCorte);
            const duracionSegundoCorte = (fechaFin - fechaSegundoCorte) / 1000;
            
            console.log(`[DEBUG] === SEGUNDO CORTE ===`);
            console.log(`[DEBUG] Segundo corte:`);
            console.log(`  - Archivo: ${segundoCorte.linkStreaming}`);
            console.log(`  - Duración: ${duracionSegundoCorte}s = ${Math.floor(duracionSegundoCorte/60)}:${(duracionSegundoCorte%60).toFixed(0).padStart(2,'0')}`);
            
            duracionTotal += duracionSegundoCorte;
        }
        
        // Cortes intermedios (si existen)
        for (let i = 1; i < cortesOrdenados.length - 1; i++) {
            const corteIntermedio = cortesOrdenados[i];
            console.log(`[DEBUG] === CORTE INTERMEDIO ${i} ===`);
            
            const duracionRealIntermedio = await obtenerDuracionArchivoRemoto(corteIntermedio.linkStreaming);
            console.log(`[DEBUG] Corte intermedio ${i} - Duración completa: ${duracionRealIntermedio}s`);
            
            duracionTotal += duracionRealIntermedio;
        }
        
    } catch (error) {
        console.error(`[ERROR] No se pudo obtener duración real de archivos:`, error.message);
        console.log(`[DEBUG] Fallback: calculando con duración estimada por fechas`);
        
        // Fallback: usar el cálculo por fechas
        duracionTotal = (fechaFin - fechaInicio) / 1000;
    }
    
    console.log(`[DEBUG] === DURACIÓN TOTAL REAL: ${duracionTotal}s = ${Math.floor(duracionTotal/60)}:${(duracionTotal%60).toFixed(0).padStart(2,'0')} ===`);
    console.log(`[DEBUG] Duración esperada por fechas: ${(fechaFin - fechaInicio) / 1000}s`);
    console.log(`[DEBUG] Diferencia: ${Math.abs(duracionTotal - (fechaFin - fechaInicio) / 1000)}s`);
    
    return Math.ceil(duracionTotal);
};

const moverArchivoADestino = async (archivoTemporal, noticiaId) => {
    const fecha = new Date();
    const mes = fecha.getMonth() + 1;
    const mes2 = mes.toString().padStart(2, '0');
    const year = fecha.getFullYear();
    
    const rutaDestino = `\\\\192.168.1.88\\web\\Alertas\\${year}\\${mes2}\\${noticiaId}.mp4`;
    const urlFinal = `https://storage09.globalnews.com.co/Alertas/${year}/${mes2}/${noticiaId}.mp4`;
    
    console.log(`[DEBUG] Moviendo archivo a destino: ${rutaDestino}`);
    
    try {
        await copiarArchivoADestino(archivoTemporal, rutaDestino);
        
        if (fs.existsSync(archivoTemporal)) {
            fs.unlinkSync(archivoTemporal);
            console.log(`[DEBUG] Archivo temporal eliminado`);
        }
        
        return urlFinal;
        
    } catch (error) {
        console.error(`[ERROR] Error moviendo archivo:`, error);
        throw error;
    }
};

const procesarCortesPorFechas = async (fechaInicio, fechaFin, cortesInvolucrados, noticiaId) => {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    console.log(`[DEBUG] === PROCESANDO CORTES POR FECHAS ===`);
    console.log(`[DEBUG] Fecha inicio BD: ${fechaInicio.toISOString()}`);
    console.log(`[DEBUG] Fecha fin BD: ${fechaFin.toISOString()}`);
    console.log(`[DEBUG] Duración total esperada: ${(fechaFin - fechaInicio) / 1000} segundos`);

    try {
        // Calcular duración esperada con archivos reales
        const duracionRealEsperada = await calcularDuracionRealParaBD(fechaInicio, fechaFin, cortesInvolucrados);
        console.log(`[DEBUG] Duración real esperada: ${duracionRealEsperada}s`);
        
        // Crear un solo archivo concatenado directamente con las fechas exactas
        const archivoFinal = await concatenarPorFechas(fechaInicio, fechaFin, cortesInvolucrados, noticiaId);
        
        // Verificar duración del archivo final
        const duracionReal = await obtenerDuracionArchivo(archivoFinal);
        console.log(`[DEBUG] Duración real del archivo final: ${duracionReal}s`);
        console.log(`[DEBUG] Diferencia con esperada: ${Math.abs(duracionReal - duracionRealEsperada)}s`);
        
        // Actualizar BD con duración real
        await actualizarDuracionNoticia(noticiaId, Math.ceil(duracionReal));
        
        // Mover a destino final
        const urlFinal = await moverArchivoADestino(archivoFinal, noticiaId);
        
        return urlFinal;
        
    } catch (error) {
        console.error(`[ERROR] Error en procesamiento por fechas:`, error);
        throw error;
    }
};

// Función alternativa usando formato tiempo específico para mayor precisión
const cortarSegmentoConFormatoTiempo = (archivoEntrada, archivoSalida, inicio, fin) => {
    return new Promise((resolve, reject) => {
        console.log(`[DEBUG] Cortando segmento con formato tiempo:`);
        console.log(`  - Archivo entrada: ${archivoEntrada}`);
        console.log(`  - Archivo salida: ${archivoSalida}`);
        console.log(`  - Inicio: ${inicio}s`);
        console.log(`  - Fin: ${fin}s`);
        
        // Convertir segundos a formato HH:MM:SS.mmm
        const formatearTiempo = (segundos) => {
            const horas = Math.floor(segundos / 3600);
            const minutos = Math.floor((segundos % 3600) / 60);
            const segs = segundos % 60;
            return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toFixed(3).padStart(6, '0')}`;
        };
        
        const tiempoInicio = formatearTiempo(inicio);
        const tiempoFin = formatearTiempo(fin);
        
        console.log(`[DEBUG] Tiempo inicio formateado: ${tiempoInicio}`);
        console.log(`[DEBUG] Tiempo fin formateado: ${tiempoFin}`);
        
        let comando = ffmpeg(archivoEntrada);
        
        if (fin !== null && fin !== undefined && fin > inicio) {
            // Usar formato de tiempo preciso
            comando = comando
                .inputOptions(['-ss', tiempoInicio])
                .inputOptions(['-to', tiempoFin]);
        } else {
            comando = comando.inputOptions(['-ss', tiempoInicio]);
        }
        
        comando
            .audioCodec('aac')
            .output(archivoSalida)
            .on('start', (commandLine) => {
                console.log(`[DEBUG] Comando FFmpeg con tiempo preciso: ${commandLine}`);
            })
            .on('progress', (progress) => {
                console.log(`[DEBUG] Progreso del corte: ${progress.percent || 0}% - Tiempo: ${progress.timemark || 'N/A'}`);
            })
            .on('end', () => {
                console.log(`[DEBUG] Corte completado exitosamente: ${archivoSalida}`);
                
                // Verificar duración real
                if (fs.existsSync(archivoSalida)) {
                    ffmpeg.ffprobe(archivoSalida, (err, metadata) => {
                        if (!err && metadata.format.duration) {
                            const duracionReal = metadata.format.duration;
                            const duracionEsperada = fin - inicio;
                            console.log(`[DEBUG] === VERIFICACIÓN DE DURACIÓN ===`);
                            console.log(`[DEBUG] Duración esperada: ${duracionEsperada}s (${Math.floor(duracionEsperada/60)}:${(duracionEsperada%60).toFixed(0).padStart(2,'0')})`);
                            console.log(`[DEBUG] Duración real: ${duracionReal}s (${Math.floor(duracionReal/60)}:${(duracionReal%60).toFixed(0).padStart(2,'0')})`);
                            console.log(`[DEBUG] Diferencia: ${Math.abs(duracionReal - duracionEsperada).toFixed(3)}s`);
                            console.log(`[DEBUG] ================================`);
                        }
                    });
                }
                
                resolve();
            })
            .on('error', (error) => {
                console.error(`[ERROR] Error al cortar segmento:`, error.message);
                reject(error);
            })
            .run();
    });
};

const procesarCorteUnico = async (tiempoInicio, tiempoFin, noticiaId) => {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    try {
        const archivoOriginal = await descargarArchivo(tiempoInicio.corte.LinkStreamming, tempDir);
        
        const urlFinal = await cortarYGuardarSegmento(
            archivoOriginal, 
            noticiaId, 
            tiempoInicio.tiempo, 
            tiempoFin.tiempo
        );
        
        tempFiles.push(archivoOriginal);
        
        return urlFinal;
        
    } catch (error) {
        throw error;
    }
};

const descargarArchivo = async (url, directorio) => {
  const nombreArchivo = path.basename(url);
  const rutaCompleta = path.join(directorio, nombreArchivo);

  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
    timeout: 60000
  });

  const writer = fs.createWriteStream(rutaCompleta);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      resolve(rutaCompleta);
    });
    writer.on('error', (error) => {
      reject(error);
    });
  });
};

const unirYGuardarSegmentos = async (archivosSegmentos, noticiaId) => {
    return new Promise((resolve, reject) => {
        const fecha = new Date();
        const mes = fecha.getMonth() + 1;
        const mes2 = mes.toString().padStart(2, '0');
        const year = fecha.getFullYear();
        
        const tempDir = path.join(process.cwd(), 'temp');
        const archivoTemporal = path.join(tempDir, `noticia_${noticiaId}_final.mp4`);
        
        const rutaDestino = `\\\\192.168.1.88\\web\\Alertas\\${year}\\${mes2}\\${noticiaId}.mp4`;
        const urlFinal = `https://storage09.globalnews.com.co/Alertas/${year}/${mes2}/${noticiaId}.mp4`;
        
        const listaArchivos = path.join(tempDir, `lista_${noticiaId}.txt`);
        const contenidoLista = archivosSegmentos.map(archivo => `file '${archivo.replace(/\\/g, '/')}'`).join('\n');
        
        try {
            fs.writeFileSync(listaArchivos, contenidoLista);
            
            ffmpeg()
                .input(listaArchivos)
                .inputOptions(['-f', 'concat', '-safe', '0'])
                .audioCodec('aac')
                .output(archivoTemporal)
                .on('start', (commandLine) => {
                    console.log(`[DEBUG] Comando FFmpeg para unir segmentos: ${commandLine}`);
                })
                .on('progress', (progress) => {
                    console.log(`[DEBUG] Progreso de unión: ${progress.percent || 0}% - Tiempo: ${progress.timemark || 'N/A'}`);
                })
                .on('end', async () => {
                    try {
                        if (fs.existsSync(listaArchivos)) {
                            fs.unlinkSync(listaArchivos);
                        }
                        
                        // Obtener duración real del archivo final unido
                        if (fs.existsSync(archivoTemporal)) {
                            const duracionFinalReal = await obtenerDuracionArchivo(archivoTemporal);
                            console.log(`[DEBUG] Duración real del archivo final unido: ${duracionFinalReal}s`);
                            
                            // Actualizar la duración en la base de datos
                            await actualizarDuracionNoticia(noticiaId, Math.ceil(duracionFinalReal));
                        }
                        
                        await copiarArchivoADestino(archivoTemporal, rutaDestino);
                        
                        if (fs.existsSync(archivoTemporal)) {
                            fs.unlinkSync(archivoTemporal);
                        }
                        
                        resolve(urlFinal);
                        
                    } catch (copyError) {
                        reject(copyError);
                    }
                })
                .on('error', (error) => {
                    if (fs.existsSync(listaArchivos)) {
                        fs.unlinkSync(listaArchivos);
                    }
                    reject(error);
                })
                .run();
                
        } catch (writeError) {
            reject(writeError);
        }
    });
};

const cortarYGuardarSegmento = async (archivoOriginal, noticiaId, inicio, fin) => {
    return new Promise((resolve, reject) => {
        console.log(`[DEBUG] Cortando y guardando segmento único:`);
        console.log(`  - Archivo original: ${archivoOriginal}`);
        console.log(`  - Noticia ID: ${noticiaId}`);
        console.log(`  - Inicio: ${inicio}s`);
        console.log(`  - Fin: ${fin}s`);
        console.log(`  - Duración esperada: ${fin - inicio}s`);
        
        const fecha = new Date();
        const mes = fecha.getMonth() + 1;
        const mes2 = mes.toString().padStart(2, '0');
        const year = fecha.getFullYear();
        
        const tempDir = path.join(process.cwd(), 'temp');
        const archivoTemporal = path.join(tempDir, `noticia_${noticiaId}_corte.mp4`);
        
        const rutaDestino = `\\\\192.168.1.88\\web\\Alertas\\${year}\\${mes2}\\${noticiaId}.mp4`;
        const urlFinal = `https://storage09.globalnews.com.co/Alertas/${year}/${mes2}/${noticiaId}.mp4`;
        
        console.log(`[DEBUG] Archivo temporal: ${archivoTemporal}`);
        console.log(`[DEBUG] Ruta destino: ${rutaDestino}`);
        console.log(`[DEBUG] URL final: ${urlFinal}`);
        
        let comando = ffmpeg(archivoOriginal)
            .setStartTime(inicio)
            .setDuration(fin - inicio)
            .audioCodec('aac')
            .output(archivoTemporal)
            .on('start', (commandLine) => {
                console.log(`[DEBUG] Comando FFmpeg para corte único: ${commandLine}`);
            })
            .on('progress', (progress) => {
                console.log(`[DEBUG] Progreso del corte único: ${progress.percent || 0}% - Tiempo: ${progress.timemark || 'N/A'}`);
            })
            .on('end', async () => {
                try {
                    console.log(`[DEBUG] Corte único completado, verificando archivo temporal`);
                    
                    if (fs.existsSync(archivoTemporal)) {
                        const stats = fs.statSync(archivoTemporal);
                        console.log(`[DEBUG] Archivo temporal creado - Tamaño: ${stats.size} bytes`);
                        
                        // Obtener la duración real del archivo cortado
                        const duracionReal = await obtenerDuracionArchivo(archivoTemporal);
                        console.log(`[DEBUG] Duración real del archivo cortado: ${duracionReal}s`);
                        console.log(`[DEBUG] Diferencia con duración esperada: ${Math.abs(duracionReal - (fin - inicio))}s`);
                        
                        // Actualizar la duración en la base de datos
                        await actualizarDuracionNoticia(noticiaId, Math.ceil(duracionReal));
                    }
                    
                    console.log(`[DEBUG] Copiando archivo a destino final`);
                    await copiarArchivoADestino(archivoTemporal, rutaDestino);
                    
                    if (fs.existsSync(archivoTemporal)) {
                        fs.unlinkSync(archivoTemporal);
                        console.log(`[DEBUG] Archivo temporal eliminado después de la copia`);
                    }
                    
                    console.log(`[DEBUG] Proceso de corte único completado exitosamente`);
                    resolve(urlFinal);
                    
                } catch (copyError) {
                    console.error(`[ERROR] Error al copiar archivo al destino:`, copyError.message);
                    reject(copyError);
                }
            })
            .on('error', (error) => {
                console.error(`[ERROR] Error en el corte único:`, error.message);
                console.error(`[ERROR] Parámetros:`, {
                    archivo: archivoOriginal,
                    inicio: inicio,
                    fin: fin,
                    duracion: fin - inicio
                });
                reject(error);
            })
            .run();
    });
};

const copiarArchivoADestino = async (archivoOrigen, rutaDestino) => {
  return new Promise((resolve, reject) => {
    try {
      const directorioDestino = path.dirname(rutaDestino);

      const comandoMkdir = `mkdir "${directorioDestino}" 2>nul`;

      exec(comandoMkdir, (error) => {
        const comandoCopy = `copy /Y "${archivoOrigen}" "${rutaDestino}"`;

        exec(comandoCopy, (copyError, stdout, stderr) => {
          if (copyError) {
            try {
              fs.copyFileSync(archivoOrigen, rutaDestino);
              resolve();
            } catch (fsError) {
              reject(fsError);
            }
          } else {
            resolve();
          }
        });
      });

    } catch (error) {
      reject(error);
    }
  });
};

const actualizarNoticiaConArchivoFinal = async (noticiaId, urlFinal) => {
  try {
    const pool = await getConnection();

    await pool.request()
      .input('noticiaId', sql.Int, noticiaId)
      .input('linkStreaming', sql.VarChar(500), urlFinal)
      .query(`
                UPDATE [AuditoriaRadioTelevision].[dbo].[Noticias] 
                SET [LinkStreaming] = @linkStreaming, [FlagCortado] = 'S', [FlagProcesado] = 'S'
                WHERE [NoticiaID] = @noticiaId
            `);

    await pool.request()
      .input('noticiaId', sql.Int, noticiaId)
      .input('linkFinal', sql.VarChar(500), urlFinal)
      .query(`
                UPDATE [Videoteca_dev].[dbo].[NoticiasVT] 
                SET [Estado] = 'S', [CorteUrl] = @linkFinal
                WHERE [IDNoticia] = @noticiaId
            `);

  } catch (error) {
    throw error;
  }
};

const marcarNoticiaComoError = async (noticiaId, mensajeError) => {
  try {
    const pool = await getConnection();

    await pool.request()
      .input('noticiaId', sql.Int, noticiaId)
      .input('error', sql.VarChar(500), mensajeError)
      .query(`
                UPDATE [AuditoriaRadioTelevision].[dbo].[Noticias] 
                SET [FlagCortado] = 'E', [FlagProcesado] = 'E'
                WHERE [NoticiaID] = @noticiaId
            `);

    await pool.request()
      .input('noticiaId', sql.Int, noticiaId)
      .query(`
                UPDATE [Videoteca_dev].[dbo].[NoticiasVT] 
                SET [Estado] = 'E'
                WHERE [IDNoticia] = @noticiaId
            `);

  } catch (updateError) {
    console.error('Error marcando noticia como error:', updateError);
  }
};

export const getEstadoCortes = async (req, res) => {
  try {
    const { noticiasIds } = req.query;

    if (!noticiasIds) {
      return res.status(400).json({
        error: 'Se requiere al menos un ID de noticia'
      });
    }

    const idsArray = Array.isArray(noticiasIds) ? noticiasIds : noticiasIds.split(',');
    const pool = await getConnection();

    const query = `
            SELECT 
                nv.IDNoticia,
                nv.CorteUrl,
                nv.Estado,
                nv.inicio,
                nv.fin,
                n.Titulo,
                (SELECT COUNT(*) FROM [Videoteca_dev].[dbo].[NoticiasVT] WHERE IDNoticia = n.NoticiaID) as CantidadCortes,
                CASE 
                    WHEN nv.Estado = 'S' THEN 1
                    ELSE 0
                END as Procesado
            FROM [Videoteca_dev].[dbo].[NoticiasVT] nv
            INNER JOIN [AuditoriaRadioTelevision].[dbo].[Noticias] n ON nv.IDNoticia = n.NoticiaID
            WHERE nv.IDNoticia IN (${idsArray.map(() => '?').join(',')})
            ORDER BY nv.IDNoticia, nv.inicio
        `;

    const request = pool.request();
    idsArray.forEach((id, index) => {
      request.input(`param${index}`, sql.Int, parseInt(id));
    });

    const resultado = await request.query(
      query.replace(/\?/g, (match, offset) => {
        const paramIndex = query.substring(0, offset).split('?').length - 1;
        return `@param${paramIndex}`;
      })
    );

    const noticiasPorId = {};
    resultado.recordset.forEach(row => {
      if (!noticiasPorId[row.IDNoticia]) {
        noticiasPorId[row.IDNoticia] = {
          noticiaId: row.IDNoticia,
          titulo: row.Titulo,
          cantidadCortes: row.CantidadCortes,
          cortes: []
        };
      }

      noticiasPorId[row.IDNoticia].cortes.push({
        corteUrl: row.CorteUrl,
        estado: row.Estado,
        procesado: row.Procesado === 1,
        inicio: row.inicio,
        fin: row.fin,
        duracion: row.fin - row.inicio
      });
    });

    const noticias = Object.values(noticiasPorId);

    const estadisticas = {
      totalNoticias: noticias.length,
      totalCortes: resultado.recordset.length,
      cortesProcesados: resultado.recordset.filter(r => r.Procesado === 1).length,
      cortesPendientes: resultado.recordset.filter(r => r.Estado === 'P').length,
      cortesConError: resultado.recordset.filter(r => r.Estado === 'E').length
    };

    res.json({
      success: true,
      estadisticas,
      noticias,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

export const getMediaCutsAll = async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", req.params.id)
      .input("fechaCorte", req.body.fechaCorte)
      .query(querys.getMediaCuts);

    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
}

export const getLogsCortes = async (req, res) => {
  try {
    const { noticiasIds, limite = 100 } = req.query;

    if (!noticiasIds) {
      return res.status(400).json({
        error: 'Se requiere al menos un ID de noticia'
      });
    }

    const idsArray = Array.isArray(noticiasIds) ? noticiasIds : noticiasIds.split(',');
    const pool = await getConnection();

    const query = `
            SELECT TOP (@limite)
                IdNoticia,
                TipoAccion,
                DetallesAccion,
                TiempoInicioSolicitado,
                TiempoFinSolicitado,
                TiempoInicioFinal,
                TiempoFinFinal,
                UrlMediaOriginal,
                FechaLog
            FROM [Videoteca_dev].[dbo].[gnSyncLogs]
            WHERE IdNoticia IN (${idsArray.map(() => '?').join(',')})
            ORDER BY FechaLog DESC
        `;

    const request = pool.request();
    request.input('limite', sql.Int, parseInt(limite));

    idsArray.forEach((id, index) => {
      request.input(`param${index}`, sql.Int, parseInt(id));
    });

    const resultado = await request.query(
      query.replace(/\?/g, (match, offset) => {
        const paramIndex = query.substring(0, offset).split('?').length - 1;
        return `@param${paramIndex}`;
      })
    );

    res.json({
      success: true,
      logs: resultado.recordset,
      total: resultado.recordset.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

export const actualizarEstadoCorte = async (req, res) => {
  try {
    const { noticiaId, corteNumero, estado, archivoGenerado } = req.body;

    if (!noticiaId || !corteNumero || !estado) {
      return res.status(400).json({
        error: 'Se requieren noticiaId, corteNumero y estado'
      });
    }

    const pool = await getConnection();

    const query = `
            UPDATE [Videoteca_dev].[dbo].[NoticiasVT] 
            SET Estado = @estado, 
                ArchivoGenerado = @archivoGenerado,
                FechaCreacion = GETDATE()
            WHERE IDNoticia = @noticiaId AND CorteNumero = @corteNumero
        `;

    await pool.request()
      .input('estado', sql.Char(1), estado)
      .input('archivoGenerado', sql.VarChar(500), archivoGenerado)
      .input('noticiaId', sql.Int, noticiaId)
      .input('corteNumero', sql.Int, corteNumero)
      .query(query);

    const verificarCompleto = `
            SELECT COUNT(*) as Total,
                   SUM(CASE WHEN Estado = 'S' THEN 1 ELSE 0 END) as Procesados
            FROM [Videoteca_dev].[dbo].[NoticiasVT]
            WHERE IDNoticia = @noticiaId
        `;

    const verificacion = await pool.request()
      .input('noticiaId', sql.Int, noticiaId)
      .query(verificarCompleto);

    const { Total, Procesados } = verificacion.recordset[0];

    if (Total === Procesados) {
      await pool.request()
        .input('noticiaId', sql.Int, noticiaId)
        .query(`
                    UPDATE [AuditoriaRadioTelevision].[dbo].[Noticias] 
                    SET FlagCortado = 'S'
                    WHERE NoticiaID = @noticiaId
                `);
    }

    res.json({
      success: true,
      message: 'Estado del corte actualizado correctamente',
      todosCompletos: Total === Procesados
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};