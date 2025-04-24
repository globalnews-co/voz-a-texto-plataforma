import { getConnection, querys, sql } from "../database/index.js"
//ruta completa
import ffmpeg from 'fluent-ffmpeg';
import multer from 'multer';
import { config } from "dotenv"

config();

const ffmpegPath = process.env.FFMPEG_PATH
if (ffmpegPath!== '' || ffmpegPath !==null){
ffmpeg.setFfmpegPath(ffmpegPath);
}
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


export const getMediaCuts = async (req, res) => {
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

export const updateFechaNoticia = async (req, res) => {
  const tiempoNoticia = req.body;
  console.log("entreinsert")
  req.header("Access-Control-Allow-Origin", "*");
  try {
    const pool = await getConnection();


    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("fechaInicio", tiempoNoticia.fechaInicio)
      .input("fechaFin", tiempoNoticia.fechaFin)
      .input("duracion", sql.Int, tiempoNoticia.duracion)
      .query(querys.updateFechaNoticia);

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
    const {fechaInicio} = req.body;
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

export const InserNoticia = async (req, res) => {
  const insertNoticia = req.body;
  console.log("entreinsert");
  req.header("Access-Control-Allow-Origin", "*");
  console.log(insertNoticia);

  try {
    // Validate all text fields against DB constraints
    const validations = [
      validateFieldLength('Titulo', insertNoticia.titulo, 2000),
      validateFieldLength('Aclaracion', insertNoticia.aclaracion, 8000),
      validateFieldLength('Conductores', insertNoticia.conductores, 2000),
      validateFieldLength('Entrevistado', insertNoticia.entrevistado, 2000)
    ];
    
    // Check if any validation failed
    const failedValidation = validations.find(v => !v.isValid);
    if (failedValidation) {
      return res.status(400).json({ 
        error: "Validation error", 
        message: failedValidation.message 
      });
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("aclaracion", insertNoticia.aclaracion)
      .input("conductores", insertNoticia.conductores)
      .input("duracion", insertNoticia.duracion)
      .input("entrevistado", insertNoticia.entrevistado)
      .input("fechaInicio", insertNoticia.fechaInicio)
      .input("fechaTransmitido", insertNoticia.fechaTransmitido)
      .input("fechaFin", insertNoticia.fechaFin)
      .input("medio", insertNoticia.medioid)
      .input("programa", insertNoticia.programaid)
      .input("tiponoticiaid", insertNoticia.tiponoticiaid)
      .input("tipotonoid", insertNoticia.tipotonoid || null)  // Use null if empty
      .input("titulo", insertNoticia.titulo)
      .input("userid", insertNoticia.userid)
      .query(querys.InsertNota);

    const mediaUrl = insertNoticia.mediaUrl;
    const startTime = insertNoticia.startTime;
    const endTime = insertNoticia.endTime;
    const mediaName = result.recordset[0].id;
    const fecha = new Date(insertNoticia.fechaInicio);
    const mes = fecha.getMonth() + 1;
    const mes2 = mes.toString().padStart(2, '0');
    const year = fecha.getFullYear();
    
    // Generate link for update and validate its length
    const link = `https://storage09.globalnews.com.co/Alertas/${year}/${mes2}/${mediaName}.mp4`;
    const linkValidation = validateFieldLength('LinkStreaming', link, 1000);
    if (!linkValidation.isValid) {
      throw new Error(linkValidation.message);
    }
    
    // Aquí se corta el video utilizando fluent-ffmpeg
    ffmpeg(mediaUrl)
      .setStartTime(startTime)
      .setDuration(endTime - startTime)
      .output(`\\\\192.168.1.88\\web\\Alertas\\${year}\\${mes2}\\${mediaName}.mp4`)
      .on('end', () => {
        // Aquí se actualiza la base de datos
        pool.request()
          .input('CorteUrl', mediaUrl)
          .input('noticiaID', mediaName)
          .input('inicio', startTime)
          .input('fin', endTime)
          .query("INSERT INTO [Videoteca_dev].[dbo].[NoticiasVT] ([IDNoticia],[CorteUrl],[inicio],[fin],[Estado]) VALUES (@noticiaID,@CorteUrl,@inicio,@fin,'S')");

        pool.request()
          .input('linkCorte', link)
          .input('noticiaID', mediaName)
          .query('UPDATE [AuditoriaRadioTelevision].[dbo].[Noticias] SET [LinkStreaming] = @linkCorte, [FlagCortado] = \'S\' WHERE [NoticiaID] = @noticiaID');
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
    console.log(error);
    if (error.number === 8152) {
      res.status(400).json({
        error: "Database truncation error", 
        message: "One or more fields exceed their maximum length. Limits: Titulo (2000), Aclaracion (8000), Conductores (2000), Entrevistado (2000), LinkStreaming (1000)."
      });
    } else {
      res.send(error.message || error);
    }
  }
}

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
      switch(field) {
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