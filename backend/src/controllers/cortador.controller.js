// Fixed imports at the top of notas.controller.js
import { getConnection, querys, sql } from "../database/index.js"
import ffmpeg from 'fluent-ffmpeg';
import multer from 'multer';  // This should be here
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

    console.log('🔍 Configurando FFmpeg...');
    console.log('FFMPEG_PATH env variable:', ffmpegPath);

    // Verificar si se proporcionó una ruta específica
    if (ffmpegPath && ffmpegPath.trim() !== '' && ffmpegPath !== 'undefined') {
        console.log(`📁 Verificando ruta especificada: ${ffmpegPath}`);

        if (fs.existsSync(ffmpegPath)) {
            ffmpeg.setFfmpegPath(ffmpegPath);
            console.log(`✅ FFmpeg configurado desde FFMPEG_PATH: ${ffmpegPath}`);
            return true;
        } else {
            console.error(`❌ FFmpeg no encontrado en: ${ffmpegPath}`);
        }
    }

    // Fallback: Probar rutas comunes en Windows
    const isWindows = process.platform === 'win32';

    if (isWindows) {
        const commonPaths = [
            'C:\\ffmpeg\\bin\\ffmpeg.exe',
            'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
            'C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe',
            path.join(process.cwd(), 'ffmpeg', 'bin', 'ffmpeg.exe'),
            path.join(process.cwd(), 'bin', 'ffmpeg.exe')
        ];

        console.log('🔍 Buscando FFmpeg en rutas comunes...');

        for (const testPath of commonPaths) {
            console.log(`   Probando: ${testPath}`);
            if (fs.existsSync(testPath)) {
                ffmpeg.setFfmpegPath(testPath);
                console.log(`✅ FFmpeg encontrado en: ${testPath}`);
                return true;
            }
        }
    }

    // Último recurso: Usar PATH del sistema
    console.log('🔍 Intentando usar FFmpeg desde PATH del sistema...');
    try {
        ffmpeg.setFfmpegPath('ffmpeg');
        console.log('✅ Usando FFmpeg desde PATH del sistema');
        return true;
    } catch (error) {
        console.error('❌ FFmpeg no encontrado en PATH del sistema');
    }

    return false;
};

// Configurar FFmpeg al cargar el módulo
let ffmpegConfigured = false;
try {
    ffmpegConfigured = configureFFmpeg();

    if (ffmpegConfigured) {
        // Verificar que FFmpeg funciona correctamente
        ffmpeg.getAvailableFormats((err, formats) => {
            if (err) {
                console.error('❌ Test de FFmpeg falló:', err.message);
                ffmpegConfigured = false;
            } else {
                console.log('✅ FFmpeg está funcionando correctamente');
            }
        });
    }

} catch (error) {
    console.error('❌ Error configurando FFmpeg:', error.message);
    ffmpegConfigured = false;
}

// Función helper para verificar si FFmpeg está disponible
export const isFFmpegAvailable = () => {
    return ffmpegConfigured;
};

// Rest of your existing code starts here...
const captureStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'uploads', 'form-captures');

        // Crear directorio si no existe
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

