// src/utilities/Conexion.js - Versión corregida

import axios from "axios";
import Swal from "sweetalert2";

const API_URL = process.env.REACT_APP_API_URL
const API_AVWEB = process.env.REACT_APP_API_AVWEB
const API_IA = process.env.REACT_APP_PYTHON_API_URL
class Conexion {
  constructor() {
    this.baseURL = API_URL;
    this.token = null;
  }

  getToken() {
    const user = this.getCurrentUser();
    return user ? user.token : null;
  }

  signin = async (nombreUsuario, password) => {
    try {
      const response = await axios.post(API_URL + "login", { nombreUsuario, password });
      localStorage.setItem("user", JSON.stringify(response.data));
      this.token = response.data.token;
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  mediosvt = async () => {
    try {
      const response = await axios.get(API_URL + "mediosvt", {});
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }

  mynotes = async (userid) => {
    try {
      const response = await axios.post(API_URL + "mynotes", { userid });
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }

  mynotesdsk = async (userid) => {
    try {
      const response = await axios.get(API_URL + "mynotesdsk/" + userid, {});
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }

  nota = async (nombreCorte) => {
    try {
      const response = await axios.post(API_URL + "media", { nombreCorte });
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }

  transcripcion = async (id, nombre) => {
    try {
      const response = await axios.post(API_URL + "transcriptions/" + id, { nombre });
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }

  notasTemas = async () => {
    try {
      const response = await axios.get(API_URL + "getNotasTemas", {});
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }

  palabras = async () => {
    try {
      const response = await axios.get(API_URL + "palabras", {});
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }

  cortesMedioAll = async (idmedio, fechaCorte) => {
    try {
      console.log('Conexion.cortesMedioAll - Parámetros:', { idmedio, fechaCorte });

      const response = await axios.post(API_URL + "cortesMedioAll/" + idmedio, {
        fechaCorte
      });

      // ✅ SINTAXIS COMPATIBLE - sin optional chaining
      const cantidadCortes = response.data && response.data.length ? response.data.length : 0;
      console.log('Conexion.cortesMedioAll - Respuesta:', cantidadCortes, 'cortes');

      return response.data || [];
    } catch (err) {
      console.error("Error en Conexion.cortesMedioAll:", err.response ? err.response.data : err.message);
      // Retornar array vacío en lugar de throw para que no rompa el flujo
      return [];
    }
  }

  // Agregar esta función a tu clase Conexion

  /**
   * Consultar el estado de procesamiento de cortes de una o varias noticias
   */
  getEstadoCortes = async (noticiasIds) => {
    try {
      const idsString = Array.isArray(noticiasIds) ? noticiasIds.join(',') : noticiasIds;

      const response = await fetch(`${this.baseURL}/api/estado-cortes?noticiasIds=${idsString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return { data };

    } catch (error) {
      console.error('Error consultando estado de cortes:', error);
      throw error;
    }
  }

  /**
   * Obtener logs de procesamiento de cortes
   */
  getLogsCortes = async (noticiasIds, limite = 10) => {
    try {
      const idsString = Array.isArray(noticiasIds) ? noticiasIds.join(',') : noticiasIds;

      const response = await fetch(`${this.baseURL}/api/logs-cortes?noticiasIds=${idsString}&limite=${limite}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return { data };

    } catch (error) {
      console.error('Error consultando logs de cortes:', error);
      throw error;
    }
  }

  cortesMedio = async (idmedio, fechaCorte, currentNoteId) => {
    try {
      console.log('Conexion.cortesMedio - Parámetros:', { idmedio, fechaCorte, currentNoteId });

      const response = await axios.post(API_URL + "cortesMedio/" + idmedio, {
        fechaCorte,
        currentNoteId
      });

      console.log('Conexion.cortesMedio - Respuesta:', response.data);
      return response.data;
    } catch (err) {
      console.error("Error en Conexion.cortesMedio:", err.response ? err.response.data : err.message);
      throw err;
    }
  }

  /**
   * Buscar corte específico por nombre o ID
   */
  buscarCorte = async (idMedio, nombreArchivo) => {
    try {
      const response = await axios.get(`${API_URL}corte/buscar/${idMedio}/${nombreArchivo}`);
      return response.data;
    } catch (err) {
      console.error("Error en buscarCorte:", err);
      throw err;
    }
  }

  /**
   * Obtener rango de cortes entre dos puntos
   */
  obtenerRangoCortes = async (idMedio, corteInicioId, corteFinId) => {
    try {
      const response = await axios.post(`${API_URL}cortes/rango`, {
        idMedio,
        corteInicioId,
        corteFinId
      });
      return response.data;
    } catch (err) {
      console.error("Error en obtenerRangoCortes:", err);
      throw err;
    }
  }

  /**
   * Validar coherencia temporal entre cortes
   */
  validarCoherenciaCortes = async (corteInicio, corteFin, tiempoInicio, tiempoFin) => {
    try {
      const response = await axios.post(`${API_URL}cortes/validar-coherencia`, {
        corteInicio,
        corteFin,
        tiempoInicio,
        tiempoFin
      });
      return response.data;
    } catch (err) {
      console.error("Error en validarCoherenciaCortes:", err);
      throw err;
    }
  }

  notaById = async (id) => {
    try {
      const response = await axios.get(API_URL + "nota/" + id, {});
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }

  tipos = async () => {
    try {
      const response = await axios.get(API_URL + "tipos/");
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }

  getMedios = async () => {
    try {
      const response = await axios.get(API_AVWEB + "/medios/");
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }

  medio = async (id) => {
    try {
      const response = await axios.get(API_URL + "medio/" + id, {});
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }

  Programas = async (id) => {
    try {
      const response = await axios.get(API_URL + "programas/" + id, {});
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }

  tabla = async (rutas) => {
    try {
      const response = await axios.get(API_URL + "" + rutas, {});
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }

  tablaById = async (id, rutas) => {
    try {
      const response = await axios.get(API_URL + "" + rutas + "/" + id, {});
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }

  insertSinMarcar = (id, agregarID, fechaAlta, ruta) => {
    return axios.post(API_URL + "" + ruta + "/" + id, { agregarID, fechaAlta });
  }

  updateNoticia = (id, campo, valor) => {
    return axios.post(API_URL + "actualizarnota/" + id, { campo, valor });
  }

  InserNoticia = (aclaracion, entrevistado, fechaInicio, fechaFin, duracion, medioid, programaid, fechaTransmitido, conductores, tiponoticiaid, tipotonoid, titulo, userid, mediaUrl, startTime, endTime) => {
    return axios.post(API_URL + "insertnota/", {
      aclaracion, entrevistado, fechaInicio, fechaFin, duracion, medioid, programaid,
      fechaTransmitido, conductores, tipotonoid, tiponoticiaid, titulo, userid, mediaUrl, startTime, endTime
    });
  }

  /**
   * *** CONVERTIDO A MÉTODO DE INSTANCIA ***
   * Insertar noticia que abarca múltiples cortes
   */
  InserNoticiaTresCortes = async (datos) => {
    try {
      console.log('InserNoticiaTresCortes - Enviando datos:', datos);

      const response = await axios.post(`${this.baseURL}cortador/tres-cortes`, datos, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('InserNoticiaTresCortes - Respuesta exitosa:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error en InserNoticiaTresCortes (Conexion.js):', error);
      throw error;
    }
  }

  /**
   * Insertar noticia simple (un solo corte) - NUEVA FUNCIÓN MEJORADA
   */
  InserNoticiaSencilla = async (datosNoticia) => {
    try {
      console.log('InserNoticiaSencilla - Enviando datos:', datosNoticia);

      const response = await this.InserNoticia(
        datosNoticia.aclaracion,
        datosNoticia.entrevistado,
        datosNoticia.fechaInicial,
        datosNoticia.fechaFinal,
        datosNoticia.duracion,
        datosNoticia.medioid,
        datosNoticia.programaid,
        datosNoticia.fechaTransmitido,
        datosNoticia.conductores,
        datosNoticia.tiponoticiaid,
        datosNoticia.tipotonoid,
        datosNoticia.titulo,
        datosNoticia.userid,
        datosNoticia.mediaUrl,
        datosNoticia.startTime,
        datosNoticia.endTime
      );

      // Insertar temas y coberturas asociadas
      const notaId = response.data.id;
      const promesas = [];

      if (datosNoticia.temas && datosNoticia.temas.length > 0) {
        promesas.push(
          this.insertSinMarcar(notaId, datosNoticia.temas, datosNoticia.fechaAlta, "tema")
        );
      }

      if (datosNoticia.coberturas && datosNoticia.coberturas.length > 0) {
        promesas.push(
          this.insertSinMarcar(notaId, datosNoticia.coberturas, datosNoticia.fechaAlta, "cobertura")
        );
      }

      // Esperar a que se completen todas las inserciones
      if (promesas.length > 0) {
        await Promise.all(promesas);
      }

      console.log('InserNoticiaSencilla - Completado exitosamente para nota:', notaId);
      return response;

    } catch (error) {
      console.error('Error en InserNoticiaSencilla:', error);
      throw error;
    }
  }

  // ELIMINAR MÉTODO DUPLICADO - Solo mantener uno
  obtenerContextoNavegacion = async (idmedio, idRegistroCorte) => {
    try {
      console.log('obtenerContextoNavegacion - Parámetros:', { idmedio, idRegistroCorte });

      const response = await axios.get(`${this.baseURL}corte/contexto/${idmedio}/${idRegistroCorte}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener contexto de navegación:', error);
      throw error;
    }
  }

  getEstadoCortes = async (noticiasIds) => {
    try {
      const idsString = Array.isArray(noticiasIds) ? noticiasIds.join(',') : noticiasIds;
      const response = await axios.get(`${this.baseURL}cortador/estado-cortes?noticiasIds=${idsString}`, {
        headers: { 'Authorization': `Bearer ${this.getToken()}` }
      });
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.data;
    } catch (error) {
      console.error('Error en getEstadoCortes (Conexion.js):', error);
      throw error;
    }
  }

  getLogsCortes = async (noticiasIds) => {
    try {
      const idsString = Array.isArray(noticiasIds) ? noticiasIds.join(',') : noticiasIds;
      const response = await axios.get(`${this.baseURL}cortador/logs-cortes?noticiasIds=${idsString}`, {
        headers: { 'Authorization': `Bearer ${this.getToken()}` }
      });
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.data;
    } catch (error) {
      console.error('Error en getLogsCortes (Conexion.js):', error);
      throw error;
    }
  }

  verificarProgresoCortes = async (noticiasIds, intervalo = 5000) => {
    return new Promise((resolve, reject) => {
      const verificar = async () => {
        try {
          const estado = await this.getEstadoCortes(noticiasIds);
          const todosProcesados = estado.cortes.every(corte => corte.procesado);

          if (todosProcesados) {
            resolve(estado);
          } else {
            setTimeout(verificar, intervalo);
          }
        } catch (error) {
          reject(error);
        }
      };
      verificar();
    });
  }

  captureFormImage = async (blob, notaId, nombreCorte) => {
    const formData = new FormData();
    formData.append('image', blob, `${nombreCorte}-${notaId}.png`);
    try {
      const response = await axios.post(`${API_URL}media/capture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${this.getToken()}`
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading capture image:', error);
      throw error;
    }
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  // Corrección 1: En Conexion.js - Agregar el método que falta
  getContextoNavegacionCorte = async (idmedio, idRegistroCorte) => {
    try {
      console.log('getContextoNavegacionCorte - Parámetros:', { idmedio, idRegistroCorte });

      const response = await axios.get(`${this.baseURL}corte/contexto/${idmedio}/${idRegistroCorte}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener contexto de navegación:', error);
      throw error;
    }
  }

  // Corrección 2: En Noticia.js - Función navegarCortePosterior corregida
  navegarCortePosterior = async () => {
    if (!this.state.cortePosterior) {
      Swal.fire({
        icon: 'info',
        title: 'No hay corte posterior',
        text: 'Este es el último corte del día',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }

    try {
      // CORRECCIÓN: usar getContextoNavegacionCorte en lugar de obtenerContextoNavegacion
      const nuevoContexto = await Conexion.getContextoNavegacionCorte(
        this.state.idmedio,
        this.state.cortePosterior.IdRegistro
      );

      // Actualizar estado con la respuesta
      this.setState({
        corteActual: this.state.cortePosterior,  // El posterior se convierte en actual
        corteAnterior: nuevoContexto.anterior || null,
        cortePosterior: nuevoContexto.posterior || null
      });

      // Cargar el nuevo corte
      await this.cargarCorte(this.state.cortePosterior);

    } catch (error) {
      console.error('Error al navegar al corte posterior:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el corte posterior'
      });
    }
  }

  // Agregar este método a la clase Conexion en utilities/Conexion.js

  /**
   * Mejorar texto usando la API de corrección de Python
   */
  mejorarTexto = async (texto) => {
    try {
      console.log('Enviando texto para mejora:', texto);

      // URL de la API de Python (ajustar según tu configuración)

      const response = await axios.post(`${API_IA}/correct-text`, {
        text: texto
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos de timeout
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Texto mejorado exitosamente:', response.data);
      return response.data;

    } catch (error) {
      console.error('Error al mejorar texto:', error);

      // Manejar diferentes tipos de errores
      if (error.code === 'ECONNREFUSED') {
        throw new Error('No se pudo conectar con el servicio de mejora de texto. Verifique que esté ejecutándose.');
      } else if (error.code === 'ENOTFOUND') {
        throw new Error('Servicio de mejora de texto no encontrado.');
      } else if (error.response) {
        const errorMessage = error.response.data && error.response.data.error
          ? error.response.data.error
          : 'Error del servidor de mejora de texto';
        throw new Error(errorMessage);
      } else {
        throw new Error('Error de red al conectar con el servicio de mejora de texto');
      }
    }
  }

  // Corrección 3: También corregir navegarCorteAnterior para consistencia
  navegarCorteAnterior = async () => {
    if (!this.state.corteAnterior) {
      Swal.fire({
        icon: 'info',
        title: 'No hay corte anterior',
        text: 'Este es el primer corte del día',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }

    try {
      // CORRECCIÓN: usar getContextoNavegacionCorte
      const nuevoContexto = await Conexion.getContextoNavegacionCorte(
        this.state.idmedio,
        this.state.corteAnterior.IdRegistro
      );

      // Actualizar estado con la respuesta
      this.setState({
        corteActual: this.state.corteAnterior,  // El anterior se convierte en actual
        corteAnterior: nuevoContexto.anterior || null,
        cortePosterior: nuevoContexto.posterior || null
      });

      // Cargar el nuevo corte
      await this.cargarCorte(this.state.corteAnterior);

    } catch (error) {
      console.error('Error al navegar al corte anterior:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el corte anterior'
      });
    }
  }
}

export default new Conexion();