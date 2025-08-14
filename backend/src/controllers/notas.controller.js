import { getConnection, querys, sql } from "../database/index.js"
//ruta completa
import ffmpeg from 'fluent-ffmpeg';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from "dotenv"
import moment from 'moment';

config();

const API_OPENAI = process.env.API_OPENAI;
const URL_OPENAI = process.env.URL_OPENAI;

const ffmpegPath = process.env.FFMPEG_PATH
if (ffmpegPath !== '' || ffmpegPath !== null) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

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

const uploadCapture = multer({
  storage: captureStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Middleware de multer para usar en la ruta
export const uploadCaptureMiddleware = uploadCapture.single('image');

// Función helper mejorada para convertir valores safely
const safeParseInt = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // Si es string, intentar convertir
  if (typeof value === 'string') {
    // Limpiar string de caracteres no numéricos al inicio/final
    const cleaned = value.trim();
    const parsed = parseInt(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  // Si ya es número
  if (typeof value === 'number') {
    return isNaN(value) ? null : Math.floor(value);
  }

  return null;
};


// Función helper para manejar strings safely
const safeString = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  return String(value);
};

export const getImproveAclaracion = async (req, res) => {
  try {
    console.log('getImproveAclaracion - Datos recibidos:', req.body);
    
    const { text } = req.body;
    
    // Validar que se reciba el texto
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'El campo "text" es requerido y debe ser una cadena de texto'
      });
    }
    
    // Función para limpiar las marcas de tiempo
    const cleanTimestamps = (inputText) => {
      // Patrón para detectar marcas de tiempo HH:MM:SS a HH:MM:SS
      const timestampPattern = /\d{2}:\d{2}:\d{2}\s+a\s+\d{2}:\d{2}:\d{2}\s+/g;
      
      // Quitar las marcas de tiempo y limpiar texto
      return inputText
        .replace(timestampPattern, '')
        .replace(/\n+/g, ' ')      // Saltos de línea por espacios
        .replace(/\s+/g, ' ')      // Múltiples espacios a uno
        .trim();
    };
    
    // Limpiar el texto antes de enviarlo a OpenAI
    const cleanedText = cleanTimestamps(text);
    console.log('Texto limpio enviado a OpenAI:', cleanedText);
    
    // Prompt optimizado para menor consumo de tokens
    const prompt = `Corrige y mejora este texto, luego genera título y resumen. Responde solo JSON:
    
Texto: "${cleanedText}"

Formato respuesta:
{
  "titulo": "título conciso aquí",
  "aclaracion": "resumen máximo 400 caracteres aquí"
}`;

    console.log('Prompt enviado:', prompt);

    // Verificar que las variables de entorno estén configuradas
    if (!API_OPENAI || !URL_OPENAI) {
      throw new Error('Variables de entorno API_OPENAI y URL_OPENAI son requeridas');
    }

    // Construir URL correcta para OpenAI
    const openaiUrl = `${URL_OPENAI}/chat/completions`;
    console.log('URL OpenAI:', openaiUrl);

    // Llamada a OpenAI
    const openaiResponse = await fetch(openaiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_OPENAI}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Eres un editor experto. Corriges textos y generas títulos concisos con resúmenes de máximo 400 caracteres. Responde solo en JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
        top_p: 0.9
      })
    });

    console.log('Status de respuesta OpenAI:', openaiResponse.status);
    console.log('Headers de respuesta:', openaiResponse.headers);

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('Error de OpenAI:', errorData);
      throw new Error(`Error de OpenAI: ${errorData.error?.message || 'Error desconocido'}`);
    }

    const openaiData = await openaiResponse.json();
    console.log('Respuesta completa de OpenAI:', JSON.stringify(openaiData, null, 2));
    
    // Extraer y parsear la respuesta
    const aiResponse = openaiData.choices[0].message.content.trim();
    console.log('Contenido de respuesta IA:', aiResponse);
    
    let parsedResponse;
    try {
      // Intentar parsear como JSON
      parsedResponse = JSON.parse(aiResponse);
      console.log('Respuesta parseada:', parsedResponse);
    } catch (parseError) {
      console.error('Error parseando respuesta de IA:', parseError);
      console.log('Respuesta raw que falló:', aiResponse);
      
      // Fallback: extraer título y aclaración manualmente
      parsedResponse = {
        titulo: 'Texto procesado',
        aclaracion: aiResponse.length > 400 ? aiResponse.substring(0, 397) + '...' : aiResponse
      };
    }

    // Validar que la respuesta tenga la estructura esperada
    if (!parsedResponse || typeof parsedResponse !== 'object') {
      throw new Error('La respuesta de IA no es un objeto válido');
    }

    if (!parsedResponse.titulo || !parsedResponse.aclaracion) {
      console.log('Respuesta incompleta, usando valores por defecto');
      parsedResponse = {
        titulo: parsedResponse.titulo || 'Análisis de conversación deportiva',
        aclaracion: parsedResponse.aclaracion || cleanedText.length > 400 ? cleanedText.substring(0, 397) + '...' : cleanedText
      };
    }

    // Validar y truncar aclaración si excede 400 caracteres
    if (parsedResponse.aclaracion.length > 400) {
      console.log(`Aclaración truncada de ${parsedResponse.aclaracion.length} a 400 caracteres`);
      parsedResponse.aclaracion = parsedResponse.aclaracion.substring(0, 397) + '...';
    }

    console.log('Resultado final:', parsedResponse);

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      message: 'Texto procesado exitosamente con IA',
      data: {
        originalLength: text.length,
        cleanedLength: cleanedText.length,
        timestampsRemoved: (text.match(/\d{2}:\d{2}:\d{2}\s+a\s+\d{2}:\d{2}:\d{2}\s+/g) || []).length,
        titulo: parsedResponse.titulo,
        aclaracion: parsedResponse.aclaracion,
        aclaracionLength: parsedResponse.aclaracion.length,
        tokensUsed: openaiData.usage?.total_tokens || 'No disponible'
      }
    });
    
  } catch (error) {
    console.error('Error en getImproveAclaracion:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Función auxiliar para limpiar timestamps
export const cleanTextTimestamps = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const timestampPattern = /\d{2}:\d{2}:\d{2}\s+a\s+\d{2}:\d{2}:\d{2}\s+/g;
  
  return text
    .replace(timestampPattern, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Función auxiliar para testing del prompt (opcional)
export const testPromptOptimization = async (text) => {
  const cleanedText = cleanTextTimestamps(text);
  
  // Versión corta del prompt para testing
  const shortPrompt = `Corrige y mejora: "${cleanedText}"
  
JSON: {"titulo":"...","aclaracion":"..."}`;

  console.log('Texto original:', text.length, 'caracteres');
  console.log('Texto limpio:', cleanedText.length, 'caracteres');
  console.log('Prompt final:', shortPrompt.length, 'caracteres');
  
  return {
    originalLength: text.length,
    cleanedLength: cleanedText.length,
    promptLength: shortPrompt.length,
    estimatedTokens: Math.ceil(shortPrompt.length / 4) // Aproximación: 1 token ≈ 4 caracteres
  };
};


export const takeCapture = async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*");

    const { notaId, nombreCorte } = req.body;

    console.log('Datos recibidos en takeCapture:', { notaId, nombreCorte, type: typeof notaId });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se recibió ninguna imagen'
      });
    }

    // Validar que notaId existe (sin convertir a int)
    if (!notaId || notaId.toString().trim() === '') {
      return res.status(400).json({
        success: false,
        message: `ID de nota inválido. Recibido: "${notaId}"`
      });
    }

    // Convertir a string para asegurar consistencia
    const safeNotaId = notaId.toString().trim();

    const imageData = {
      notaId: safeNotaId,
      nombreCorte: nombreCorte || 'captura_default',
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      uploadDate: new Date()
    };

    console.log('Datos de imagen a guardar:', imageData);

    // Insertar en la tabla gnSyncLogs
    const pool = await getConnection();

    console.log('Insertando con IdNoticia como VARCHAR:', safeNotaId);

    await pool.request()
      .input("idNoticia", sql.VarChar, safeNotaId) // SIEMPRE como VARCHAR
      .input("tipoAccion", sql.VarChar, 'Captura de Imagen del Formulario')
      .input("detallesAccion", sql.VarChar, `Imagen del formulario capturada para la nota ID ${safeNotaId}. Archivo: ${imageData.filename}. Tamaño: ${imageData.size} bytes. Nombre corte: ${imageData.nombreCorte}.`)
      .input("tiempoInicioSolicitado", sql.Int, null)
      .input("tiempoFinSolicitado", sql.Int, null)
      .input("tiempoInicioFinal", sql.Int, null)
      .input("tiempoFinFinal", sql.Int, null)
      .input("urlMediaOriginal", sql.VarChar, null)
      .input("rutaImagen", sql.VarChar, imageData.path)
      .query(`
        INSERT INTO [Videoteca_dev].[dbo].[gnSyncLogs] 
        ([IdNoticia], [TipoAccion], [DetallesAccion], [FechaLog], [TiempoInicioSolicitado], [TiempoFinSolicitado], [TiempoInicioFinal], [TiempoFinFinal], [UrlMediaOriginal], [RutaImagen])
        VALUES (@idNoticia, @tipoAccion, @detallesAccion, GETDATE(), @tiempoInicioSolicitado, @tiempoFinSolicitado, @tiempoInicioFinal, @tiempoFinFinal, @urlMediaOriginal, @rutaImagen)
      `);

    console.log('Imagen guardada y registrada en log exitosamente');

    res.json({
      success: true,
      message: 'Imagen guardada correctamente',
      data: {
        filename: req.file.filename,
        notaId: safeNotaId,
        nombreCorte: imageData.nombreCorte,
        path: req.file.path
      }
    });

  } catch (error) {
    console.error('Error completo al procesar la imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// FUNCIÓN CORREGIDA PARA UN SOLO CORTE
export const InserNoticia = async (req, res) => {
  const insertNoticia = req.body;
  console.log("InserNoticia - datos recibidos:", insertNoticia);
  res.header("Access-Control-Allow-Origin", "*");

  try {
    // Validar y convertir todos los valores safely
    const safeData = {
      aclaracion: safeString(insertNoticia.aclaracion),
      conductores: safeString(insertNoticia.conductores),
      duracion: safeParseInt(insertNoticia.duracion),
      entrevistado: safeString(insertNoticia.entrevistado),
      fechaInicio: insertNoticia.fechaInicio,
      fechaTransmitido: insertNoticia.fechaTransmitido,
      fechaFin: insertNoticia.fechaFin,
      medioid: safeParseInt(insertNoticia.medioid),
      programaid: safeParseInt(insertNoticia.programaid),
      tiponoticiaid: safeParseInt(insertNoticia.tiponoticiaid),
      tipotonoid: safeParseInt(insertNoticia.tipotonoid),
      titulo: safeString(insertNoticia.titulo),
      userid: safeString(insertNoticia.userid),
      startTime: safeParseInt(insertNoticia.startTime),
      endTime: safeParseInt(insertNoticia.endTime)
    };

    console.log('Datos seguros para insertar:', safeData);

    // Validar campos requeridos
    if (!safeData.titulo || !safeData.aclaracion || !safeData.fechaInicio || !safeData.fechaFin) {
      return res.status(400).json({
        error: "Campos requeridos faltantes",
        message: "Título, aclaración, fecha inicio y fecha fin son requeridos",
        received: {
          titulo: safeData.titulo,
          aclaracion: safeData.aclaracion,
          fechaInicio: safeData.fechaInicio,
          fechaFin: safeData.fechaFin
        }
      });
    }

    // **CÁLCULO CORRECTO DE DURACIÓN Y TIEMPOS**
    let finalStartTime = 0;
    let finalEndTime = 0;
    let calculatedDuration = 0;

    if (safeData.fechaTransmitido && safeData.fechaInicio && safeData.fechaFin) {
      // Convertir fechas a objetos Date
      const fechaTransmitidoDate = new Date(safeData.fechaTransmitido);
      const fechaInicioDate = new Date(safeData.fechaInicio);
      const fechaFinDate = new Date(safeData.fechaFin);

      // Calcular diferencias en segundos desde fechaTransmitido
      finalStartTime = Math.floor((fechaInicioDate.getTime() - fechaTransmitidoDate.getTime()) / 1000);
      finalEndTime = Math.floor((fechaFinDate.getTime() - fechaTransmitidoDate.getTime()) / 1000);

      // Asegurar que los tiempos sean positivos
      if (finalStartTime < 0) finalStartTime = 0;
      if (finalEndTime <= finalStartTime) {
        // Si hay problema con las fechas, usar duración original o 60 segundos por defecto
        finalEndTime = finalStartTime + (safeData.duracion || 60);
      }

      // CALCULAR LA DURACIÓN REAL basada en las fechas
      calculatedDuration = Math.floor((fechaFinDate.getTime() - fechaInicioDate.getTime()) / 1000);

      // Asegurar que la duración sea positiva
      if (calculatedDuration <= 0) {
        calculatedDuration = safeData.duracion || 60;
      }

      console.log('Cálculo de tiempos y duración:');
      console.log('fechaTransmitido:', safeData.fechaTransmitido);
      console.log('fechaInicio:', safeData.fechaInicio);
      console.log('fechaFin:', safeData.fechaFin);
      console.log('finalStartTime calculado:', finalStartTime);
      console.log('finalEndTime calculado:', finalEndTime);
      console.log('Duración calculada desde fechas:', calculatedDuration, 'segundos');
      console.log('Duración original recibida:', safeData.duracion, 'segundos');
    } else {
      // Fallback a los valores originales si no hay fechaTransmitido
      finalStartTime = safeData.startTime || 0;
      finalEndTime = safeData.endTime || 0;

      // Si tenemos fechaInicio y fechaFin, calcular duración real
      if (safeData.fechaInicio && safeData.fechaFin) {
        const fechaInicioDate = new Date(safeData.fechaInicio);
        const fechaFinDate = new Date(safeData.fechaFin);
        calculatedDuration = Math.floor((fechaFinDate.getTime() - fechaInicioDate.getTime()) / 1000);

        if (calculatedDuration <= 0) {
          calculatedDuration = safeData.duracion || 60;
        }
      } else {
        calculatedDuration = safeData.duracion || 60;
      }

      console.log('Usando tiempos originales como fallback:', { finalStartTime, finalEndTime, calculatedDuration });
    }

    // Usar la duración calculada en lugar de la recibida
    const finalDuration = calculatedDuration;

    // Validar todos los campos de texto contra las restricciones de la DB
    const validations = [
      validateFieldLength('Titulo', safeData.titulo, 2000),
      validateFieldLength('Aclaracion', safeData.aclaracion, 8000),
      validateFieldLength('Conductores', safeData.conductores, 2000),
      validateFieldLength('Entrevistado', safeData.entrevistado, 2000)
    ];

    // Verificar si alguna validación falló
    const failedValidation = validations.find(v => !v.isValid);
    if (failedValidation) {
      return res.status(400).json({
        error: "Error de validación",
        message: failedValidation.message
      });
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("aclaracion", sql.VarChar, safeData.aclaracion)
      .input("conductores", sql.VarChar, safeData.conductores)
      .input("duracion", sql.Int, finalDuration) // Usar duración calculada
      .input("entrevistado", sql.VarChar, safeData.entrevistado)
      .input("fechaInicio", insertNoticia.fechaInicio)
      .input("fechaTransmitido", sql.DateTime, safeData.fechaTransmitido)
      .input("fechaFin", insertNoticia.fechaFin)
      .input("medio", sql.Int, safeData.medioid)
      .input("programa", sql.Int, safeData.programaid)
      .input("tiponoticiaid", sql.Int, safeData.tiponoticiaid)
      .input("tipotonoid", sql.Int, safeData.tipotonoid)
      .input("titulo", sql.VarChar, safeData.titulo)
      .input("userid", sql.VarChar, safeData.userid)
      .query(querys.InsertNota);

    const mediaUrl = insertNoticia.mediaUrl;
    const mediaName = result.recordset[0].id;
    console.log('MediaName generado:', mediaName, 'tipo:', typeof mediaName);
    console.log('Duración final guardada en BD:', finalDuration, 'segundos');

    const fecha = new Date(safeData.fechaInicio);
    const mes = fecha.getMonth() + 1;
    const mes2 = mes.toString().padStart(2, '0');
    const year = fecha.getFullYear();

    const link = `https://storage09.globalnews.com.co/Alertas/${year}/${mes2}/${mediaName}.mp4`;
    const linkValidation = validateFieldLength('LinkStreaming', link, 1000);
    if (!linkValidation.isValid) {
      throw new Error(linkValidation.message);
    }

    // Log #1 con los tiempos y duración calculados correctamente
    await pool.request()
      .input("idNoticia", sql.VarChar, mediaName.toString())
      .input("tipoAccion", sql.VarChar, 'Noticia Insertada y Corte Solicitado')
      .input("detallesAccion", sql.VarChar, `Noticia ID ${mediaName} insertada por usuario ${safeData.userid}. Título: ${safeData.titulo}. Corte solicitado: ${finalStartTime}-${finalEndTime} segundos (duración: ${finalDuration}s). Duración calculada desde fechas.`)
      .input("tiempoInicioSolicitado", sql.Int, finalStartTime)
      .input("tiempoFinSolicitado", sql.Int, finalEndTime)
      .input("tiempoInicioFinal", sql.Int, null)
      .input("tiempoFinFinal", sql.Int, null)
      .input("urlMediaOriginal", sql.VarChar, mediaUrl)
      .query(`
        INSERT INTO [Videoteca_dev].[dbo].[gnSyncLogs] 
        ([IdNoticia], [TipoAccion], [DetallesAccion], [FechaLog], [TiempoInicioSolicitado], [TiempoFinSolicitado], [TiempoInicioFinal], [TiempoFinFinal], [UrlMediaOriginal])
        VALUES (@idNoticia, @tipoAccion, @detallesAccion, GETDATE(), @tiempoInicioSolicitado, @tiempoFinSolicitado, @tiempoInicioFinal, @tiempoFinFinal, @urlMediaOriginal)
      `);

    // Solo continuar con FFmpeg si tenemos una URL válida y tiempos válidos
    if (mediaUrl && finalStartTime >= 0 && finalEndTime > finalStartTime) {
      console.log(`Iniciando FFmpeg con tiempos: ${finalStartTime}s - ${finalEndTime}s (duración: ${finalEndTime - finalStartTime}s)`);

      ffmpeg(mediaUrl)
        .setStartTime(finalStartTime)
        .setDuration(finalEndTime - finalStartTime) // Usar la diferencia real de tiempos
        .output(`\\\\192.168.1.88\\web\\Alertas\\${year}\\${mes2}\\${mediaName}.mp4`)
        .on('end', async () => {
          try {
            // Insertar en NoticiasVT para UN SOLO CORTE (sin corteNumero)
            await pool.request()
              .input('CorteUrl', sql.VarChar, mediaUrl)
              .input('noticiaID', sql.Int, mediaName)
              .input('inicio', sql.Int, finalStartTime)
              .input('fin', sql.Int, finalEndTime)
              .query("INSERT INTO [Videoteca_dev].[dbo].[NoticiasVT] ([IDNoticia],[CorteUrl],[inicio],[fin],[Estado]) VALUES (@noticiaID,@CorteUrl,@inicio,@fin,'S')");

            // Actualizar noticia principal
            await pool.request()
              .input('linkCorte', sql.VarChar, link)
              .input('noticiaID', sql.Int, mediaName)
              .query('UPDATE [AuditoriaRadioTelevision].[dbo].[Noticias] SET [LinkStreaming] = @linkCorte, [FlagCortado] = \'S\' WHERE [NoticiaID] = @noticiaID');

            // Log #2 con los tiempos finales y duración real
            await pool.request()
              .input("idNoticia", sql.VarChar, mediaName.toString())
              .input("tipoAccion", sql.VarChar, 'Video Cortado y Enlace Actualizado (Éxito)')
              .input("detallesAccion", sql.VarChar, `Video cortado para la noticia ID ${mediaName} exitosamente. Tiempos finales: ${finalStartTime}-${finalEndTime} segundos (duración real del corte: ${finalEndTime - finalStartTime}s, duración almacenada: ${finalDuration}s).`)
              .input("tiempoInicioSolicitado", sql.Int, finalStartTime)
              .input("tiempoFinSolicitado", sql.Int, finalEndTime)
              .input("tiempoInicioFinal", sql.Int, finalStartTime)
              .input("tiempoFinFinal", sql.Int, finalEndTime)
              .input("urlMediaOriginal", sql.VarChar, mediaUrl)
              .query(`
                INSERT INTO [Videoteca_dev].[dbo].[gnSyncLogs] 
                ([IdNoticia], [TipoAccion], [DetallesAccion], [FechaLog], [TiempoInicioSolicitado], [TiempoFinSolicitado], [TiempoInicioFinal], [TiempoFinFinal], [UrlMediaOriginal])
                VALUES (@idNoticia, @tipoAccion, @detallesAccion, GETDATE(), @tiempoInicioSolicitado, @tiempoFinSolicitado, @tiempoInicioFinal, @tiempoFinFinal, @urlMediaOriginal)
              `);

            console.log('Video cortado exitosamente con duración correcta:', finalEndTime - finalStartTime, 'segundos');

          } catch (dbError) {
            console.error('Error al actualizar la base de datos después del corte:', dbError);
          }
        })
        .on('error', async (error) => {
          console.error('Error durante el procesamiento del video:', error);
          // Log de error
          await pool.request()
            .input("idNoticia", sql.VarChar, mediaName.toString())
            .input("tipoAccion", sql.VarChar, 'Error Procesamiento Video (FFmpeg)')
            .input("detallesAccion", sql.VarChar, `Fallo en FFmpeg para noticia ID ${mediaName}: ${error.message}. Tiempos solicitados: ${finalStartTime}-${finalEndTime} (duración: ${finalDuration}s)`)
            .input("tiempoInicioSolicitado", sql.Int, finalStartTime)
            .input("tiempoFinSolicitado", sql.Int, finalEndTime)
            .input("tiempoInicioFinal", sql.Int, null)
            .input("tiempoFinFinal", sql.Int, null)
            .input("urlMediaOriginal", sql.VarChar, mediaUrl)
            .query(`
              INSERT INTO [Videoteca_dev].[dbo].[gnSyncLogs] 
              ([IdNoticia], [TipoAccion], [DetallesAccion], [FechaLog], [TiempoInicioSolicitado], [TiempoFinSolicitado], [TiempoInicioFinal], [TiempoFinFinal], [UrlMediaOriginal])
              VALUES (@idNoticia, @tipoAccion, @detallesAccion, GETDATE(), @tiempoInicioSolicitado, @tiempoFinSolicitado, @tiempoInicioFinal, @tiempoFinFinal, @urlMediaOriginal)
            `);
        })
        .run();
    } else {
      console.log('No se ejecuta FFmpeg - URL o tiempos inválidos:', {
        mediaUrl: !!mediaUrl,
        finalStartTime,
        finalEndTime,
        isValidRange: finalEndTime > finalStartTime,
        calculatedDuration: finalDuration
      });
    }

    res.json({
      id: mediaName,
      duracionCalculada: finalDuration,
      duracionOriginal: safeData.duracion
    });

  } catch (error) {
    console.error('Error en InserNoticia:', error);
    res.status(500);
    if (error.number === 8152) {
      res.status(400).json({
        error: "Error de truncamiento de base de datos",
        message: "Uno o más campos exceden su longitud máxima."
      });
    } else {
      res.json({
        error: "Error interno",
        message: error.message || error
      });
    }
  }
}

// Función mejorada para actualizar fecha y duración
export const updateFechaNoticia = async (req, res) => {
  const tiempoNoticia = req.body;
  console.log("updateFechaNoticia - datos recibidos:", tiempoNoticia);
  req.header("Access-Control-Allow-Origin", "*");

  try {
    // Calcular duración real basada en las fechas recibidas
    let calculatedDuration = tiempoNoticia.duracion;

    if (tiempoNoticia.fechaInicio && tiempoNoticia.fechaFin) {
      const fechaInicio = new Date(tiempoNoticia.fechaInicio);
      const fechaFin = new Date(tiempoNoticia.fechaFin);

      // Calcular duración en segundos
      calculatedDuration = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / 1000);

      // Validar que la duración sea positiva
      if (calculatedDuration <= 0) {
        calculatedDuration = tiempoNoticia.duracion || 60; // Fallback
      }

      console.log('Duración calculada desde fechas:', calculatedDuration, 'segundos');
      console.log('Duración original recibida:', tiempoNoticia.duracion, 'segundos');
    }

    const pool = await getConnection();

    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("fechaInicio", tiempoNoticia.fechaInicio)
      .input("fechaFin", tiempoNoticia.fechaFin)
      .input("duracion", sql.Int, calculatedDuration) // Usar duración calculada
      .query(querys.updateFechaNoticia);

    console.log(`Noticia ${req.params.id} actualizada con duración: ${calculatedDuration}s`);

    res.json({
      success: true,
      duracionCalculada: calculatedDuration,
      duracionOriginal: tiempoNoticia.duracion
    });
  } catch (error) {
    console.error('Error en updateFechaNoticia:', error);
    res.status(500);
    res.send(error);
  }
};

export const getmediosvt = async (req, res) => {
  try {
    //desabilitar cors    
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();
    const result = await pool.request().query(querys.getmediosvt);

    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
}

export const getMynotesdsk = async (req, res) => {
  try {
    const id = req.params.id
    // deshabilitar cors
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();
    const result = await pool.request()
      .input("userid", id)
      .query(querys.selectMyNotesDsk);
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
}


export const getMynotes = async (req, res) => {
  try {
    // deshabilitar cors    
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();
    const result = await pool.request()
      .input("userid", req.body.userid)
      .query(querys.selectMyNotes);
    res.json(result.recordset);

  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
}
//Me traigo la consulta del querys getNotasTemas
export const getNotasTemas = async (req, res) => {
  try {
    //desabilitar cors    
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();
    const result = await pool.request().query(querys.getNotasTemas);

    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
}

export const getTrancriptions = async (req, res) => {
  try {
    //desabilitar cors    
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", req.params.id)
      .input("name", req.body.nombre)
      .query(querys.getTrancriptions);

    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
}

export const getMediaCutsAll = async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", req.params.id)
      .input("fechaCorte", req.body.fechaCorte)
      .query(`
        SELECT 
          IdRegistro, idMedio, NombreMedio, FechaCorte, Texto, LinkStreamming,
          LEN(Texto) as LongitudTexto,
          CONVERT(varchar, DATEADD(hour, -5, FechaCorte), 108) as HoraLocal
        FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
        WHERE idMedio = @id 
          AND CAST(FechaCorte AS DATE) = CAST(@fechaCorte AS DATE)
        ORDER BY FechaCorte ASC
      `);

    console.log(`getMediaCutsAll - Retornando ${result.recordset.length} cortes para medio ${req.params.id}`);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getMediaCutsAll:', error);
    res.status(500).json({ error: error.message });
  }
}


export const getMediaCuts = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaCorte, currentNoteId } = req.body;

    console.log('getMediaCuts - Parámetros recibidos:', { id, fechaCorte, currentNoteId });

    if (!id || !currentNoteId) {
      return res.status(400).json({
        error: 'ID del medio y currentNoteId son requeridos'
      });
    }

    const pool = await getConnection();

    // 1. Encontrar el corte actual por NombreMedio
    const corteActualResult = await pool.request()
      .input('id', sql.Int, id)
      .input('currentNoteId', sql.VarChar, currentNoteId)
      .query(`
                SELECT TOP 1 
                    IdRegistro, idMedio, NombreMedio, FechaCorte, Texto, LinkStreamming,
                    LEN(Texto) as LongitudTexto,
                    CONVERT(varchar, DATEADD(hour, -5, FechaCorte), 108) as HoraLocal
                FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
                WHERE idMedio = @id 
                  AND NombreMedio = @currentNoteId
                ORDER BY IdRegistro DESC
            `);

    if (corteActualResult.recordset.length === 0) {
      return res.status(404).json({
        message: 'No se encontró el corte con el currentNoteId especificado',
        anterior: null,
        actual: null,
        posterior: null
      });
    }

    const corteActual = corteActualResult.recordset[0];

    // 2. Obtener el corte anterior (IdRegistro inmediatamente anterior para el mismo medio)
    const anteriorResult = await pool.request()
      .input('id', sql.Int, id)
      .input('idRegistroActual', sql.Int, corteActual.IdRegistro)
      .query(`
                SELECT TOP 1 
                    IdRegistro, idMedio, NombreMedio, FechaCorte, Texto, LinkStreamming,
                    LEN(Texto) as LongitudTexto,
                    CONVERT(varchar, DATEADD(hour, -5, FechaCorte), 108) as HoraLocal
                FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
                WHERE idMedio = @id 
                  AND IdRegistro < @idRegistroActual
                ORDER BY IdRegistro DESC
            `);

    // 3. Obtener el corte posterior (IdRegistro inmediatamente posterior para el mismo medio)
    const posteriorResult = await pool.request()
      .input('id', sql.Int, id)
      .input('idRegistroActual', sql.Int, corteActual.IdRegistro)
      .query(`
                SELECT TOP 1 
                    IdRegistro, idMedio, NombreMedio, FechaCorte, Texto, LinkStreamming,
                    LEN(Texto) as LongitudTexto,
                    CONVERT(varchar, DATEADD(hour, -5, FechaCorte), 108) as HoraLocal
                FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
                WHERE idMedio = @id 
                  AND IdRegistro > @idRegistroActual
                ORDER BY IdRegistro ASC
            `);

    // Procesar resultados
    const anterior = anteriorResult.recordset.length > 0 ? anteriorResult.recordset[0] : null;
    const posterior = posteriorResult.recordset.length > 0 ? posteriorResult.recordset[0] : null;

    console.log('Contexto final:', {
      anterior: anterior ? `${anterior.HoraLocal} (ID: ${anterior.IdRegistro}, NombreMedio: ${anterior.NombreMedio})` : 'null',
      actual: `${corteActual.HoraLocal} (ID: ${corteActual.IdRegistro}, NombreMedio: ${corteActual.NombreMedio})`,
      posterior: posterior ? `${posterior.HoraLocal} (ID: ${posterior.IdRegistro}, NombreMedio: ${posterior.NombreMedio})` : 'null'
    });

    // Respuesta simplificada
    res.json({
      anterior: anterior,
      actual: corteActual,
      posterior: posterior
    });

  } catch (error) {
    console.error('Error en getMediaCuts:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};


// ALTERNATIVA AÚN MÁS SIMPLE: Solo consultar los 3 cortes necesarios
export const getMediaCutsMinimal = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentNoteId } = req.body;

    if (!id || !currentNoteId) {
      return res.status(400).json({
        error: 'ID del medio y currentNoteId son requeridos'
      });
    }

    // Extraer información del currentNoteId
    const match = currentNoteId.match(/(\d+)(20\d{6})_(\d{6})/);
    if (!match) {
      return res.status(400).json({ error: 'Formato de currentNoteId inválido' });
    }

    const [, medioId, fechaStr, horaStr] = match;
    const fechaBusqueda = `${fechaStr.substring(0, 4)}-${fechaStr.substring(4, 6)}-${fechaStr.substring(6, 8)}`;
    const tiempoObjetivo = `${horaStr.substring(0, 2)}:${horaStr.substring(2, 4)}:${horaStr.substring(4, 6)}`;

    const pool = await getConnection();

    // 1. Encontrar el corte actual
    const corteActualResult = await pool.request()
      .input('id', sql.Int, id)
      .input('fechaCorte', sql.Date, fechaBusqueda)
      .input('tiempoObjetivo', sql.VarChar, tiempoObjetivo)
      .query(`
                SELECT TOP 1 
                    IdRegistro,
                    idMedio,
                    NombreMedio,
                    FechaCorte,
                    Texto,
                    LinkStreamming,
                    LEN(Texto) as LongitudTexto,
                    CONVERT(varchar, DATEADD(hour, -5, FechaCorte), 108) as HoraLocal,
                    ABS(DATEDIFF(SECOND, 
                        CAST('1900-01-01 ' + @tiempoObjetivo AS DATETIME),
                        CAST('1900-01-01 ' + CONVERT(varchar, DATEADD(hour, -5, FechaCorte), 108) AS DATETIME)
                    )) as DiferenciaSegundos
                FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
                WHERE idMedio = @id 
                  AND CAST(FechaCorte AS DATE) = CAST(@fechaCorte AS DATE)
                ORDER BY DiferenciaSegundos ASC
            `);

    if (corteActualResult.recordset.length === 0) {
      return res.status(404).json({
        message: 'No se encontraron cortes para esta fecha',
        anterior: null,
        posterior: null
      });
    }

    const corteActual = corteActualResult.recordset[0];

    // 2. Obtener anterior y posterior basado en la fecha del corte actual
    const adyacentesResult = await pool.request()
      .input('id', sql.Int, id)
      .input('fechaCorte', sql.Date, fechaBusqueda)
      .input('fechaActual', sql.DateTime, corteActual.FechaCorte)
      .query(`
                (
                    SELECT TOP 1 
                        'anterior' as TipoCorte,
                        IdRegistro, idMedio, NombreMedio, FechaCorte, Texto, LinkStreamming,
                        LEN(Texto) as LongitudTexto,
                        CONVERT(varchar, DATEADD(hour, -5, FechaCorte), 108) as HoraLocal
                    FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
                    WHERE idMedio = @id 
                      AND CAST(FechaCorte AS DATE) = CAST(@fechaCorte AS DATE)
                      AND FechaCorte < @fechaActual
                    ORDER BY FechaCorte DESC
                )
                UNION ALL
                (
                    SELECT TOP 1 
                        'posterior' as TipoCorte,
                        IdRegistro, idMedio, NombreMedio, FechaCorte, Texto, LinkStreamming,
                        LEN(Texto) as LongitudTexto,
                        CONVERT(varchar, DATEADD(hour, -5, FechaCorte), 108) as HoraLocal
                    FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
                    WHERE idMedio = @id 
                      AND CAST(FechaCorte AS DATE) = CAST(@fechaCorte AS DATE)
                      AND FechaCorte > @fechaActual
                    ORDER BY FechaCorte ASC
                )
            `);

    // Procesar resultado
    let anterior = null;
    let posterior = null;

    adyacentesResult.recordset.forEach(row => {
      const corte = {
        IdRegistro: row.IdRegistro,
        idMedio: row.idMedio,
        NombreMedio: row.NombreMedio,
        FechaCorte: row.FechaCorte,
        Texto: row.Texto,
        LinkStreamming: row.LinkStreamming,
        LongitudTexto: row.LongitudTexto,
        HoraLocal: row.HoraLocal
      };

      if (row.TipoCorte === 'anterior') {
        anterior = corte;
      } else if (row.TipoCorte === 'posterior') {
        posterior = corte;
      }
    });

    console.log('Resultado final:', {
      actual: corteActual.HoraLocal,
      anterior: anterior ? anterior.HoraLocal : 'null',
      posterior: posterior ? posterior.HoraLocal : 'null'
    });

    // **RESPUESTA MÍNIMA**
    res.json({
      anterior: anterior,
      posterior: posterior
    });

  } catch (error) {
    console.error('Error en getMediaCutsMinimal:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

export const buscarCortePorNombre = async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    const { idMedio, nombreArchivo } = req.params;

    console.log('buscarCortePorNombre - Parámetros:', { idMedio, nombreArchivo });

    if (!idMedio || !nombreArchivo) {
      return res.status(400).json({
        error: 'ID del medio y nombre del archivo son requeridos'
      });
    }

    const pool = await getConnection();

    // Buscar por múltiples criterios
    const resultado = await pool.request()
      .input('idMedio', sql.Int, idMedio)
      .input('nombreArchivo', sql.VarChar, `%${nombreArchivo}%`)
      .query(`
                SELECT 
                    IdRegistro,
                    idMedio,
                    NombreMedio,
                    FechaCorte,
                    Texto,
                    LinkStreamming,
                    LEN(Texto) as LongitudTexto,
                    CONVERT(varchar, FechaCorte, 120) as FechaCorteFormatted
                FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
                WHERE idMedio = @idMedio 
                  AND (
                    NombreMedio LIKE @nombreArchivo 
                    OR CONVERT(varchar, FechaCorte, 112) + '_' + CONVERT(varchar, FechaCorte, 108) LIKE @nombreArchivo
                  )
                ORDER BY FechaCorte DESC
            `);

    if (resultado.recordset.length === 0) {
      return res.status(404).json({
        message: 'No se encontró ningún corte con ese criterio de búsqueda'
      });
    }

    res.json({
      success: true,
      cortes: resultado.recordset,
      total: resultado.recordset.length
    });

  } catch (error) {
    console.error('Error en buscarCortePorNombre:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

function extraerFechaDeNoteId(currentNoteId, medioId) {
  try {
    // Formato: [medioId][YYYYMMDD]_[HHMMSS]
    // Ejemplo: 2759720250703_053000

    if (!currentNoteId || !medioId) {
      return null;
    }

    // Remover el medioId del inicio
    const sinMedio = currentNoteId.replace(medioId.toString(), '');

    // Buscar patrón de fecha
    const regexFecha = /^(20\d{6})_(\d{6})$/;
    const match = sinMedio.match(regexFecha);

    if (match) {
      const [, fechaStr, horaStr] = match;
      // fechaStr = "20250703" -> "2025-07-03"
      const year = fechaStr.substring(0, 4);
      const month = fechaStr.substring(4, 6);
      const day = fechaStr.substring(6, 8);

      return {
        fecha: `${year}-${month}-${day}`,
        fechaCompleta: `${year}-${month}-${day}T${horaStr.substring(0, 2)}:${horaStr.substring(2, 4)}:${horaStr.substring(4, 6)}`,
        year,
        month,
        day,
        hour: horaStr.substring(0, 2),
        minute: horaStr.substring(2, 4),
        second: horaStr.substring(4, 6)
      };
    }

    return null;
  } catch (error) {
    console.error('Error al extraer fecha de noteId:', error);
    return null;
  }
}

/**
 * Obtener el rango de cortes entre dos puntos
 */
export const obtenerRangoCortes = async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    const { idMedio, corteInicioId, corteFinId } = req.body;

    console.log('obtenerRangoCortes - Parámetros:', { idMedio, corteInicioId, corteFinId });

    if (!idMedio || !corteInicioId || !corteFinId) {
      return res.status(400).json({
        error: 'ID del medio, corte de inicio y corte de fin son requeridos'
      });
    }

    const pool = await getConnection();

    // Obtener información de los cortes de inicio y fin
    const cortesInfo = await pool.request()
      .input('corteInicioId', sql.Int, corteInicioId)
      .input('corteFinId', sql.Int, corteFinId)
      .query(`
                SELECT 
                    IdRegistro,
                    idMedio,
                    NombreMedio,
                    FechaCorte,
                    LinkStreamming
                FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
                WHERE IdRegistro IN (@corteInicioId, @corteFinId)
                ORDER BY FechaCorte ASC
            `);

    const cortes = cortesInfo.recordset;
    if (cortes.length !== 2) {
      return res.status(404).json({
        error: 'No se pudieron encontrar ambos cortes especificados'
      });
    }

    const [corteInicio, corteFin] = cortes;

    // Obtener todos los cortes en el rango
    const cortesEnRango = await pool.request()
      .input('idMedio', sql.Int, idMedio)
      .input('fechaInicio', sql.DateTime, corteInicio.FechaCorte)
      .input('fechaFin', sql.DateTime, corteFin.FechaCorte)
      .query(`
                SELECT 
                    IdRegistro,
                    idMedio,
                    NombreMedio,
                    FechaCorte,
                    Texto,
                    LinkStreamming,
                    LEN(Texto) as LongitudTexto
                FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
                WHERE idMedio = @idMedio 
                  AND FechaCorte >= @fechaInicio 
                  AND FechaCorte <= @fechaFin
                ORDER BY FechaCorte ASC
            `);

    const rangoCortesCompleto = cortesEnRango.recordset;

    res.json({
      success: true,
      corteInicio,
      corteFin,
      cortesEnRango: rangoCortesCompleto,
      totalCortes: rangoCortesCompleto.length,
      duracionEstimada: moment(corteFin.FechaCorte).diff(moment(corteInicio.FechaCorte), 'seconds')
    });

  } catch (error) {
    console.error('Error en obtenerRangoCortes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Validar coherencia temporal entre cortes - Versión HTTP endpoint
 */
export const validarCoherenciaCortesHTTP = async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    const { corteInicio, corteFin, tiempoInicio, tiempoFin } = req.body;

    console.log('validarCoherenciaCortesHTTP - Parámetros:', {
      corteInicio: corteInicio?.IdRegistro,
      corteFin: corteFin?.IdRegistro,
      tiempoInicio,
      tiempoFin
    });

    if (!corteInicio || !corteFin || tiempoInicio === undefined || tiempoFin === undefined) {
      return res.status(400).json({
        error: 'Corte de inicio, corte de fin, tiempo de inicio y tiempo de fin son requeridos'
      });
    }

    // Usar la función auxiliar que ya tienes definida
    const resultado = validarCoherenciaCortes(corteInicio, corteFin, tiempoInicio, tiempoFin);

    res.json({
      success: true,
      validacion: resultado
    });

  } catch (error) {
    console.error('Error en validarCoherenciaCortesHTTP:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Obtener estadísticas detalladas de cortes para un medio en una fecha específica
 */
export const getEstadisticasCortes = async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    const { idMedio, fecha } = req.params;

    console.log('getEstadisticasCortes - Parámetros:', { idMedio, fecha });

    if (!idMedio || !fecha) {
      return res.status(400).json({
        error: 'ID del medio y fecha son requeridos'
      });
    }

    const pool = await getConnection();

    // Obtener estadísticas básicas
    const estadisticas = await pool.request()
      .input('idMedio', sql.Int, idMedio)
      .input('fecha', sql.Date, fecha)
      .query(`
                SELECT 
                    COUNT(*) as TotalCortes,
                    MIN(FechaCorte) as PrimerCorte,
                    MAX(FechaCorte) as UltimoCorte,
                    AVG(LEN(Texto)) as PromedioLongitudTexto,
                    SUM(CASE WHEN LEN(Texto) > 0 THEN 1 ELSE 0 END) as CortesConTexto,
                    SUM(CASE WHEN LinkStreamming IS NOT NULL THEN 1 ELSE 0 END) as CortesConVideo
                FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
                WHERE idMedio = @idMedio 
                  AND CAST(FechaCorte AS DATE) = CAST(@fecha AS DATE)
            `);

    // Obtener distribución por horas
    const distribucionHoras = await pool.request()
      .input('idMedio', sql.Int, idMedio)
      .input('fecha', sql.Date, fecha)
      .query(`
                SELECT 
                    DATEPART(HOUR, FechaCorte) as Hora,
                    COUNT(*) as CantidadCortes,
                    AVG(LEN(Texto)) as PromedioTexto
                FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
                WHERE idMedio = @idMedio 
                  AND CAST(FechaCorte AS DATE) = CAST(@fecha AS DATE)
                GROUP BY DATEPART(HOUR, FechaCorte)
                ORDER BY Hora
            `);

    res.json({
      success: true,
      estadisticas: estadisticas.recordset[0],
      distribucionPorHoras: distribucionHoras.recordset,
      fecha: fecha,
      medio: idMedio
    });

  } catch (error) {
    console.error('Error en getEstadisticasCortes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

export const getContextoNavegacionCorte = async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    const { idMedio, idRegistro } = req.params;

    console.log('getContextoNavegacionCorte - Parámetros:', { idMedio, idRegistro });

    if (!idMedio || !idRegistro) {
      return res.status(400).json({
        error: 'ID del medio e ID del registro son requeridos'
      });
    }

    const pool = await getConnection();

    // Obtener el corte actual
    const corteActual = await pool.request()
      .input('idRegistro', sql.Int, idRegistro)
      .query(`
                SELECT 
                    IdRegistro, idMedio, NombreMedio, FechaCorte, Texto, LinkStreamming,
                    LEN(Texto) as LongitudTexto,
                    CONVERT(varchar, DATEADD(hour, -5, FechaCorte), 108) as HoraLocal
                FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
                WHERE IdRegistro = @idRegistro
            `);

    if (corteActual.recordset.length === 0) {
      return res.status(404).json({
        error: 'No se encontró el corte especificado'
      });
    }

    const corte = corteActual.recordset[0];

    // Obtener anterior (IdRegistro inmediatamente anterior para el mismo medio)
    const anteriorResult = await pool.request()
      .input('idMedio', sql.Int, idMedio)
      .input('idRegistroActual', sql.Int, idRegistro)
      .query(`
                SELECT TOP 1 
                    IdRegistro, idMedio, NombreMedio, FechaCorte, Texto, LinkStreamming,
                    LEN(Texto) as LongitudTexto,
                    CONVERT(varchar, DATEADD(hour, -5, FechaCorte), 108) as HoraLocal
                FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
                WHERE idMedio = @idMedio 
                  AND IdRegistro < @idRegistroActual
                ORDER BY IdRegistro DESC
            `);

    // Obtener posterior (IdRegistro inmediatamente posterior para el mismo medio)
    const posteriorResult = await pool.request()
      .input('idMedio', sql.Int, idMedio)
      .input('idRegistroActual', sql.Int, idRegistro)
      .query(`
                SELECT TOP 1 
                    IdRegistro, idMedio, NombreMedio, FechaCorte, Texto, LinkStreamming,
                    LEN(Texto) as LongitudTexto,
                    CONVERT(varchar, DATEADD(hour, -5, FechaCorte), 108) as HoraLocal
                FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
                WHERE idMedio = @idMedio 
                  AND IdRegistro > @idRegistroActual
                ORDER BY IdRegistro ASC
            `);

    // Procesar resultado
    const anterior = anteriorResult.recordset.length > 0 ? anteriorResult.recordset[0] : null;
    const posterior = posteriorResult.recordset.length > 0 ? posteriorResult.recordset[0] : null;

    console.log('Contexto procesado:', {
      anterior: anterior ? `${anterior.HoraLocal} (ID: ${anterior.IdRegistro})` : 'null',
      actual: `${corte.HoraLocal} (ID: ${corte.IdRegistro})`,
      posterior: posterior ? `${posterior.HoraLocal} (ID: ${posterior.IdRegistro})` : 'null'
    });

    // Respuesta simplificada compatible con el frontend
    res.json({
      anterior: anterior,
      posterior: posterior
    });

  } catch (error) {
    console.error('Error en getContextoNavegacionCorte:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};


export const getMedia = async (req, res) => {
  try {
    //desabilitar cors    
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();
    const result = await pool.request()

      .input("nombreCorte", req.body.nombreCorte)
      .query(querys.getCut);

    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
}

export const getPalabras = async (req, res) => {
  try {
    //desabilitar cors    
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();
    const result = await pool.request()
      .query(querys.getPalabras);
    res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
}

export const getNotesById = async (req, res) => {
  try {
    //desabilitar cors    
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", req.params.id)
      .query(querys.getNotasById);
    return res.json(result.recordset[0]);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

export const getMencionById = async (req, res) => {
  try {
    //desabilitar cors    
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", req.params.id)
      .query(querys.getMencionById);
    return res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
export const getMencion = async (req, res) => {
  try {
    //desabilitar cors    
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();
    const result = await pool.request().query(querys.getMencion);
    return res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
export const getTemasGeneralesById = async (req, res) => {
  try {
    //desabilitar cors    
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", req.params.id)
      .query(querys.getTemasGeneralesById);
    return res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};


export const getTipos = async (req, res) => {
  try {
    //desabilitar cors    
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();
    const result = await pool.request().query(querys.selectTipos);
    return res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};


export const getTemasGenerales = async (req, res) => {
  try {
    //desabilitar cors    
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();
    const result = await pool.request().query(querys.getTemasGenerales);
    return res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
export const getCoberturaId = async (req, res) => {
  try {
    //desabilitar cors    
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("id", req.params.id)
      .query(querys.getCoberturaId);
    return res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};
export const getCoberturas = async (req, res) => {
  try {
    //desabilitar cors    
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();
    const result = await pool.request().query(querys.getCobertura);
    return res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

export const getMedio = async (req, res) => {
  try {
    //desabilitar cors  
    const idmedio = req.params.id
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();
    const result = await pool.request()

      .input("idmedio", idmedio)
      .query(querys.selectMedio);
    return res.json(result.recordset[0]);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

export const getProgramas = async (req, res) => {
  try {
    //desabilitar cors    
    res.header("Access-Control-Allow-Origin", "*");
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", req.params.id)
      .query(querys.selectProgramas);
    return res.json(result.recordset);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};


export const deleteMensiones = async (req, res) => {
  const MensionDelete = req.body;

  try {

    console.log(MensionDelete.eliminarID)

    const pool = await getConnection();
    for (const mension of MensionDelete.eliminarID) {
      console.log(mension)
    }
    const result = await pool
      .request()
      .input("id", req.params.id)
      .input("MensionDelete", sql.Int, MensionDelete.eliminarID)
      .query(querys.deleteMencion);

    //if (result.rowsAffected[0] === 0) return res.sendStatus(404);

    // return res.sendStatus(204);

    return res.send("ok")
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

export const deleteCoberturas = async (req, res) => {
  const MensionDelete = req.body;

  try {

    console.log(MensionDelete.eliminarID)

    const pool = await getConnection();
    for (const mension of MensionDelete.eliminarID) {
      console.log(mension)
    }
    const result = await pool
      .request()
      .input("id", req.params.id)
      .input("CoberturaDelete", sql.Int, MensionDelete.eliminarID)
      .query(querys.deleteCobertura);
    return res.send("ok")
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

export const deleteTemas = async (req, res) => {
  const MensionDelete = req.body;

  try {

    console.log(MensionDelete.eliminarID)

    const pool = await getConnection();
    for (const mension of MensionDelete.eliminarID) {
      console.log(mension)
    }
    const result = await pool
      .request()
      .input("id", req.params.id)
      .input("TemaDelete", sql.Int, MensionDelete.eliminarID)
      .query(querys.deleteTema);
    return res.send("ok")
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

export const InsertMencions = async (req, res) => {
  const MensionInsert = req.body;
  console.log("entreinsert")
  req.header("Access-Control-Allow-Origin", "*");
  console.log(MensionInsert)
  try {
    const pool = await getConnection();
    for (const mension of MensionInsert.agregarID) {
      console.log(mension)
      console.log(MensionInsert.fechaAlta)
      await pool
        .request()
        .input("id", sql.Int, req.params.id)
        .input("mension", sql.Int, mension)
        .input("fechaAlta", sql.DateTime, MensionInsert.fechaAlta)
        .query(querys.InsertMencion);
    }
    res.json("ok");
  } catch (error) {
    res.status(500);
    res.send(error);
  }

};
export const InsertCoberturas = async (req, res) => {
  const MensionInsert = req.body;
  console.log("entreinsert")
  req.header("Access-Control-Allow-Origin", "*");
  console.log(MensionInsert)
  try {
    const pool = await getConnection();
    for (const cobertura of MensionInsert.agregarID) {
      console.log(cobertura)
      console.log(MensionInsert.fechaAlta)
      await pool
        .request()
        .input("id", sql.Int, req.params.id)
        .input("cobertura", sql.Int, cobertura)
        .input("fechaAlta", sql.DateTime, MensionInsert.fechaAlta)
        .query(querys.InsertCobertura);
    }
    res.json("ok");
  } catch (error) {
    res.status(500);
    res.send(error);
  }

};

export const InsertTema = async (req, res) => {
  const MensionInsert = req.body;
  console.log("entreinsert")
  req.header("Access-Control-Allow-Origin", "*");
  console.log(MensionInsert)
  try {
    const pool = await getConnection();
    for (const tema of MensionInsert.agregarID) {
      console.log(tema)
      console.log(MensionInsert.fechaAlta)
      await pool
        .request()
        .input("id", sql.Int, req.params.id)
        .input("tema", sql.Int, tema)
        .input("fechaAlta", sql.DateTime, MensionInsert.fechaAlta)
        .query(querys.InsertTema);
    }
    res.json("ok");
  } catch (error) {
    res.status(500);
    res.send(error);
  }

};

export const login = async (req, res) => {
  const username = req.body.nombreUsuario;
  const password = req.body.password;

  try {
    const pool = await getConnection();

    const result = await pool.request()
      .input("user", username)
      .query(querys.selectUser);
    // Buscar el usuario en la tabla aspnet_Users

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ message: 'Username or password incorrect user' });
    }
    // Buscar la contraseña en la tabla password


    const passwordResult = await pool.request()
      .input("pass", password)
      .query(querys.access)
    const passwordRow = passwordResult.recordset[0];
    if (!passwordRow) {
      return res.status(401).json({ message: 'Username or password incorrect password' });
    }
    // Si el usuario y la contraseña son correctos, generar un token de sesión y retornar el user id
    res.json({ userId: user.UserId, userName: user.UserName });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
}


// recibir archivo de un formdata
// Validation utility function
const validateFieldLength = (field, value, maxLength) => {
  if (value && value.length > maxLength) {
    return {
      isValid: false,
      message: `Field "${field}" exceeds maximum length of ${maxLength} characters. Current length: ${value.length}`
    };
  }
  return { isValid: true };
};

export const uploadFile = async (req, res) => {
  //desabilitar cors
  res.header("Access-Control-Allow-Origin", "*");
  // leer el form data
  try {
    const upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json(err);
      } else if (err) {
        return res.status(500).json(err);
      }
      // responder con la ruta del archivo donde se guardo
      return res.status(200).send(req.file);
    });
  }
  catch (error) {
    res.status(500).json(error);
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { fechaInicio } = req.body;
    const fecha = new Date(fechaInicio);
    const mes = fecha.getMonth() + 1;
    const mes2 = mes.toString().padStart(2, '0');
    const year = fecha.getFullYear();

    cb(null, `\\\\192.168.1.88\\web\\Alertas\\${year}\\${mes2}`);
  },
  filename: async function (req, file, cb) {
    try {
      const { titulo, contenido, fechaInicio, fechaFin, medio, programa, duracion, conductores, entrevistado, tipoNoticia, userid, fechatransmitido } = req.body;

      // Validate all text fields against DB constraints
      const validations = [
        validateFieldLength('Titulo', titulo, 2000),
        validateFieldLength('Aclaracion', contenido, 8000),
        validateFieldLength('Conductores', conductores, 2000),
        validateFieldLength('Entrevistado', entrevistado, 2000),
        validateFieldLength('LinkStreaming', `https://storage09.globalnews.com.co/Alertas/xxxx/xx/xxxxx.xxx`, 1000)
      ];

      // Check if any validation failed
      const failedValidation = validations.find(v => !v.isValid);
      if (failedValidation) {
        console.error('Validation error:', failedValidation.message);
        return cb(new Error(failedValidation.message));
      }

      const fecha = new Date(fechaInicio);
      const mes = fecha.getMonth() + 1;
      const mes2 = mes.toString().padStart(2, '0');
      const year = fecha.getFullYear();
      const extension = file.originalname.split('.').pop();

      const pool = await getConnection();

      try {
        const result = await pool
          .request()
          .input("aclaracion", contenido)
          .input("conductores", conductores)
          .input("duracion", duracion)
          .input("entrevistado", entrevistado)
          .input("fechaInicio", fechaInicio)
          .input("fechaTransmitido", fechatransmitido)
          .input("fechaFin", fechaFin)
          .input("medio", medio)
          .input("programa", programa)
          .input("tiponoticiaid", tipoNoticia)
          .input("tipotonoid", null)  // Changed from empty string to null
          .input("titulo", titulo)
          .input("userid", userid)
          .query(querys.InsertNota);

        const medianame = result.recordset[0].id;
        const link = `https://storage09.globalnews.com.co/Alertas/${year}/${mes2}/${medianame}.${extension}`;

        // Validate link length before updating
        const linkValidation = validateFieldLength('LinkStreaming', link, 1000);
        if (!linkValidation.isValid) {
          throw new Error(linkValidation.message);
        }

        await pool.request()
          .input('linkCorte', link)
          .input('noticiaID', medianame)
          .query('UPDATE [AuditoriaRadioTelevision].[dbo].[Noticias] SET [LinkStreaming] = @linkCorte, [FlagCortado] = \'S\' WHERE [NoticiaID] = @noticiaID');

        const name = medianame + "." + extension;
        cb(null, name);
      } catch (dbError) {
        console.error('Database error:', dbError);
        if (dbError.number === 8152) {
          cb(new Error("Database truncation error. One or more fields exceed their maximum length. Limits: Titulo (2000), Aclaracion (8000), Conductores (2000), Entrevistado (2000), LinkStreaming (1000)."));
        } else {
          cb(dbError);
        }
      }
    } catch (error) {
      console.error('General error:', error);
      cb(error);
    }
  }
});


export const editNotes = async (req, res) => {
  try {
    const startTime = req.body.inicio;
    const endTime = req.body.fin;
    const mediaName = req.params.id;
    const mediaUrl = req.body.url;
    const fechainicio = req.body.fechaInicio;
    const pool = await getConnection();
    const fecha = new Date(fechainicio);
    const mes = fecha.getMonth() + 1;
    const mes2 = mes.toString().padStart(2, '0');
    const year = fecha.getFullYear();

    // Generate link for update and validate its length
    const link = `https://storage09.globalnews.com.co/Alertas/${year}/${mes2}/${mediaName}.mp4`;
    const linkValidation = validateFieldLength('LinkStreaming', link, 1000);
    if (!linkValidation.isValid) {
      throw new Error(linkValidation.message);
    }

    ffmpeg(mediaUrl)
      .setStartTime(startTime)
      .setDuration(endTime - startTime)
      .output(`\\\\192.168.1.88\\web\\Alertas\\${year}\\${mes2}\\${mediaName}.mp4`)
      .on('end', () => {
        pool.request()
          .input('linkCorte', link)
          .input('noticiaID', mediaName)
          .query('UPDATE [AuditoriaRadioTelevision].[dbo].[Noticias] SET [LinkStreaming] = @linkCorte, [FlagCortado] = \'S\' WHERE [NoticiaID] = @noticiaID');
        pool.request()
          .input('inicio', startTime)
          .input('fin', endTime)
          .input('noticiaID', mediaName)
          .query("UPDATE [Videoteca_dev].[dbo].[NoticiasVT] SET [inicio]=@inicio ,[fin]=@fin WHERE [IDNoticia]=@noticiaID");

        res.json({ id: mediaName });
      })
      .on('error', (error) => {
        res.status(500);
        console.error(error);
        res.send(error);
      })
      .run();
  } catch (error) {
    res.status(500);
    if (error.number === 8152) {
      res.json({
        error: "Database truncation error",
        message: "One or more fields exceed their maximum length. Check LinkStreaming (1000)."
      });
    } else {
      res.send(error.message || error);
    }
  }
}

export const updateNoticia = async (req, res) => {
  const updateNoticia = req.body;
  console.log("entreinsert");
  req.header("Access-Control-Allow-Origin", "*");
  console.log(updateNoticia);

  try {
    // Validate field value against database constraints based on field name
    const validateUpdateField = (field, value) => {
      switch (field) {
        case 'Titulo':
          return validateFieldLength('Titulo', value, 2000);
        case 'Aclaracion':
          return validateFieldLength('Aclaracion', value, 8000);
        case 'Conductores':
          return validateFieldLength('Conductores', value, 2000);
        case 'Entrevistado':
          return validateFieldLength('Entrevistado', value, 2000);
        case 'LinkStreaming':
          return validateFieldLength('LinkStreaming', value, 1000);
        default:
          return { isValid: true };
      }
    };

    // Validate the field being updated
    const fieldValidation = validateUpdateField(updateNoticia.campo, updateNoticia.valor);
    if (!fieldValidation.isValid) {
      return res.status(400).json({
        error: "Validation error",
        message: fieldValidation.message
      });
    }

    const pool = await getConnection();
    for (const campo of updateNoticia.campo) {
      await pool
        .request()
        .input("id", sql.Int, req.params.id)
        .input("valor", updateNoticia.valor)
        .query(querys.updateNoticia(updateNoticia.campo));
    }
    res.json("ok");
  } catch (error) {
    res.status(500);
    console.log(error);
    if (error.number === 8152) {
      res.json({
        error: "Database truncation error",
        message: "Field value exceeds maximum length. Check character limits for text fields."
      });
    } else {
      res.send(error);
    }
  }
}