// FUNCIÓN PRINCIPAL CORREGIDA
export const InserNoticiaTresCortes = async (req, res) => {
  let transaction;
  tempFiles = []; // Para limpiar archivos temporales

  try {
    console.log('InserNoticiaTresCortes - Datos recibidos:', JSON.stringify(req.body, null, 2));

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
      fechaAlta, // Este puede ser null
      tiempoInicio,
      tiempoFin,
      esCorteFusionado,
      cortesInvolucrados,
      temas = [],
      coberturas = []
    } = req.body;

    // CORRECCIÓN: Asegurar que fechaAlta tenga un valor válido
    const fechaAltaValida = fechaAlta || new Date().toISOString();
    
    // Validaciones básicas
    if (!titulo || !aclaracion || !tiempoInicio || !tiempoFin || !userid) {
      return res.status(400).json({
        error: 'Faltan datos obligatorios',
        camposFaltantes: {
          titulo: !titulo,
          aclaracion: !aclaracion,
          tiempoInicio: !tiempoInicio,
          tiempoFin: !tiempoFin,
          userid: !userid
        }
      });
    }

    const pool = await getConnection();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    console.log('Transacción iniciada correctamente');

    // 1. Calcular duración total y preparar datos - CORREGIDO
    let duracionTotal = 0;
    let cantidadCortes = 1;

    if (esCorteFusionado && cortesInvolucrados && cortesInvolucrados.length > 1) {
      cantidadCortes = cortesInvolucrados.length;

      // Calcular duración total sumando cada segmento - CORREGIDO
      cortesInvolucrados.forEach(corte => {
        if (corte.esCorteCompleto) {
          duracionTotal += 300; // 5 minutos por defecto
        } else {
          const inicio = corte.tiempoInicio || 0;
          // CORRECCIÓN: Si tiempoFin es null, usar la duración completa del archivo
          let fin = corte.tiempoFin;
          
          // Si tiempoFin es null, necesitamos determinar la duración real del archivo
          // Por ahora, usaremos una duración estándar de 5 minutos (300 segundos)
          if (fin === null || fin === undefined) {
            // Para cortes que van hasta el final, asumimos el archivo completo
            fin = inicio + 300; // Agregar 5 minutos desde el inicio
            console.log(`Corte ${corte.corteNumero}: tiempoFin era null, usando ${fin} (inicio + 300 segundos)`);
          }
          
          // Validar que fin sea mayor que inicio
          if (fin > inicio) {
            const duracionSegmento = fin - inicio;
            duracionTotal += duracionSegmento;
            console.log(`Corte ${corte.corteNumero}: inicio=${inicio}, fin=${fin}, duración=${duracionSegmento}`);
          } else {
            console.warn(`Advertencia: Corte ${corte.corteNumero} tiene tiempos inválidos (inicio: ${inicio}, fin: ${fin})`);
            // Asumir al menos 30 segundos si los tiempos están mal
            duracionTotal += 30;
          }
        }
      });
    } else {
      duracionTotal = tiempoFin.tiempo - tiempoInicio.tiempo;
      cantidadCortes = 1;
    }

    // Validar que la duración total sea positiva
    if (duracionTotal <= 0) {
      console.warn(`Duración total calculada inválida: ${duracionTotal}. Usando duración mínima de 60 segundos.`);
      duracionTotal = 60; // Duración mínima de 1 minuto
    }

    console.log(`Procesando noticia con ${cantidadCortes} cortes, duración total: ${duracionTotal} segundos`);

    // 2. Insertar la noticia principal
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
      .input('programaid', sql.Int, programaid || null)
      .input('conductores', sql.VarChar(255), conductores || '')
      .input('tiponoticiaid', sql.Int, tiponoticiaid || 1)
      .input('tipotonoid', sql.Int, tipotonoid || 5)
      .input('titulo', sql.VarChar(255), titulo)
      .input('fechaInicio', sql.DateTime, tiempoInicio.fecha)
      .input('fechaFin', sql.DateTime, tiempoFin.fecha)
      .input('duracion', sql.Int, duracionTotal)
      .input('fechaTransmitido', sql.DateTime, tiempoInicio.corte.FechaCorte)
      .input('userid', sql.UniqueIdentifier, userid)
      .input('flagCortado', sql.Char(1), 'P') // P = Pendiente mientras se procesa
      .query(insertNoticia);

    const noticiaId = resultNoticia.recordset[0].noticiaId;
    console.log(`Noticia creada con ID: ${noticiaId}`);

    // 3. Insertar registros de cortes en NoticiasVT con estado Pendiente
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
          .input('estado', sql.Char(1), 'P') // P = Pendiente
          .query(insertCorte);

        console.log(`Corte ${corte.corteNumero} insertado para noticia ${noticiaId}`);
      }
    }

    // 4. Insertar temas y coberturas - CORREGIDO con fechaAlta válida
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
          .input('fechaAlta', sql.DateTime, fechaAltaValida) // CORRECCIÓN: Usar fecha válida
          .input('userId', sql.UniqueIdentifier, userid)
          .query(insertTema);
      }
      console.log(`${temas.length} temas insertados para noticia ${noticiaId}`);
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
          .input('fechaAlta', sql.DateTime, fechaAltaValida) // CORRECCIÓN: Usar fecha válida
          .query(insertCobertura);
      }
      console.log(`${coberturas.length} coberturas insertadas para noticia ${noticiaId}`);
    }

    // 5. Confirmar transacción antes del procesamiento de audio
    await transaction.commit();
    console.log('Transacción confirmada - iniciando procesamiento de audio');

    // 6. PROCESAR LOS ARCHIVOS DE AUDIO (CORREGIDO)
    let urlFinal = '';

    if (esCorteFusionado && cortesInvolucrados && cortesInvolucrados.length > 1) {
      try {
        urlFinal = await procesarMultiplesCortes(cortesInvolucrados, noticiaId);

        // Actualizar la noticia con el archivo final
        await actualizarNoticiaConArchivoFinal(noticiaId, urlFinal);

        console.log(`Procesamiento completado. URL final: ${urlFinal}`);

      } catch (processingError) {
        console.error('Error en procesamiento de audio:', processingError);

        // Marcar como error pero no fallar completamente
        await marcarNoticiaComoError(noticiaId, processingError.message);

        // Usar el primer corte como fallback
        urlFinal = cortesInvolucrados[0].linkStreaming;
      }
    } else {
      // Para un solo corte, usar el método tradicional
      try {
        urlFinal = await procesarCorteUnico(tiempoInicio, tiempoFin, noticiaId);
        await actualizarNoticiaConArchivoFinal(noticiaId, urlFinal);
      } catch (processingError) {
        console.error('Error en procesamiento de corte único:', processingError);
        urlFinal = tiempoInicio.corte.LinkStreamming;
        await marcarNoticiaComoError(noticiaId, processingError.message);
      }
    }

    // 7. Limpiar archivos temporales
    tempFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (cleanupError) {
        console.warn('Error limpiando archivo temporal:', cleanupError);
      }
    });

    // 8. Respuesta final
    const respuesta = {
      success: true,
      noticiaId: noticiaId,
      cantidadCortes: cantidadCortes,
      duracionTotal: duracionTotal,
      esCorteFusionado: esCorteFusionado,
      urlFinal: urlFinal,
      mensaje: `Noticia creada y procesada exitosamente con ${cantidadCortes} corte(s)`,
      detalles: {
        titulo: titulo,
        fechaInicio: tiempoInicio.fecha,
        fechaFin: tiempoFin.fecha,
        cortesCreados: cantidadCortes,
        temasAsociados: temas.length,
        coberturasAsociadas: coberturas.length,
        archivoProcesado: urlFinal !== cortesInvolucrados[0]?.linkStreaming
      }
    };

    console.log('InserNoticiaTresCortes - Respuesta exitosa:', respuesta);
    res.status(201).json(respuesta);

  } catch (error) {
    // Rollback en caso de error
    if (transaction) {
      try {
        await transaction.rollback();
        console.log('Transacción revertida debido a error');
      } catch (rollbackError) {
        console.error('Error al revertir transacción:', rollbackError);
      }
    }

    // Limpiar archivos temporales en caso de error
    tempFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (cleanupError) {
        console.warn('Error limpiando archivo temporal:', cleanupError);
      }
    });

    console.error('Error en InserNoticiaTresCortes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// FUNCIÓN AUXILIAR CORREGIDA: procesarMultiplesCortes
const procesarMultiplesCortes = async (cortesInvolucrados, noticiaId) => {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const segmentosArchivos = [];
    
    try {
        console.log(`🎬 Iniciando procesamiento de ${cortesInvolucrados.length} cortes`);
        
        // 1. Descargar y cortar cada segmento
        for (let i = 0; i < cortesInvolucrados.length; i++) {
            const corte = cortesInvolucrados[i];
            const nombreSegmento = `segmento_${i}_${noticiaId}.aac`;
            const rutaSegmento = path.join(tempDir, nombreSegmento);
            
            console.log(`📥 Procesando segmento ${i + 1}/${cortesInvolucrados.length}: ${corte.nombreCorte}`);
            
            // Descargar el archivo original
            const archivoOriginal = await descargarArchivo(corte.linkStreaming, tempDir);
            
            // CORRECCIÓN: Manejar tiempoFin null
            let tiempoFin = corte.tiempoFin;
            if (tiempoFin === null || tiempoFin === undefined) {
                console.log(`Corte ${i + 1}: tiempoFin es null, cortando hasta el final del archivo`);
                tiempoFin = null; // FFmpeg cortará hasta el final
            }
            
            // Cortar el segmento específico
            await cortarSegmento(
                archivoOriginal, 
                rutaSegmento, 
                corte.tiempoInicio || 0, 
                tiempoFin
            );
            
            segmentosArchivos.push(rutaSegmento);
            tempFiles.push(archivoOriginal, rutaSegmento);
            
            console.log(`✅ Segmento ${i + 1} procesado correctamente`);
        }
        
        // 2. Unir todos los segmentos y guardar con la estructura correcta
        console.log('🔗 Uniendo segmentos...');
        const urlFinal = await unirYGuardarSegmentos(segmentosArchivos, noticiaId);
        
        console.log(`✅ Procesamiento completado exitosamente. URL: ${urlFinal}`);
        return urlFinal;
        
    } catch (error) {
        console.error('❌ Error en procesarMultiplesCortes:', error);
        throw error;
    }
};

// FUNCIÓN AUXILIAR CORREGIDA: cortarSegmento
const cortarSegmento = (archivoEntrada, archivoSalida, inicio, fin) => {
    return new Promise((resolve, reject) => {
        console.log(`🔧 Cortando segmento: ${archivoEntrada} -> ${archivoSalida}`);
        console.log(`⏱️  Tiempo inicio: ${inicio}, Tiempo fin: ${fin}`);
        
        let comando = ffmpeg(archivoEntrada)
            .seekInput(inicio);
            
        // CORRECCIÓN: Solo agregar duration si fin tiene un valor válido
        if (fin !== null && fin !== undefined && fin > inicio) {
            const duracion = fin - inicio;
            comando = comando.duration(duracion);
            console.log(`⏱️  Duración del corte: ${duracion} segundos`);
        } else {
            console.log(`⏱️  Cortando desde ${inicio} hasta el final del archivo`);
            // No agregar duration para procesar hasta el final
        }
        
        comando
            .audioCodec('aac')
            .output(archivoSalida)
            .on('start', (commandLine) => {
                console.log(`🚀 FFmpeg iniciado: ${commandLine}`);
            })
            .on('progress', (progress) => {
                if (progress.percent) {
                    console.log(`📈 Progreso: ${Math.round(progress.percent)}%`);
                }
            })
            .on('end', () => {
                console.log(`✅ Segmento cortado exitosamente: ${archivoSalida}`);
                resolve();
            })
            .on('error', (error) => {
                console.error('❌ Error al cortar segmento:', error);
                reject(error);
            })
            .run();
    });
};

// FUNCIÓN AUXILIAR CORREGIDA: procesarCorteUnico
const procesarCorteUnico = async (tiempoInicio, tiempoFin, noticiaId) => {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    try {
        console.log(`🎬 Procesando corte único para noticia ${noticiaId}`);
        
        // Descargar archivo original
        const archivoOriginal = await descargarArchivo(tiempoInicio.corte.LinkStreamming, tempDir);
        
        // Procesar y guardar con la estructura correcta
        const urlFinal = await cortarYGuardarSegmento(
            archivoOriginal, 
            noticiaId, 
            tiempoInicio.tiempo, 
            tiempoFin.tiempo
        );
        
        tempFiles.push(archivoOriginal);
        
        console.log(`✅ Corte único procesado exitosamente. URL: ${urlFinal}`);
        return urlFinal;
        
    } catch (error) {
        console.error('❌ Error en procesarCorteUnico:', error);
        throw error;
    }
};

// FUNCIÓN AUXILIAR: descargarArchivo (sin cambios)
const descargarArchivo = async (url, directorio) => {
    const nombreArchivo = path.basename(url);
    const rutaCompleta = path.join(directorio, nombreArchivo);
    
    console.log(`📥 Descargando archivo: ${url} -> ${rutaCompleta}`);
    
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 60000 // 60 segundos de timeout
    });
    
    const writer = fs.createWriteStream(rutaCompleta);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            console.log(`✅ Archivo descargado: ${rutaCompleta}`);
            resolve(rutaCompleta);
        });
        writer.on('error', (error) => {
            console.error(`❌ Error descargando archivo: ${error}`);
            reject(error);
        });
    });
};

