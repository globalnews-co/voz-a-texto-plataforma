export const querys = {
  getmediosvt:
    "SELECT DISTINCT ID_Medio , NombreMedio  FROM [videoteca_dev].[dbo].[VT_Horarios] where CercaDe != 'Deshabilitado'",

  InsertNoticiaLog: `INSERT INTO [Videoteca_dev].[dbo].[gnSyncLogs] (
        IdNoticia,
        TipoAccion,
        DetallesAccion,
        TiempoInicioSolicitado,
        TiempoFinSolicitado,
        TiempoInicioFinal,
        TiempoFinFinal,
        UrlMediaOriginal,
        CorteNumero,
        NombreCorte
    )
    VALUES (
        @idNoticia,
        @tipoAccion,
        @detallesAccion,
        @tiempoInicioSolicitado,
        @tiempoFinSolicitado,
        @tiempoInicioFinal,
        @tiempoFinFinal,
        @urlMediaOriginal,
        @corteNumero,
        @nombreCorte
    )`,

  // nueva consulta para insertar multiples cortes en cvt
  InsertNoticiaVTCorte: `INSERT INTO [Videoteca_dev].[dbo].[NoticiasVT] (
        [IDNoticia],
        [CorteUrl],
        [inicio],
        [fin],
        [Estado],
        [CorteNumero],
        [NombreCorte],
        [DuracionSegundos],
        [ArchivoGenerado],
        [FechaCreacion]
    ) VALUES (
        @noticiaID,
        @CorteUrl,
        @inicio,
        @fin,
        @estado,
        @corteNumero,
        @nombreCorte,
        @duracionSegundos,
        @archivoGenerado,
        GETDATE()
    )`,

  // consulta para obtener todos los cortes de una noticia
  getCortesByNoticiaId: `SELECT 
        IDNoticia,
        CorteUrl,
        inicio,
        fin,
        Estado,
        CorteNumero,
        NombreCorte,
        DuracionSegundos,
        ArchivoGenerado,
        FechaCreacion,
        (fin - inicio) as DuracionCalculada
    FROM [Videoteca_dev].[dbo].[NoticiasVT] 
    WHERE IDNoticia = @noticiaId 
    ORDER BY CorteNumero ASC`,

  updateNoticiaConPrimerCorte: `UPDATE [AuditoriaRadioTelevision].[dbo].[Noticias] 
  SET [LinkStreaming] = @linkCorte, 
      [FlagCortado] = 'S'
  WHERE [NoticiaID] = @noticiaID`,


  checkExistingCortes: `SELECT COUNT(*) as TotalCortes 
    FROM [Videoteca_dev].[dbo].[NoticiasVT] 
    WHERE IDNoticia = @noticiaId`,

  //Creo la query de Temas y se coloca en el controlador notas.controller
  getNotasTemas:
    "SELECT b1.noticiaid, b1.medioid, b4.descripcion, b1.fechaalta, b6.descripcion " +
    "FROM [AuditoriaRadioTelevision].[dbo].[Noticias] as b1  " +
    "left join [7787_GlobalnewsV2].[dbo].[gnNoti_Medios] as b4  " +
    "on b1.medioid = b4.medioid " +
    "inner join [AuditoriaRadioTelevision].[dbo].[NoticiasTemasGenerales] as b5 " +
    "on b1.[NoticiaID] = b5.[NoticiaID] " +
    "inner join [AuditoriaRadioTelevision].[dbo].[TemasGenerales] as b6  " +
    "on b5.[TemaGeneralID] = b6.[TemaGeneralID] " +
    "where b5.[TemaGeneralID] in (1616) and b1.fechaalta > getdate()-1 order by fechaalta desc ",

  getNotasById:
    "SELECT b4.descripcion as nombre_del_medio," +
    "b1.medioid," +
    "b1.titulo," +
    "b1.aclaracion," +
    "b1.entrevistado," +
    "b1.linkstreaming," +
    "b1.noticiaid," +
    "b1.FechaInicio," +
    "b1.FechaFin," +
    "(SELECT COUNT(*) FROM [Videoteca_dev].[dbo].[NoticiasVT] WHERE IDNoticia = b1.noticiaid) as CantidadCortes," +
    "CASE WHEN (SELECT COUNT(*) FROM [Videoteca_dev].[dbo].[NoticiasVT] WHERE IDNoticia = b1.noticiaid) > 1 THEN 'S' ELSE 'N' END as TieneMultiplesCortes" +
    " FROM [AuditoriaRadioTelevision].[dbo].[Noticias] as b1" +
    " left join [7787_GlobalnewsV2].[dbo].[gnNoti_Medios] as b4" +
    " on b1.medioid = b4.medioid" +
    " where b1.noticiaid =  @id",

  getMencionById:
    "SELECT b1.[MencionID]  as id, " +
    "b1.[PalabraClave] " +
    "FROM [AuditoriaRadioTelevision].[dbo].[Menciones] as b1 " +
    "inner join [AuditoriaRadioTelevision].[dbo].[NoticiasMenciones] as b2 " +
    "on b1.mencionid  = b2.mencionid " +
    "where noticiaid = @id",

  getTemasGeneralesById:
    "SELECT b1.[TemaGeneralID] as id, " +
    "b2.[Descripcion] " +
    "FROM [AuditoriaRadioTelevision].[dbo].[NoticiasTemasGenerales] as b1 " +
    "inner join [AuditoriaRadioTelevision].[dbo].[TemasGenerales] as b2 " +
    "on b1.temageneralid = b2.temageneralid " +
    "where noticiaid = @id",

  getCoberturaId:
    "SELECT b2.[CoberturaID] as id," +
    "b1.[Nombre] " +
    "FROM [AuditoriaRadioTelevision].[dbo].[Coberturas] as b1 " +
    "inner join [AuditoriaRadioTelevision].[dbo].[NoticiasCoberturas] as b2 " +
    "on b1.coberturaid = b2.coberturaid " +
    "where noticiaid = @id ",

  getMencion:
    "SELECT [MencionID]  as id" +
    ",[PalabraClave]" +
    " FROM [AuditoriaRadioTelevision].[dbo].[Menciones] " +
    "where [MencionID] IN (306,307,8327,8328,8326,8348,8349,8350,8351,8352,8353,8354,8355,8356,8357,8373)",

  getCobertura:
    "SELECT CoberturaID  as id,Nombre " +
    "from [AuditoriaRadioTelevision].[dbo].[Coberturas] as b2 " +
    "where CoberturaID IN (1,3,4,5)",

  getTemasGenerales:
    "SELECT TemaGeneralID as id,Descripcion " +
    "from [AuditoriaRadioTelevision].[dbo].[TemasGenerales]  " +
    "where TemaGeneralID IN (85,139,453,175)",
  getTrancriptions: "SELECT IdRegistro,idMedio,NombreMedio,FechaCorte,Texto,LinkStreamming FROM [Videoteca_dev].[dbo].[dev_voicetotext] where NombreMedio = @name and idMedio=@id",

  getTrancriptionsToday: `SELECT 
    IdRegistro,
    idMedio,
    NombreMedio,
    FechaCorte,
    Texto,
    LinkStreamming,
    CONVERT(varchar, FechaCorte, 120) as FechaCorteFormatted,
    CAST(FechaCorte AS DATE) as FechaCorteDate,
    CAST(FechaCorte AS TIME) as HoraCorte,
    LEN(Texto) as LongitudTexto
  FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
  WHERE CAST(FechaCorte AS DATE) = CAST(GETDATE() AS DATE)
  ORDER BY FechaCorte DESC`,

  // Nueva consulta para transcripciones rango de fechas
  getTrancriptionsByRange: `SELECT 
    IdRegistro,
    idMedio,
    NombreMedio,
    FechaCorte,
    Texto,
    LinkStreamming,
    CONVERT(varchar, FechaCorte, 120) as FechaCorteFormatted,
    CAST(FechaCorte AS DATE) as FechaCorteDate,
    CAST(FechaCorte AS TIME) as HoraCorte,
    LEN(Texto) as LongitudTexto
  FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
  WHERE CAST(FechaCorte AS DATE) >= @fechaInicio 
    AND CAST(FechaCorte AS DATE) <= @fechaFin
  ORDER BY FechaCorte DESC`,

  getPalabras: "SELECT TOP (1000) [palabra],[cercaDe] FROM [Videoteca_dev].[dbo].[palabrasClaveVT]",

  getMediaCuts: `SELECT NombreMedio, FechaCorte 
FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
WHERE idMedio = @id 
  AND FechaCorte >= @fechaCorte 
  AND FechaCorte < DATEADD(day, 1, @fechaCorte)
ORDER BY FechaCorte DESC`,

  // query obtener detalles completos de cortes de medios
  getMediaCutsDetailed: `SELECT 
    IdRegistro,
    idMedio,
    NombreMedio,
    FechaCorte,
    Texto,
    LinkStreamming,
    LEN(Texto) as LongitudTexto,
    CONVERT(varchar, FechaCorte, 120) as FechaCorteFormatted
FROM [Videoteca_dev].[dbo].[dev_voicetotext] 
WHERE idMedio = @id 
  AND FechaCorte >= @fechaCorte 
  AND FechaCorte < DATEADD(day, 1, @fechaCorte)
ORDER BY FechaCorte DESC`,

  InsertMencion:
    "INSERT INTO [dbo].[NoticiasMenciones]" +
    " ([NoticiaID] ,[MencionID],[FechaAlta],[UserID])" +
    " VALUES (@id,@mension,@fechaAlta,'3589A936-C7F8-4F6F-BA7E-5876D9BC4959')",

  InsertCobertura:
    "INSERT INTO [dbo].[NoticiasCoberturas]" +
    " ([NoticiaID] ,[CoberturaID],[FechaAlta])" +
    " VALUES (@id,@cobertura,@fechaAlta)",

  InsertTema:
    "INSERT INTO [dbo].[NoticiasTemasGenerales]" +
    " ([NoticiaID] ,[TemaGeneralID],[FechaAlta],[UserID])" +
    " VALUES (@id,@tema,@fechaAlta,'3589A936-C7F8-4F6F-BA7E-5876D9BC4959')",

  InsertNota: "INSERT INTO [AuditoriaRadioTelevision].[dbo].[Noticias]" +
    " ([Aclaracion],[Entrevistado],[MedioID],[ProgramaID],[Conductores],[TipoNoticiaID],[Titulo],[TipoTonoID],[FechaInicio],[FechaFin],[Duracion],[FechaTransmitido],[UserID],[FlagCortado],[FlagProcesado] ,[AVE_opcion],[ClavesClasificacion]) "
    + "values (@aclaracion,@entrevistado,@medio,@programa,@conductores,1,@titulo,5,@fechaInicio,@fechaFin,@duracion,@fechaTransmitido,@userid,'N','S',1,'')"
    + " SELECT SCOPE_IDENTITY() AS id",

  deleteMencion:
    " DELETE [AuditoriaRadioTelevision].[dbo].[NoticiasMenciones] WHERE [MencionID] IN(@MensionDelete) and [NoticiaID]=@id",

  deleteCobertura:
    " DELETE [AuditoriaRadioTelevision].[dbo].[NoticiasCoberturas] WHERE [CoberturaID] IN(@CoberturaDelete) and [NoticiaID]=@id",

  deleteTema:
    " DELETE [AuditoriaRadioTelevision].[dbo].[NoticiasTemasGenerales] WHERE [TemaGeneralID] IN(@TemaDelete) and [NoticiaID]=@id",

  // Nueva consulta para eliminar cortes específicos
  deleteCortes:
    "DELETE FROM [Videoteca_dev].[dbo].[NoticiasVT] WHERE IDNoticia = @noticiaId AND CorteNumero IN (@cortesAEliminar)",

  selectTipos:
    "SELECT  [TipoNoticiaID],[Descripcion] FROM [AuditoriaRadioTelevision].[dbo].[TiposNoticia]",

  selectMedio:
    "SELECT [MedioID] as medioid,[Descripcion] as nombremedio FROM [7787_GlobalnewsV2].[dbo].[gnNoti_Medios] where [MedioID]  = @idmedio ",

  selectProgramas:
    "SELECT [ProgramaID],[Descripcion] FROM [7787_GlobalnewsV2].[dbo].[gnNoti_Programas] where [MedioID] =@id and [Activo] = 1 ",

  selectUser:
    "SELECT [UserId],[UserName] FROM [7787_GlobalnewsV2].[dbo].[aspnet_Users] WHERE UserName=@user",

  access:
    "SELECT [ID],[PaswordVT],[Role] FROM [Videoteca_dev].[dbo].[AccessVT] where PaswordVT = @pass",

  // actualizada para incluir información de cortes múltiples
  selectMyNotes:
    "SELECT top (1000)  base2.noticiaid, base2.titulo, base3.descripcion as [nombremedio], base2.fechaalta, " +
    "(SELECT COUNT(*) FROM [Videoteca_dev].[dbo].[NoticiasVT] WHERE IDNoticia = base2.noticiaid) as CantidadCortes, COUNT(base4.IDNoticia) as CortesGenerados " +
    "from [AuditoriaRadioTelevision].[dbo].[noticias]  as base2 " +
    "left join [7787_GlobalnewsV2].[dbo].[gnNoti_Medios] as base3 " +
    "on base2.medioid = base3.medioid " +
    "left join [videoteca_dev].[dbo].[NoticiasVT] as base4 " +
    "on base2.noticiaid=base4.IDNoticia " +
    "WHERE  base2.userid= @userid " +
    "GROUP BY base2.noticiaid, base2.titulo, base3.descripcion, base2.fechaalta " +
    "order by fechaalta desc",

  selectMyNotesDsk:
    `SELECT TOP (1000) base2.noticiaid, base2.titulo, base3.descripcion AS [nombremedio], base2.fechaalta,
  (SELECT COUNT(*) FROM [Videoteca_dev].[dbo].[NoticiasVT] WHERE IDNoticia = base2.noticiaid) as CantidadCortes, COUNT(base4.IDNoticia) as CortesGenerados
  FROM [AuditoriaRadioTelevision].[dbo].[noticias] AS base2 
  LEFT JOIN [7787_GlobalnewsV2].[dbo].[gnNoti_Medios] AS base3 ON base2.medioid = base3.medioid 
  LEFT JOIN [videoteca_dev].[dbo].[NoticiasVT] AS base4 ON base2.noticiaid = base4.IDNoticia
  WHERE base2.userid = @userid 
  GROUP BY base2.noticiaid, base2.titulo, base3.descripcion, base2.fechaalta
  HAVING COUNT(base4.IDNoticia) = 0 OR COUNT(base4.IDNoticia) < (SELECT COUNT(*) FROM [Videoteca_dev].[dbo].[NoticiasVT] WHERE IDNoticia = base2.noticiaid)
  ORDER BY base2.fechaalta DESC`,

  updateNoticia(campo) {
    const query = "UPDATE [AuditoriaRadioTelevision].[dbo].[Noticias]" +
      " SET " + campo + " = @valor" +
      " where [NoticiaID]=@id"
    return query;
  },

  updateFechaNoticia:
    "UPDATE [AuditoriaRadioTelevision].[dbo].[Noticias]" +
    " SET [FechaInicio] = @fechaInicio ,[FechaFin] = @fechaFin ,[Duracion] = @duracion ,[FlagCortado]='N'" +
    " where [NoticiaID]=@id",

  // Nueva consulta para actualizar el estado de un corte específico
  updateCorteEstado:
    "UPDATE [Videoteca_dev].[dbo].[NoticiasVT] SET Estado = @estado, ArchivoGenerado = @archivoGenerado WHERE IDNoticia = @noticiaId AND CorteNumero = @corteNumero",

  // Nueva consulta para obtener estadísticas de cortes
  getEstadisticasCortes: `SELECT 
    COUNT(*) as TotalCortes,
    SUM(CASE WHEN Estado = 'S' THEN 1 ELSE 0 END) as CortesExitosos,
    SUM(CASE WHEN Estado = 'E' THEN 1 ELSE 0 END) as CortesConError,
    SUM(CASE WHEN Estado = 'P' THEN 1 ELSE 0 END) as CortesPendientes,
    AVG(DuracionSegundos) as DuracionPromedio,
    SUM(DuracionSegundos) as DuracionTotal
  FROM [Videoteca_dev].[dbo].[NoticiasVT] 
  WHERE IDNoticia = @noticiaId`,

  // Nueva consulta para reprocesar cortes fallidos
  getCortesFallidos: `SELECT 
    IDNoticia,
    CorteNumero,
    NombreCorte,
    inicio,
    fin,
    CorteUrl,
    FechaCreacion
  FROM [Videoteca_dev].[dbo].[NoticiasVT] 
  WHERE Estado = 'E' 
  ORDER BY FechaCreacion DESC`,

  // Nueva consulta para fusionar cortes - obtener información de cortes para fusión
  getFusionCortes: `SELECT 
    CorteNumero,
    NombreCorte,
    inicio,
    fin,
    DuracionSegundos,
    Estado,
    ArchivoGenerado
  FROM [Videoteca_dev].[dbo].[NoticiasVT] 
  WHERE IDNoticia = @noticiaId AND CorteNumero IN (@corte1, @corte2)
  ORDER BY inicio ASC`,

  // Consulta para verificar solapamiento de cortes antes de fusionar
  verificarSolapamientoCortes: `SELECT 
    c1.CorteNumero as Corte1,
    c1.inicio as Inicio1,
    c1.fin as Fin1,
    c2.CorteNumero as Corte2,
    c2.inicio as Inicio2,
    c2.fin as Fin2,
    CASE 
      WHEN c1.fin >= c2.inicio AND c1.inicio <= c2.fin THEN 'Solapan'
      WHEN c1.fin < c2.inicio THEN 'Separados'
      ELSE 'Adyacentes'
    END as TipoRelacion,
    ABS(c1.fin - c2.inicio) as GapSegundos
  FROM [Videoteca_dev].[dbo].[NoticiasVT] c1
  CROSS JOIN [Videoteca_dev].[dbo].[NoticiasVT] c2
  WHERE c1.IDNoticia = @noticiaId 
    AND c2.IDNoticia = @noticiaId 
    AND c1.CorteNumero = @corte1 
    AND c2.CorteNumero = @corte2`,

  // Consulta para obtener contexto de cortes (anterior y posterior)
  getContextoCortes: `WITH CortesOrdenados AS (
    SELECT *, 
           LAG(CorteNumero) OVER (ORDER BY inicio) as CorteAnterior,
           LEAD(CorteNumero) OVER (ORDER BY inicio) as CortePosterior,
           LAG(fin) OVER (ORDER BY inicio) as FinAnterior,
           LEAD(inicio) OVER (ORDER BY inicio) as InicioPosterior
    FROM [Videoteca_dev].[dbo].[NoticiasVT] 
    WHERE IDNoticia = @noticiaId
  )
  SELECT *
  FROM CortesOrdenados 
  WHERE CorteNumero = @corteNumero`,

  // Actualizar consulta para eliminar cortes específicos antes de fusión
  eliminarCortesParaFusion: `DELETE FROM [Videoteca_dev].[dbo].[NoticiasVT] 
    WHERE IDNoticia = @noticiaId AND CorteNumero IN (@corte1, @corte2)`,

  // Consulta para obtener el siguiente número de corte disponible
  getSiguienteNumeroCorte: `SELECT ISNULL(MAX(CorteNumero), 0) + 1 as SiguienteCorte 
    FROM [Videoteca_dev].[dbo].[NoticiasVT] 
    WHERE IDNoticia = @noticiaId`,

  verificarIntegridadCortes: `SELECT 
  n.NoticiaID,
  n.Titulo,
  (SELECT COUNT(*) FROM [Videoteca_dev].[dbo].[NoticiasVT] WHERE IDNoticia = n.NoticiaID) as CortesEsperados,
  COUNT(nv.IDNoticia) as CortesReales,
  CASE 
    WHEN (SELECT COUNT(*) FROM [Videoteca_dev].[dbo].[NoticiasVT] WHERE IDNoticia = n.NoticiaID) = COUNT(nv.IDNoticia) THEN 'Completo'
    WHEN COUNT(nv.IDNoticia) = 0 THEN 'Sin cortes'
    WHEN (SELECT COUNT(*) FROM [Videoteca_dev].[dbo].[NoticiasVT] WHERE IDNoticia = n.NoticiaID) > COUNT(nv.IDNoticia) THEN 'Incompleto'
    ELSE 'Excedido'
  END as EstadoIntegridad
FROM [AuditoriaRadioTelevision].[dbo].[Noticias] n
LEFT JOIN [Videoteca_dev].[dbo].[NoticiasVT] nv ON n.NoticiaID = nv.IDNoticia
WHERE n.NoticiaID = @noticiaId
GROUP BY n.NoticiaID, n.Titulo`,

};