export const querys = {
  getmediosvt:
    "SELECT IDMedio , NombreMedio  FROM [videoteca_dev].[dbo].[MediosVT]",
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
    "b1.FechaFin" +
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
  getPalabras: "SELECT TOP (1000) [palabra],[cercaDe] FROM [Videoteca_dev].[dbo].[palabrasClaveVT]",
  getMediaCuts: "SELECT  NombreMedio,FechaCorte FROM [Videoteca_dev].[dbo].[dev_voicetotext] WHERE idMedio = @id AND CONVERT(varchar, FechaCorte, 23) = @fechaCorte ORDER BY FechaCorte DESC",
  // getCut:"SELECT id,  FROM [Videoteca_dev].[dbo].[dev_voicetotext] WHERE NombreMedio = @nombreCorte",
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
    + "values (@aclaracion,@entrevistado,@medio,@programa,@conductores,1,@titulo,5,@fechaInicio,@fechaFin,@duracion,NULL,@userid,'S','S',1,'')"
    + " SELECT SCOPE_IDENTITY() AS id",
  deleteMencion:
    " DELETE [AuditoriaRadioTelevision].[dbo].[NoticiasMenciones] WHERE [MencionID] IN(@MensionDelete) and [NoticiaID]=@id",
  deleteCobertura:
    " DELETE [AuditoriaRadioTelevision].[dbo].[NoticiasCoberturas] WHERE [CoberturaID] IN(@CoberturaDelete) and [NoticiaID]=@id",
  deleteTema:
    " DELETE [AuditoriaRadioTelevision].[dbo].[NoticiasTemasGenerales] WHERE [TemaGeneralID] IN(@TemaDelete) and [NoticiaID]=@id",

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

  selectMyNotes:
    "SELECT top (1000)  base2.noticiaid, base2.titulo, base3.descripcion as [nombremedio], base2.fechaalta " +
    "from [AuditoriaRadioTelevision].[dbo].[noticias]  as base2 " +
    "left join [7787_GlobalnewsV2].[dbo].[gnNoti_Medios] as base3 " +
    "on base2.medioid = base3.medioid " +
    "inner join [videoteca_dev].[dbo].[NoticiasVT] as base4 " +
    "on base2.noticiaid=base4.IDNoticia " +
    "WHERE  base2.userid= @userid " +
    "order by fechaalta desc",
  selectMyNotesDsk:
    `SELECT TOP (1000) base2.noticiaid, base2.titulo, base3.descripcion AS [nombremedio], base2.fechaalta 
    FROM [AuditoriaRadioTelevision].[dbo].[noticias] AS base2 
    LEFT JOIN [7787_GlobalnewsV2].[dbo].[gnNoti_Medios] AS base3 ON base2.medioid = base3.medioid 
    LEFT JOIN [videoteca_dev].[dbo].[NoticiasVT] AS base4 ON base2.noticiaid = base4.IDNoticia
    WHERE base2.userid = @userid AND base4.IDNoticia IS NULL
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
    " where [NoticiaID]=@id"
};



  // getProducById: "SELECT * FROM Products Where Id = @Id",
  // addNewProduct:    "INSERT INTO [webstore].[dbo].[Products] (name, description, quantity) VALUES (@name,@description,@quantity);",
  //deleteProduct: "DELETE FROM [webstore].[dbo].[Products] WHERE Id= @Id",
  //getTotalProducts: "SELECT COUNT(*) FROM webstore.dbo.Products",
  //updateProductById:  "UPDATE [webstore].[dbo].[Products] SET Name = @name, Description = @description, Quantity = @quantity WHERE Id = @id",