// FUNCIÓN AUXILIAR CORREGIDA: unirYGuardarSegmentos
const unirYGuardarSegmentos = async (archivosSegmentos, noticiaId) => {
    return new Promise((resolve, reject) => {
        // Obtener fecha actual para la estructura de carpetas
        const fecha = new Date();
        const mes = fecha.getMonth() + 1;
        const mes2 = mes.toString().padStart(2, '0');
        const year = fecha.getFullYear();
        
        // Crear archivo temporal local
        const tempDir = path.join(process.cwd(), 'temp');
        const archivoTemporal = path.join(tempDir, `noticia_${noticiaId}_final.mp4`);
        
        // Ruta de destino final
        const rutaDestino = `\\\\192.168.1.88\\web\\Alertas\\${year}\\${mes2}\\${noticiaId}.mp4`;
        const urlFinal = `https://storage09.globalnews.com.co/Alertas/${year}/${mes2}/${noticiaId}.mp4`;
        
        console.log(`💾 Uniendo segmentos temporalmente en: ${archivoTemporal}`);
        
        // Crear archivo de lista para concat
        const listaArchivos = path.join(tempDir, `lista_${noticiaId}.txt`);
        const contenidoLista = archivosSegmentos.map(archivo => `file '${archivo.replace(/\\/g, '/')}'`).join('\n');
        
        try {
            fs.writeFileSync(listaArchivos, contenidoLista);
            console.log(`📝 Lista de archivos creada: ${listaArchivos}`);
            console.log(`📝 Contenido de la lista:\n${contenidoLista}`);
            
            // Usar concat demuxer para unir archivos
            ffmpeg()
                .input(listaArchivos)
                .inputOptions(['-f', 'concat', '-safe', '0'])
                .audioCodec('aac')
                .output(archivoTemporal)
                .on('start', (commandLine) => {
                    console.log(`🚀 FFmpeg concat iniciado: ${commandLine}`);
                })
                .on('progress', (progress) => {
                    if (progress.percent) {
                        console.log(`📈 Progreso unión: ${Math.round(progress.percent)}%`);
                    }
                })
                .on('end', async () => {
                    console.log(`✅ Segmentos unidos temporalmente: ${archivoTemporal}`);
                    
                    try {
                        // Limpiar archivo de lista
                        if (fs.existsSync(listaArchivos)) {
                            fs.unlinkSync(listaArchivos);
                        }
                        
                        // Copiar el archivo temporal al destino final
                        await copiarArchivoADestino(archivoTemporal, rutaDestino);
                        
                        // Limpiar archivo temporal
                        if (fs.existsSync(archivoTemporal)) {
                            fs.unlinkSync(archivoTemporal);
                        }
                        
                        console.log(`✅ Archivo copiado exitosamente a: ${rutaDestino}`);
                        resolve(urlFinal);
                        
                    } catch (copyError) {
                        console.error('❌ Error copiando archivo al destino:', copyError);
                        reject(copyError);
                    }
                })
                .on('error', (error) => {
                    console.error('❌ Error al unir segmentos:', error);
                    // Limpiar archivo de lista en caso de error
                    if (fs.existsSync(listaArchivos)) {
                        fs.unlinkSync(listaArchivos);
                    }
                    reject(error);
                })
                .run();
                
        } catch (writeError) {
            console.error('❌ Error creando archivo de lista:', writeError);
            reject(writeError);
        }
    });
};

