import axios from "axios";
//llamo variables de entorno

const API_URL =  process.env.REACT_APP_API_URL
const API_AVWEB =  process.env.REACT_APP_API_AVWEB
class Conexion {



  signin = async (nombreUsuario, password) => {
    try {
      const response = await axios.post(API_URL+"login", { nombreUsuario, password });
      localStorage.setItem("user", JSON.stringify(response.data));
      console.log("error 2" + response.data);
      return response.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  mediosvt = async () => {
    try {
      const response = await axios.get(API_URL+"mediosvt", {});
      return response.data;
    } catch (err) {
      console.log(err);
    }
  }

  mynotes = async (userid) => {
    try {
      const response = await axios.post(API_URL+"mynotes", {
        userid
      });
      return response.data;
    } catch (err) {
      console.log(err);
    }
  }

  mynotesdsk = async (userid) => {
    try {
      const response = await axios.get(API_URL+"mynotesdsk/"+ userid, {}); 
      return response.data;
    } catch (err) {
      console.log(err);
    }
  }

  nota = async (nombreCorte) => {
    try {
      const response = await axios.post(API_URL+"media/", {
        nombreCorte
      });
      return response.data;
    } catch (err) {
      console.log(err);
    }
  }

  transcripcion = async (id,nombre) => {
    try {
      const response = await axios.post(API_URL+"transcriptions/" + id, {
        nombre
      });
      return response.data;
    } catch (err) {
      console.log(err);
    }
  }
  //Creo una peticion que traera la data de el backend por la url de la api creada 
  notasTemas = async () => {
    try {
      const response = await axios.get(API_URL+"getNotasTemas", {});
      return response.data;
    } catch (err) {
      console.log(err);
    }
  }

  palabras = async () => {
    try {
      const response = await axios.get(API_URL+"palabras", {});
      return response.data;
    } catch (err) {
      console.log(err);
    }
  }


  cortesMedio = async (id, fechaCorte) => {
    try {
      const response = await axios.post(API_URL+"cortesMedio/" + id, {
        fechaCorte
      });
      return response.data;
    } catch (err) {
      console.log(err);
    }
  }

  notaById = async (id) => {
    try {
      const response = await axios.get(API_URL+"nota/" + id, {});
      return response.data;
    } catch (err) {
      console.log(err);
    }

  }


  tipos = async (id) => {
    try {
      const response = await axios.get(API_URL+"tipos/", {});
      return response.data;
    } catch (err) {
      console.log(err);
    }

  }

  getMedios = async () => {
    try {
      const response = await axios.get(API_AVWEB+"/medios/", {});
      return response.data;
    } catch (err) {
      console.log(err);
    }
  }

  medio = async (id) => {
    try {
      const response = await axios.get(API_URL+"medio/" + id, {});
      return response.data;
    } catch (err) {
      console.log(err);
    }

  };

  Programas = async (id) => {
    try {
      const response = await axios.get(API_URL+"programas/" + id, {});
      return response.data;
    } catch (err) {
      console.log(err);
    }

  };

  tabla = async (rutas) => {
    try {
      const response = await axios.get(API_URL+"" + rutas, {});
      return response.data;
    } catch (err) {
      console.log(err);
    }

  }
  tablaById = async (id, rutas) => {
    try {
      const response = await axios.get(API_URL+"" + rutas + "/" + id, {});
      return response.data;
    } catch (err) {
      console.log(err);
    }

  }

  

  insertSinMarcar = (id, agregarID, fechaAlta, ruta) => {
    return axios.post(
      API_URL+"" + ruta + "/" + id, {

      agregarID,
      fechaAlta

    },



    );
  }

  updateNoticia = (id, campo, valor,) => {
    return axios.post(
      API_URL+"actualizarnota/" + id, {

      campo,
      valor

    },



    );
  }

  InserNoticia = (aclaracion, entrevistado, fechaInicio, fechaFin, duracion, medioid, programaid, fechaTransmitido, conductores, tiponoticiaid, tipotonoid, titulo,userid,mediaUrl,startTime,endTime) => {
    return axios.post(
      API_URL+"insertnota/", {

      aclaracion,
      entrevistado,
      fechaInicio,
      fechaFin,
      duracion,
      medioid,
      programaid,
      fechaTransmitido,
      conductores,
      conductores,
      tipotonoid,
      tiponoticiaid,
      titulo,
      userid,
      mediaUrl,
      startTime,
      endTime


    },
    );
  }

  cutNews = (name, url, start, end) => {
    return axios.post(" http://192.168.1.198:5000/api/convert", {
      name,
      url,
      start,
      end,
    }
    )
  }

  updateFechaNoticia = (id, fechaInicio, fechaFin, duracion) => {
    return axios.post(
      API_URL+"actualizarfechanota/" + id, {

      fechaInicio,
      fechaFin,
      duracion
    },


    );
  }

  subirArchivo =async (data) => {
    
    return axios.post(API_URL+"upload",
    data
  );
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }



}
export default new Conexion();