// FUNCIÓN AUXILIAR CORREGIDA: cortarYGuardarSegmento
const cortarYGuardarSegmento = async (archivoOriginal, noticiaId, inicio, fin) => {
    return new Promise((resolve, reject) => {
        // Obtener fecha actual para la estructura de carpetas
        const fecha = new Date();
        const mes = fecha.getMonth() + 1;
        const mes2 = mes.toString().padStart(2, '0');
        const year = fecha.getFullYear();
        
        // Crear archivo temporal local
        const tempDir = path.join(process.cwd(), 'temp');
        const archivoTemporal = path.join(tempDir, `noticia_${noticiaId}_corte.mp4`);
        
        // Ruta de destino final
        const rutaDestino = `\\\\192.168.1.88\\web\\Alertas\\${year}\\${mes2}\\${noticiaId}.mp4`;
        const urlFinal = `https://storage09.globalnews.com.co/Alertas/${year}/${mes2}/${noticiaId}.mp4`;
        
        console.log(`💾 Cortando segmento temporalmente en: ${archivoTemporal}`);
        console.log(`⏱️  Inicio: ${inicio}, Fin: ${fin}, Duración: ${fin - inicio} segundos`);
        
        let comando = ffmpeg(archivoOriginal)
            .setStartTime(inicio)
            .setDuration(fin - inicio)
            .audioCodec('aac')
            .output(archivoTemporal)
            .on('start', (commandLine) => {
                console.log(`🚀 FFmpeg corte único iniciado: ${commandLine}`);
            })
            .on('progress', (progress) => {
                if (progress.percent) {
                    console.log(`📈 Progreso corte: ${Math.round(progress.percent)}%`);
                }
            })
            .on('end', async () => {
                console.log(`✅ Corte único completado temporalmente: ${archivoTemporal}`);
                
                try {
                    // Copiar el archivo temporal al destino final
                    await copiarArchivoADestino(archivoTemporal, rutaDestino);
                    
                    // Limpiar archivo temporal
                    if (fs.existsSync(archivoTemporal)) {
                        fs.unlinkSync(archivoTemporal);
                    }
                    
                    console.log(`✅ Archivo copiado exitosamente a: ${rutaDestino}`);
                    resolve(urlFinal);
                    
                } catch (copyError) {
                    console.error('❌ Error copiando archivo al destino:', copyError);
                    reject(copyError);
                }
            })
            .on('error', (error) => {
                console.error('❌ Error al cortar segmento:', error);
                reject(error);
            })
            .run();
    });
};

// FUNCIÓN AUXILIAR: copiarArchivoADestino (sin cambios significativos)
const copiarArchivoADestino = async (archivoOrigen, rutaDestino) => {
    return new Promise((resolve, reject) => {
        try {
            // Crear directorios de destino si no existen
            const directorioDestino = path.dirname(rutaDestino);
            
            console.log(`📁 Creando directorio si no existe: ${directorioDestino}`);
            
            // Intentar crear directorios usando comando de Windows
            const comandoMkdir = `mkdir "${directorioDestino}" 2>nul`;
            
            exec(comandoMkdir, (error) => {
                // Ignorar errores de mkdir (puede ser que ya exista)
                console.log(`📁 Directorio listo: ${directorioDestino}`);
                
                // Copiar archivo usando comando copy de Windows
                const comandoCopy = `copy /Y "${archivoOrigen}" "${rutaDestino}"`;
                
                console.log(`📋 Ejecutando: ${comandoCopy}`);
                
                exec(comandoCopy, (copyError, stdout, stderr) => {
                    if (copyError) {
                        console.error('❌ Error copiando con comando copy:', copyError);
                        console.error('stderr:', stderr);
                        
                        // Fallback: Intentar con fs.copyFileSync
                        try {
                            console.log('🔄 Intentando con fs.copyFileSync...');
                            fs.copyFileSync(archivoOrigen, rutaDestino);
                            console.log('✅ Archivo copiado con fs.copyFileSync');
                            resolve();
                        } catch (fsError) {
                            console.error('❌ Error con fs.copyFileSync:', fsError);
                            reject(fsError);
                        }
                    } else {
                        console.log('✅ Archivo copiado exitosamente con comando copy');
                        if (stdout) console.log('stdout:', stdout);
                        resolve();
                    }
                });
            });
            
        } catch (error) {
            console.error('❌ Error en copiarArchivoADestino:', error);
            reject(error);
        }
    });
};

// FUNCIÓN AUXILIAR: actualizarNoticiaConArchivoFinal (sin cambios)
const actualizarNoticiaConArchivoFinal = async (noticiaId, urlFinal) => {
    try {
        const pool = await getConnection();
        
        // Actualizar la noticia principal
        await pool.request()
            .input('noticiaId', sql.Int, noticiaId)
            .input('linkStreaming', sql.VarChar(500), urlFinal)
            .query(`
                UPDATE [AuditoriaRadioTelevision].[dbo].[Noticias] 
                SET [LinkStreaming] = @linkStreaming, [FlagCortado] = 'S', [FlagProcesado] = 'S'
                WHERE [NoticiaID] = @noticiaId
            `);
        
        // Actualizar los registros de NoticiasVT
        await pool.request()
            .input('noticiaId', sql.Int, noticiaId)
            .input('linkFinal', sql.VarChar(500), urlFinal)
            .query(`
                UPDATE [Videoteca_dev].[dbo].[NoticiasVT] 
                SET [Estado] = 'S', [CorteUrl] = @linkFinal
                WHERE [IDNoticia] = @noticiaId
            `);
        
        console.log(`✅ Noticia ${noticiaId} actualizada con archivo final: ${urlFinal}`);
        
    } catch (error) {
        console.error('❌ Error actualizando noticia:', error);
        throw error;
    }
};

// FUNCIÓN AUXILIAR: marcarNoticiaComoError (sin cambios)
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
        
        console.log(`⚠️ Noticia ${noticiaId} marcada como error: ${mensajeError}`);
        
    } catch (updateError) {
        console.error('❌ Error marcando noticia como error:', updateError);
    }
};

// RESTO DE FUNCIONES SIN CAMBIOS

/**
 * Obtener estado de cortes de una o varias noticias
 */
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

    // Agrupar resultados por noticia
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

    // Calcular estadísticas globales
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
    console.error('Error en getEstadoCortes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

export const getMediaCutsAll = async (req, res) => {
  try {
    //desabilitar cors    
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
    console.error('Error en getLogsCortes:', error);
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

    // Si todos los cortes están procesados, actualizar la noticia principal
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
      // Todos los cortes están procesados, actualizar noticia principal
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
    console.error('Error en actualizarEstadoCorte:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};