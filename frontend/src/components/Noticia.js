import React, { Component } from 'react'
import "../assets/noticia.css"
import { Link, withRouter } from 'react-router-dom';
import Conexion from '../utilities/Conexion';
import Swal from 'sweetalert2';
import moment from 'moment';
import SelectionList from './statics/SelectionList';
import OffCanvas from './OffCanvas';
import html2canvas from 'html2canvas';

class Noticia extends Component {
    constructor(props) {
        super(props);
        this.state = {
            finMarcado: false,
            inicioMarcado: false,
            userid: "",
            secondsfoStart: null,
            secondsfoEnd: null,
            fechastart: null,
            fechaend: null,
            transcripcion: "",
            idnotatranscript: "",
            fechaCorte: "",
            fechaCortes: "",
            start: null,
            end: null,
            duration: 0,
            currentTime: 0,
            corte: "",
            fechaInicial: "",
            fechaFinal: "",
            programaid: "",
            idmedio: "",
            titulo: "",
            tipos: [],
            nombre_del_medio: "",
            entrevistado: "",
            aclaracion: "",
            programas: [],
            tiponoticiaid: "",
            tipotonoid: "",
            listatrancript: [],
            listaTime: [],
            isChecked: "true",
            temasGenerales: [],
            medio: [],
            coberturas: [],
            conductores: "",
            palabras: [],
            cortesMedio: [],
            insertTemas: [],
            insertCoberuras: [],
            misCoberturas: [],
            misTemasGenerales: [],
            checkedItems: new Map(),

            corteActual: null,
            corteAnterior: null,
            cortePosterior: null,
            indiceCorteActual: 0,
            corteInicio: null, // En qué corte está el inicio
            corteFin: null,   // En qué corte está el fin
            tiempoInicioGlobal: null, // Tiempo de inicio en el primer corte
            tiempoFinGlobal: null,    // Tiempo de fin en el último corte
            esCorteFucionado: false,  // Si la nota abarca múltiples cortes
            busqueda: "",

            // VARIABLES PARA LIMITAR NAVEGACIÓN
            corteInicialAnterior: null,
            corteInicialActual: null,
            corteInicialPosterior: null
        };

        this.handleModificacionFechaStart = this.handleModificacionFechaStart.bind(this);
        this.handleModificacionFechaEnd = this.handleModificacionFechaEnd.bind(this);
        this.videoRef = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.inputHandleChange = this.inputHandleChange.bind(this);
    }

    // Función para extraer la hora del nombre del archivo
    extraerHoraDeNombre = (nombreArchivo) => {
        // Formato esperado: 2759720250702_194500
        // Los últimos 6 dígitos son HHMMSS
        const regex = /(\d{2})(\d{2})(\d{2})$/;
        const match = nombreArchivo.match(regex);

        if (match) {
            const hora = match[1];
            const minuto = match[2];
            const segundo = match[3];
            return `${hora}:${minuto}:${segundo}`;
        }

        return null;
    }

    timeToSeconds(time) {
        const [hours, minutes, seconds] = time.split(":").map(parseFloat);
        return hours * 3600 + minutes * 60 + seconds;
    }

    formatTime(seconds) {
        let minutes = Math.floor(seconds / 60);
        let secondsRemainder = seconds % 60;
        let formattedTime = minutes.toString().padStart(2, '0') + ':' + secondsRemainder.toString().padStart(2, '0');
        return formattedTime;
    }

    addseconds = (seconds) => {
        const date = new Date(this.state.fechaCorte);
        date.setSeconds(date.getSeconds() + seconds);
        const fechajs = date.toLocaleString().replace(/\//g, '-');
        const fecha = moment(fechajs, 'D-M-YYYY, h:mm:ss a');
        const formattedDate = fecha.format('YYYY-MM-DD HH:mm:ss');
        return formattedDate;
    }

    navegarCorteAnterior = async () => {
        // Navegar al corte inicial anterior (siempre disponible)
        if (!this.state.corteInicialAnterior) {
            return;
        }

        try {
            this.setState({
                corteActual: this.state.corteInicialAnterior,
                corteAnterior: this.state.corteInicialAnterior,
                cortePosterior: this.state.corteInicialPosterior
            });

            await this.cargarCorte(this.state.corteInicialAnterior);

        } catch (error) {
            console.error('Error al navegar al corte anterior:', error);
        }
    }

    navegarCorteActualInicial = async () => {
        // Navegar al corte inicial (siempre disponible)
        if (!this.state.corteInicialActual) {
            return;
        }

        try {
            this.setState({
                corteActual: this.state.corteInicialActual,
                corteAnterior: this.state.corteInicialAnterior,
                cortePosterior: this.state.corteInicialPosterior
            });

            await this.cargarCorte(this.state.corteInicialActual);

        } catch (error) {
            console.error('Error al navegar al corte inicial:', error);
        }
    }

    navegarCortePosterior = async () => {
        // Navegar al corte inicial posterior (siempre disponible)
        if (!this.state.corteInicialPosterior) {
            return;
        }

        try {
            this.setState({
                corteActual: this.state.corteInicialPosterior,
                corteAnterior: this.state.corteInicialAnterior,
                cortePosterior: this.state.corteInicialPosterior
            });

            await this.cargarCorte(this.state.corteInicialPosterior);

        } catch (error) {
            console.error('Error al navegar al corte posterior:', error);
        }
    }

    // Método auxiliar para obtener solo el corte inmediatamente anterior
    obtenerCorteAnterior = async (corteActualId) => {
        try {
            const contexto = await Conexion.getContextoNavegacionCorte(
                this.state.idmedio,
                corteActualId
            );
            return contexto.anterior || null;
        } catch (error) {
            console.error('Error al obtener corte anterior:', error);
            return null;
        }
    }

    // Método auxiliar para obtener solo el corte inmediatamente posterior
    obtenerCortePosterior = async (corteActualId) => {
        try {
            const contexto = await Conexion.obtenerContextoNavegacion(
                this.state.idmedio,
                corteActualId
            );
            return contexto.posterior || null;
        } catch (error) {
            console.error('Error al obtener corte posterior:', error);
            return null;
        }
    }

    cargarCorte = async (corte) => {
        try {
            console.log('Cargando corte:', corte);

            this.setState({
                corteActual: corte,
                idnotatranscript: corte.NombreMedio,
                fechaCorte: corte.FechaCorte,
                transcripcion: { LinkStreamming: corte.LinkStreamming },
                // NO limpiar selecciones de tiempo al cambiar de corte para permitir notas multi-corte
                // Solo limpiar si no hay inicio marcado aún
                ...((!this.state.inicioMarcado) && {
                    start: null,
                    end: null,
                    secondsfoStart: null,
                    secondsfoEnd: null
                })
            });

            // Procesar la transcripción del nuevo corte
            this.procesarTranscripcion(corte.Texto);

        } catch (error) {
            console.error('Error al cargar corte:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar el corte'
            });
        }
    }

    procesarTranscripcion = (texto) => {
        try {
            const listaTranscripciones = texto ? texto.split("|") : [];
            const listaTime = [];

            for (let i = 0; i < listaTranscripciones.length; i++) {
                const element = listaTranscripciones[i];
                const regex = /<([^>]+)>/g;
                const matches = element.match(regex);
                if (matches && matches.length >= 2) {
                    const value1 = matches[0].slice(1, -1);
                    const value2 = matches[1].slice(1, -1);
                    const tuple = [value1, value2];
                    listaTime.push(tuple);
                    listaTranscripciones[i] = element.replace(matches[0], '').replace(matches[1], '').trim();
                }
            }

            this.setState({
                listatrancript: listaTranscripciones,
                listaTime: listaTime
            });

        } catch (error) {
            console.error('Error al procesar transcripción:', error);
            this.setState({
                listatrancript: ['Error al procesar transcripción'],
                listaTime: []
            });
        }
    }

    startTime = () => {
        // Validar que si ya hay un inicio marcado en otro corte, no se puede marcar nuevo inicio
        if (this.state.inicioMarcado && this.state.corteInicio &&
            this.state.corteInicio.IdRegistro !== this.state.corteActual.IdRegistro) {
            Swal.fire({
                icon: 'warning',
                title: 'Inicio ya marcado',
                text: `Ya tienes un inicio marcado en el corte ${this.state.corteInicio.NombreMedio}. Para cambiar el inicio, primero desmarca el actual.`,
                showCancelButton: true,
                confirmButtonText: 'Desmarcar y marcar nuevo',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.desmarcarInicio();
                    this.marcarInicioEnCorteActual();
                }
            });
            return;
        }

        this.marcarInicioEnCorteActual();
    }

    marcarInicioEnCorteActual = () => {
        this.setState({ inicioMarcado: true });

        const segundos = Math.ceil(this.videoRef.current.currentTime);
        let segundosfotmat = this.formatTime(segundos);
        let fechaStart = new Date(this.state.fechaCorte);
        fechaStart.setSeconds(fechaStart.getSeconds() + segundos);
        const inicio = this.addseconds(segundos);

        this.setState({
            start: segundos,
            fechaInicial: inicio,
            fechastart: fechaStart,
            secondsfoStart: segundosfotmat,
            corteInicio: this.state.corteActual,
            tiempoInicioGlobal: {
                corte: this.state.corteActual,
                tiempo: segundos,
                fecha: inicio
            }
        });

        console.log('Inicio marcado en corte:', this.state.corteActual && this.state.corteActual.NombreMedio, 'Tiempo:', segundosfotmat);
    }

    desmarcarInicio = () => {
        this.setState({
            inicioMarcado: false,
            start: null,
            fechaInicial: "",
            fechastart: null,
            secondsfoStart: null,
            corteInicio: null,
            tiempoInicioGlobal: null
        });
    }

    endTime = () => {
        if (!this.state.inicioMarcado) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Debe marcar el tiempo de inicio primero'
            });
            return;
        }

        const segundos = Math.ceil(this.videoRef.current.currentTime);
        let segundosfotmat = this.formatTime(segundos);
        const fin = this.addseconds(segundos);
        let fechaEnd = new Date(this.state.fechaCorte);
        fechaEnd.setSeconds(fechaEnd.getSeconds() + segundos);

        // Validar coherencia de los tiempos
        const validacion = this.validarCoherenciaTiempos(segundos);

        if (!validacion.esValido) {
            Swal.fire({
                icon: 'error',
                title: 'Error de coherencia',
                text: validacion.mensaje
            });
            return;
        }

        this.setState({
            finMarcado: true,
            end: segundos,
            fechaFinal: fin,
            fechaend: fechaEnd,
            secondsfoEnd: segundosfotmat,
            corteFin: this.state.corteActual,
            tiempoFinGlobal: {
                corte: this.state.corteActual,
                tiempo: segundos,
                fecha: fin
            }
        });

        // Determinar si es una nota fusionada (abarca múltiples cortes)
        const esFusionada = this.state.corteInicio &&
            this.state.corteActual &&
            this.state.corteInicio.IdRegistro !== this.state.corteActual.IdRegistro;

        this.setState({ esCorteFucionado: esFusionada });

        console.log('Fin marcado en corte:', this.state.corteActual && this.state.corteActual.NombreMedio, 'Tiempo:', segundosfotmat);
        console.log('¿Es nota fusionada?', esFusionada);
    }

    validarCoherenciaTiempos = (tiempoFin) => {
        if (!this.state.inicioMarcado) {
            return {
                esValido: false,
                mensaje: 'Debe marcar el tiempo de inicio primero'
            };
        }

        const corteInicio = this.state.corteInicio;
        const corteActual = this.state.corteActual;

        // Si inicio y fin están en el mismo corte
        if (corteInicio.IdRegistro === corteActual.IdRegistro) {
            if (tiempoFin <= this.state.start) {
                return {
                    esValido: false,
                    mensaje: 'El tiempo de fin debe ser mayor al tiempo de inicio en el mismo corte'
                };
            }
            return { esValido: true };
        }

        // Para cortes diferentes, validar que el corte de fin sea posterior al de inicio
        const fechaInicio = new Date(corteInicio.FechaCorte);
        const fechaFin = new Date(corteActual.FechaCorte);

        if (fechaFin <= fechaInicio) {
            return {
                esValido: false,
                mensaje: 'El corte de fin debe ser posterior al corte de inicio'
            };
        }

        return { esValido: true };
    }

    /**
     * Guardar cambios con soporte para múltiples cortes
     */
    saveChanges = async (event) => {
        event.preventDefault();

        if (!this.state.titulo || !this.state.aclaracion || !this.state.tiempoInicioGlobal || !this.state.tiempoFinGlobal) {
            Swal.fire({
                icon: 'error',
                title: 'Datos incompletos',
                text: 'Debe completar todos los campos obligatorios y marcar los tiempos'
            });
            return;
        }

        try {
            const datosNoticia = this.prepararDatosNoticia();

            if (this.state.esCorteFucionado) {
                // Usar el nuevo endpoint para múltiples cortes
                const response = await Conexion.InserNoticiaTresCortes(datosNoticia);
                this.manejarRespuestaExitosa(response);
            } else {
                // Usar el método tradicional para un solo corte
                const response = await this.guardarNoticiaSencilla(datosNoticia);
                this.manejarRespuestaExitosa(response);
            }

        } catch (error) {
            console.error('Error al guardar:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al guardar',
                text: error.message || 'Error desconocido'
            });
        }
    }

    /**
 * Preparar datos de la noticia para envío
 */
    prepararDatosNoticia = () => {
        const fechaAlta = new Date().toISOString();

        const datos = {
            // Datos básicos de la noticia
            aclaracion: this.state.aclaracion,
            entrevistado: this.state.entrevistado,
            fechaInicio: this.state.fechaInicial,
            fechaFin: this.state.fechaFinal,
            duracion: this.state.end - this.state.start,
            medioid: this.state.idmedio,
            programaid: this.state.programaid,
            fechaTransmitido: this.state.fechaCorte,
            conductores: this.state.conductores,
            tiponoticiaid: this.state.tiponoticiaid,
            tipotonoid: this.state.tipotonoid,
            titulo: this.state.titulo,
            userid: this.state.userid,
            mediaUrl: this.state.transcripcion.LinkStreamming,
            startTime: this.state.start,
            endTime: this.state.end,

            // Datos de tiempo y cortes
            tiempoInicio: this.state.tiempoInicioGlobal,
            tiempoFin: this.state.tiempoFinGlobal,
            esCorteFusionado: this.state.esCorteFucionado,

            // Temas y coberturas
            temas: this.state.insertTemas,
            coberturas: this.state.insertCoberuras
        };

        if (this.state.esCorteFucionado) {
            // Para cortes múltiples, agregar información de todos los cortes involucrados
            datos.cortesInvolucrados = this.obtenerCortesInvolucrados();
        }

        return datos;
    }

    obtenerCortesInvolucrados = () => {
        const cortesInvolucrados = [];

        if (this.state.corteInicio && this.state.corteFin) {
            cortesInvolucrados.push({
                corteNumero: 1,
                idRegistro: this.state.corteInicio.IdRegistro,
                nombreCorte: this.state.corteInicio.NombreMedio,
                linkStreaming: this.state.corteInicio.LinkStreamming,
                fechaCorte: this.state.corteInicio.FechaCorte,
                tiempoInicio: this.state.tiempoInicioGlobal.tiempo,
                tiempoFin: this.state.corteInicio.IdRegistro === this.state.corteFin.IdRegistro
                    ? this.state.tiempoFinGlobal.tiempo
                    : null,
                esCorteCompleto: false
            });

            // Si el fin está en un corte diferente, agregarlo
            if (this.state.corteInicio.IdRegistro !== this.state.corteFin.IdRegistro) {
                cortesInvolucrados.push({
                    corteNumero: 2,
                    idRegistro: this.state.corteFin.IdRegistro,
                    nombreCorte: this.state.corteFin.NombreMedio,
                    linkStreaming: this.state.corteFin.LinkStreamming,
                    fechaCorte: this.state.corteFin.FechaCorte,
                    tiempoInicio: 0,
                    tiempoFin: this.state.tiempoFinGlobal.tiempo,
                    esCorteCompleto: false
                });
            }
        }

        return cortesInvolucrados;
    }

    /**
     * Manejar respuesta exitosa del guardado
     */
    manejarRespuestaExitosa = (response) => {
        this.handleCaptureImage();

        Swal.fire({
            title: '¿Desea Volver Al Menu de Inicio?',
            text: 'La Nota Se ha Guardado Correctamente',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'SI',
            cancelButtonText: 'No',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                this.props.history.push('/');
            } else {
                window.location.reload();
            }
        });
    }

    handleModificacionFechaStart() {
        if (this.state.inicioMarcado) {
            const regex = /^([0-5][0-9]):([0-5][0-9])$/;
            const inputValue = this.state.secondsfoStart;
            if (regex.test(inputValue)) {
                let [minutes, seconds] = this.state.secondsfoStart.split(':');
                let segundos = (parseInt(minutes) * 60) + parseInt(seconds);
                const inicio = this.addseconds(segundos);
                this.videoRef.current.currentTime = segundos;
                this.setState({ fechaInicial: inicio, start: segundos });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'error de formato',
                    text: 'El formato debe ser "mm:ss (minutos:segundos)"',
                });
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Debes marcar el botón Inicio antes de poder modificar la fecha de inicio.',
            });
        }
    }

    handleModificacionFechaEnd() {
        if (this.state.finMarcado) {
            const regex = /^([0-5][0-9]):([0-5][0-9])$/;
            const inputValue = this.state.secondsfoEnd;
            if (regex.test(inputValue)) {
                let [minutes, seconds] = this.state.secondsfoEnd.split(':');
                let segundos = (parseInt(minutes) * 60) + parseInt(seconds);
                const fin = this.addseconds(segundos);
                this.videoRef.current.currentTime = segundos;
                this.setState({ fechaFinal: fin, end: segundos });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'error de formato',
                    text: 'El formato debe ser "mm:ss (minutos:segundos)"',
                });
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Debes marcar el botón de fin antes de poder modificar la fecha de finalización.',
            });
        }
    }

    handleTimeRangeClick = (e) => {
        const i = parseInt(e.target.getAttribute("data-index"));
        const start = Math.floor(this.state.listaTime[i][0]);
        const end = Math.ceil(this.state.listaTime[i][1]);
        this.setState({ start: start, end: end });
        if (start !== null && end !== null) {
            this.videoRef.current.currentTime = start;
            this.videoRef.current.play();
        }
    }

    inputHandleChange = e => {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({ userDetail: ({ [name]: value }), [name]: value });
    }

    handleChange(event) {
        var isChecked = event.target.checked;
        var id = event.target.id;
        var item = event.target.value;

        if (id === "temasGenerales") {
            this.setState({ item: isChecked });
            this.setState(prevState => ({ checkedItems: prevState.checkedItems.set(item, isChecked) }));
            if (isChecked === true) {
                const arreglo = this.state.insertTemas;
                arreglo.push(item);
                this.setState({ insertTemas: arreglo });
            }
            if (isChecked === false) {
                const nada = this.state.insertTemas.filter((item1) => item1 !== item);
                this.setState({ insertTemas: nada });
            }
        }
    }

    inputChange = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({ [name]: value });
    }

    handleCaptureImage = async () => {
        try {
            console.log('Iniciando captura de pantalla...');
            const canvas = await html2canvas(document.body, {
                useCORS: true,
                allowTaint: true,
                scale: 1,
                width: window.innerWidth,
                height: window.innerHeight,
                scrollX: 0,
                scrollY: 0
            });

            return new Promise((resolve, reject) => {
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        try {
                            const notaId = this.state.idnotatranscript || this.props.match.params.id;
                            const nombreCorte = "captura_pantalla";
                            const response = await Conexion.captureFormImage(blob, notaId, nombreCorte);
                            resolve(response);
                        } catch (err) {
                            console.error('Error al enviar la imagen:', err);
                            reject(err);
                        }
                    } else {
                        const error = new Error('No se pudo crear el blob de la imagen');
                        reject(error);
                    }
                }, 'image/png', 0.8);
            });
        } catch (error) {
            console.error('Error en html2canvas:', error);
            throw error;
        }
    }

    mejorarAclaracion = async () => {
        // Validar que hay contenido para mejorar
        if (!this.state.aclaracion || this.state.aclaracion.trim().length < 5) {
            Swal.fire({
                icon: 'warning',
                title: 'Texto insuficiente',
                text: 'Debe escribir al menos 5 caracteres en la aclaración para poder mejorarla.',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        // Mostrar loading
        Swal.fire({
            title: 'Mejorando texto...',
            text: 'Por favor espere mientras procesamos su texto',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Guardar el texto original para referencia
            const textoOriginal = this.state.aclaracion;

            // Llamar a la API de mejora de texto
            const resultado = await Conexion.mejorarTexto(this.state.aclaracion);

            // Actualizar el estado automáticamente con el texto mejorado
            this.setState({
                aclaracion: resultado.corrected_text
            });

            // Cerrar el loading y mostrar confirmación
            Swal.fire({
                icon: 'success',
                title: 'Texto mejorado',
                timer: 4000,
                showConfirmButton: true,
                confirmButtonText: 'Entendido'
            });

        } catch (error) {
            console.error('Error al mejorar aclaración:', error);

            Swal.fire({
                icon: 'error',
                title: 'Error al mejorar texto',
                text: error.message || 'No se pudo procesar el texto. Inténtelo nuevamente.',
                confirmButtonText: 'Entendido'
            });
        }
    }

    async componentDidMount() {
        // ✅ OBTENER LOS PARÁMETROS PRIMERO
        const idnota = this.props.match.params.id;
        const idmedio = this.props.match.params.medio;

        console.log('Parámetros obtenidos:', { idnota, idmedio }); // Debug

        // ✅ VALIDAR QUE LOS PARÁMETROS EXISTEN
        if (!idnota || !idmedio) {
            console.error('Faltan parámetros de la URL:', { idnota, idmedio });
            Swal.fire({
                icon: 'error',
                title: 'Error de parámetros',
                text: 'No se pudieron obtener los parámetros de la URL'
            });
            return;
        }

        // Procesar fecha del nombre del archivo
        const dateString = idnota;
        const regex = /(\d{2})(\d{2})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/;
        const match = dateString.match(regex);

        if (match) {
            const year = match[1] + match[2];
            const month = match[3];
            const day = match[4];
            const hour = match[5];
            const minute = match[6];
            const second = match[7];
            const date = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
            this.setState({ fechaCorte: date, medioid: idmedio });
        }

        const usuario = Conexion.getCurrentUser();
        const fechaCortes = new Date().toISOString().slice(0, 10);

        // ✅ SINTAXIS COMPATIBLE - sin optional chaining
        const userId = usuario && usuario.userId ? usuario.userId : null;
        console.log('Antes de llamar APIs:', {
            idnota,
            idmedio,
            fechaCortes,
            usuario: userId
        }); // Debug

        try {
            const [
                temasGeneralesBasic,
                medio,
                tipos,
                programas,
                palabras
            ] = await Promise.all([
                Conexion.tabla("temas"),
                Conexion.medio(idmedio),
                Conexion.tipos(),
                Conexion.Programas(idmedio),
                Conexion.palabras()
            ]);

            // ✅ LLAMAR cortesMedioAll PRIMERO (para el OffCanvas)
            let cortesMedio = [];
            try {
                console.log('Llamando cortesMedioAll...');
                cortesMedio = await Conexion.cortesMedioAll(idmedio, fechaCortes);
                console.log('cortesMedioAll exitoso:', cortesMedio.length, 'cortes');
            } catch (error) {
                console.error('Error en cortesMedioAll:', error);
                // Continuar sin cortes para OffCanvas
            }

            // ✅ LLAMAR cortesMedio DESPUÉS (para el contexto)
            let contextCorteInicial = { anterior: null, actual: null, posterior: null };
            try {
                console.log('Llamando cortesMedio con parámetros:', {
                    idmedio,
                    fechaCortes,
                    idnota: idnota  // ✅ Verificar que no sea undefined
                });

                contextCorteInicial = await Conexion.cortesMedio(idmedio, fechaCortes, idnota);
                console.log('cortesMedio exitoso:', contextCorteInicial);
            } catch (error) {
                console.error('Error en cortesMedio:', error);
                // Continuar con contexto vacío
            }

            console.log('Contexto inicial obtenido:', contextCorteInicial);

            this.setState({
                tipos: tipos,
                userid: usuario.userId,
                palabras: palabras,
                programas: programas,
                idmedio: idmedio,
                medio: medio,
                temasGenerales: temasGeneralesBasic,
                misTemasGenerales: temasGeneralesBasic,
                cortesMedio: cortesMedio, // ← Para el OffCanvas
                fechaCortes: new Date().toISOString().slice(0, -8),

                // SOLO ESTOS 3 CORTES: anterior, actual, posterior al corte inicial
                corteActual: contextCorteInicial.actual || null,
                corteAnterior: contextCorteInicial.anterior || null,
                cortePosterior: contextCorteInicial.posterior || null,

                // GUARDAR LOS CORTES INICIALES PARA LIMITAR NAVEGACIÓN
                corteInicialAnterior: contextCorteInicial.anterior || null,
                corteInicialActual: contextCorteInicial.actual || null,
                corteInicialPosterior: contextCorteInicial.posterior || null
            });

            // Cargar el corte actual
            if (contextCorteInicial.actual) {
                await this.cargarCorte(contextCorteInicial.actual);
            } else {
                console.warn('No se encontró corte actual para:', idnota);
            }

        } catch (error) {
            console.error('Error general en componentDidMount:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de carga',
                text: 'No se pudieron cargar los datos necesarios: ' + error.message
            });
        }
    }

    handleVideoSkip = (seconds) => {
        this.videoRef.current.currentTime += seconds;
    }

    handleTimeUpdate = () => {
        this.setState({ currentTime: this.videoRef.current.currentTime });
    };

    handleDurationChange = () => {
        this.setState({ duration: this.videoRef.current.duration });
    };

    safeGet = (obj, path, defaultValue = null) => {
        try {
            return path.split('.').reduce((current, key) => current && current[key], obj) || defaultValue;
        } catch {
            return defaultValue;
        }
    }

    render() {
        const elementosLista = [];

        function segundosAHora(segundos) {
            let roundSeconds = Math.round(segundos);
            const horas = Math.floor(roundSeconds / 3600);
            const minutos = Math.floor((roundSeconds % 3600) / 60);
            const segundosRestantes = roundSeconds % 60;
            return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
        }

        const { start, end, currentTime, duration } = this.state;

        const progressBarStyle = {
            position: "relative",
            height: "10px",
            backgroundColor: "#ccc",
            zIndex: "1",
        };

        const rangeStyle = {
            position: "absolute",
            height: "10px",
            backgroundColor: "blue",
            opacity: "0.5",
            left: `${(start / duration) * 100}%`,
            width: `${((end - start) / duration) * 100}%`,
            zIndex: "2",
        };

        // Procesar transcripción para mostrar
        try {
            const listaTranscripciones = this.state.listatrancript;
            const listaTiempo = this.state.listaTime;
            const palabrasClave = this.state.palabras;

            listaTranscripciones.forEach((transcripcion, index) => {
                if (listaTiempo[index]) {
                    const palabras = transcripcion.split(" ");
                    const palabrasDestacadas = palabras.map((palabra) => {
                        const palabraClave = palabrasClave.find((obj) =>
                            obj.palabra.toLowerCase() === palabra.toLowerCase()
                        );
                        if (palabraClave) {
                            return `<b style="color: red">${palabra}</b>`;
                        } else {
                            return palabra;
                        }
                    });
                    const transcripcionDestacada = palabrasDestacadas.join(" ");
                    elementosLista.push(
                        <li key={index}>
                            <a>
                                <span className="times badge text-bg-success"
                                    data-index={index}
                                    onClick={this.handleTimeRangeClick}>
                                    {segundosAHora(listaTiempo[index][0])} a {segundosAHora(listaTiempo[index][1])}
                                </span>{" "}
                                <span dangerouslySetInnerHTML={{ __html: transcripcionDestacada }}></span>
                            </a>
                        </li>
                    );
                }
            });
        } catch {
            elementosLista.push(<li key={0}>No hay Transcripcion</li>);
        }

        return (
            <div className='noticia'>
                <div className="contenedor">
                    <div className='row'>
                        <div className='col'>
                            <div className="container-fluid">
                                <button className="btn btn-danger"
                                    style={{ position: "relative", marginBottom: "1rem" }}
                                    type="button"
                                    data-bs-toggle="offcanvas"
                                    data-bs-target="#offcanvasNavbar"
                                    aria-controls="offcanvasNavbar">
                                    <i className="bi bi-cassette-fill"></i> cortes del medio
                                </button>
                                <OffCanvas
                                    cortes={this.state.cortesMedio}
                                    medioid={this.props.match.params.medio}
                                />
                            </div>



                            <div className="navegacion-cortes mb-3">
                                <div className="row">
                                    {/* BOTÓN CORTE ANTERIOR */}
                                    <div className="col-md-4">
                                        <button
                                            className={`btn w-100 ${this.state.corteActual && this.state.corteInicialAnterior &&
                                                this.state.corteActual.IdRegistro === this.state.corteInicialAnterior.IdRegistro
                                                ? 'btn-primary' : 'btn-outline-secondary'
                                                }`}
                                            onClick={this.navegarCorteAnterior}
                                            disabled={!this.state.corteInicialAnterior}
                                            style={{
                                                padding: '10px',
                                                fontSize: '14px',
                                                boxShadow: this.state.corteActual && this.state.corteInicialAnterior &&
                                                    this.state.corteActual.IdRegistro === this.state.corteInicialAnterior.IdRegistro
                                                    ? '0 0 0 3px rgba(0,123,255,0.25)' : 'none'
                                            }}>
                                            <strong>Corte Anterior</strong>
                                            {this.state.corteInicialAnterior && (
                                                <div style={{ fontSize: '12px', marginTop: '5px' }}>
                                                    {this.extraerHoraDeNombre(this.state.corteInicialAnterior.NombreMedio) ||
                                                        moment(this.state.corteInicialAnterior.FechaCorte).format('HH:mm:ss')}
                                                </div>
                                            )}
                                        </button>
                                    </div>

                                    {/* BOTÓN CORTE ACTUAL */}
                                    <div className="col-md-4">
                                        <button
                                            className={`btn w-100 ${this.state.corteActual && this.state.corteInicialActual &&
                                                this.state.corteActual.IdRegistro === this.state.corteInicialActual.IdRegistro
                                                ? 'btn-primary' : 'btn-outline-secondary'
                                                }`}
                                            onClick={this.navegarCorteActualInicial}
                                            disabled={!this.state.corteInicialActual}
                                            style={{
                                                padding: '10px',
                                                fontSize: '14px',
                                                boxShadow: this.state.corteActual && this.state.corteInicialActual &&
                                                    this.state.corteActual.IdRegistro === this.state.corteInicialActual.IdRegistro
                                                    ? '0 0 0 3px rgba(0,123,255,0.25)' : 'none'
                                            }}>
                                            <strong>CORTE INICIAL</strong>
                                            {this.state.corteInicialActual && (
                                                <div style={{ fontSize: '12px', marginTop: '5px' }}>
                                                    {this.extraerHoraDeNombre(this.state.corteInicialActual.NombreMedio) ||
                                                        moment(this.state.corteInicialActual.FechaCorte).format('HH:mm:ss')}
                                                </div>
                                            )}
                                        </button>
                                    </div>

                                    {/* BOTÓN CORTE POSTERIOR */}
                                    <div className="col-md-4">
                                        <button
                                            className={`btn w-100 ${this.state.corteActual && this.state.corteInicialPosterior &&
                                                this.state.corteActual.IdRegistro === this.state.corteInicialPosterior.IdRegistro
                                                ? 'btn-primary' : 'btn-outline-secondary'
                                                }`}
                                            onClick={this.navegarCortePosterior}
                                            disabled={!this.state.corteInicialPosterior}
                                            style={{
                                                padding: '10px',
                                                fontSize: '14px',
                                                boxShadow: this.state.corteActual && this.state.corteInicialPosterior &&
                                                    this.state.corteActual.IdRegistro === this.state.corteInicialPosterior.IdRegistro
                                                    ? '0 0 0 3px rgba(0,123,255,0.25)' : 'none'
                                            }}>
                                            <strong>Corte Siguiente</strong>
                                            {this.state.corteInicialPosterior && (
                                                <div style={{ fontSize: '12px', marginTop: '5px' }}>
                                                    {this.extraerHoraDeNombre(this.state.corteInicialPosterior.NombreMedio) ||
                                                        moment(this.state.corteInicialPosterior.FechaCorte).format('HH:mm:ss')}
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="media">
                                <video
                                    ref={this.videoRef}
                                    width={"100%"}
                                    className="video-stream html5-main-video"
                                    controls="True"
                                    src={(this.state.corteActual && this.state.corteActual.LinkStreamming) || this.state.transcripcion.LinkStreamming}
                                    onTimeUpdate={this.handleTimeUpdate}
                                    onDurationChange={this.handleDurationChange}
                                />
                                <div style={progressBarStyle}>
                                    <div style={rangeStyle} />
                                    <div
                                        style={{
                                            position: "absolute",
                                            height: "10px",
                                            backgroundColor: "red",
                                            width: `${(currentTime / duration) * 100}%`,
                                        }}
                                    />
                                </div>

                                <div className="contenedor-nota">
                                    <div className="row">
                                        <div className="time-controls">
                                            <button className="time-control-btn" title="Atrasar 60 segundos" onClick={() => this.handleVideoSkip(-60)}>
                                                <span className="seconds-indicator">-60</span>
                                                <i className="bi bi-skip-backward-fill" />
                                            </button>
                                            <button className="time-control-btn" title="Atrasar 30 segundos" onClick={() => this.handleVideoSkip(-30)}>
                                                <span className="seconds-indicator">-30</span>
                                                <i className="bi bi-rewind-fill" />
                                            </button>
                                            <button className="time-control-btn" title="Atrasar 5 segundos" onClick={() => this.handleVideoSkip(-5)}>
                                                <span className="seconds-indicator">-5</span>
                                                <i className="bi bi-skip-start-fill" />
                                            </button>
                                            <button className="time-control-btn" title="Adelantar 5 segundos" onClick={() => this.handleVideoSkip(5)}>
                                                <span className="seconds-indicator">5</span>
                                                <i className="bi bi-skip-end-fill" />
                                            </button>
                                            <button className="time-control-btn" title="Adelantar 30 segundos" onClick={() => this.handleVideoSkip(30)}>
                                                <span className="seconds-indicator">30</span>
                                                <i className="bi bi-fast-forward-fill" />
                                            </button>
                                            <button className="time-control-btn" title="Adelantar 60 segundos" onClick={() => this.handleVideoSkip(60)}>
                                                <span className="seconds-indicator">60</span>
                                                <i className="bi bi-skip-forward-fill" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="titulo-nota" style={{ fontSize: "1.5em", marginTop: "7px" }}>
                                        <div className='row'>
                                            <div className='col' style={{ display: "ruby" }}>
                                                <h3>Marcar Tiempo:</h3>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <button
                                                    className="btn btn-danger"
                                                    style={{ minWidth: "5rem", marginRight: '1rem' }}
                                                    name="fechaInicio"
                                                    onClick={this.startTime}>
                                                    Inicio
                                                </button>
                                                <input
                                                    type='text'
                                                    className="form-control"
                                                    name='secondsfoStart'
                                                    value={this.state.secondsfoStart || ''}
                                                    onChange={this.handleStartChange}
                                                    style={{ marginLeft: '1rem', marginRight: '1rem', width: '18rem' }}
                                                    placeholder="mm:ss"
                                                />
                                                <button className="btn btn-primary" onClick={this.handleModificacionFechaStart}>
                                                    Modificar inicio
                                                </button>
                                                {/* {this.state.inicioMarcado && (
                                                    <button className="btn btn-warning ml-2" onClick={this.desmarcarInicio}>
                                                        Desmarcar
                                                    </button>
                                                )} */}
                                            </div>

                                            <div className='mt-1' style={{ display: 'flex', alignItems: 'center' }}>
                                                <button
                                                    className="btn btn-danger"
                                                    style={{ minWidth: "5rem", marginRight: '1rem' }}
                                                    name="fechaFin"
                                                    onClick={this.endTime}>
                                                    Fin
                                                </button>
                                                <input
                                                    type='text'
                                                    className="form-control"
                                                    name='secondsfoEnd'
                                                    value={this.state.secondsfoEnd || ''}
                                                    onChange={this.handleStartChange}
                                                    style={{ marginLeft: '1rem', marginRight: '1rem', width: '18rem' }}
                                                    placeholder="mm:ss"
                                                />
                                                <button className="btn btn-primary" onClick={this.handleModificacionFechaEnd}>
                                                    Modificar fin
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='col'>
                            <ul style={{ overflow: "scroll", height: "30rem", listStyle: "none" }}>
                                {elementosLista}
                            </ul>
                        </div>
                        <div className='col'>
                            <div className='row'>
                                <div className='col'>
                                    <div className='row'>
                                        <div className='col'>
                                            <Link to={'/'}>
                                                <button type="button" className="btn btn-info">Inicio</button>
                                            </Link>
                                        </div>
                                        <div className='col'>
                                            <button type="button" className="btn btn-warning" onClick={this.saveChanges}>
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card my-2">
                                <div className="card-body">
                                    <h3 className="card-title text-center">
                                        <b>{this.state.medio.nombremedio}</b>
                                    </h3>
                                    <form className="form">
                                        <div className="form-group">
                                            <label htmlFor="titulo">Título</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="titulo"
                                                name="titulo"
                                                value={this.state.titulo}
                                                onChange={this.inputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="programaid">Programas</label>
                                            <select
                                                className="form-control"
                                                id="programaid"
                                                name="programaid"
                                                value={this.state.programaid}
                                                onChange={this.inputChange}>
                                                <option value="">Selecciona una opción</option>
                                                {this.state.programas.sort((a, b) => a.Descripcion > b.Descripcion).map(programa => (
                                                    <option key={programa.ProgramaID} value={programa.ProgramaID}>
                                                        {programa.Descripcion}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="entrevistado">Entrevistado</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="entrevistado"
                                                name="entrevistado"
                                                value={this.state.entrevistado}
                                                onChange={this.inputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="tiponoticiaid">Tipo De Noticia</label>
                                            <select
                                                className="form-control"
                                                id="tiponoticiaid"
                                                name="tiponoticiaid"
                                                value={this.state.tiponoticiaid}
                                                onChange={this.inputChange}
                                                required>
                                                <option value="">Selecciona una opción</option>
                                                {this.state.tipos.sort((a, b) => a.Descripcion > b.Descripcion).map(tipo => (
                                                    <option key={tipo.TipoNoticiaID} value={tipo.TipoNoticiaID}>
                                                        {tipo.Descripcion}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mt-2 mb-2">
                                            <label htmlFor="aclaracion">
                                                Aclaración
                                                <button
                                                    type="button"
                                                    className="btn improve-button ml-2"
                                                    onClick={this.mejorarAclaracion}
                                                    disabled={!this.state.aclaracion || this.state.aclaracion.trim().length < 5}
                                                    title="Mejorar texto con IA"
                                                    style={{ marginLeft: '10px' }}>
                                                    <i className="bi bi-magic"></i>
                                                    Mejorar con IA
                                                </button>
                                            </label>
                                            <textarea
                                                className="form-control"
                                                id="aclaracion"
                                                name="aclaracion"
                                                rows="5"
                                                value={this.state.aclaracion}
                                                onChange={this.inputChange}
                                                placeholder="Escriba la aclaración de la noticia..."
                                                required>
                                            </textarea>
                                            <small className="form-text text-muted">
                                                Escriba al menos 5 caracteres para habilitar la mejora con IA
                                            </small>
                                        </div>

                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='row tabla checks'>
                        <div className='col'>
                            <SelectionList
                                misTemasGenerales={this.state.misTemasGenerales}
                                handleChange={this.handleChange}
                                onChange={this.onChange}
                                Temas={this.state.Temas}
                            />
                        </div>
                        <div className='col'>
                            <h5><b>Coberturas</b></h5>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="exampleFormControlInput1"
                                    name='coberturas'
                                    onChange={this.onChange}
                                    placeholder="Buscar Coberturas"
                                />
                            </div>
                            <div className="content" style={{ overflow: "scroll", height: "16rem" }}>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Métodos faltantes que se referenciaron pero no estaban incluidos
    handleStartChange = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({ [name]: value });
    }

    onChange = async e => {
        e.persist();
        await this.setState({ busqueda: e.target.value });
        const nombre = e.target.name;

        if (nombre === "Temas") {
            this.filtrarTemas();
        }
        if (nombre === "coberturas") {
            this.filtrarCoberturas();
        }
    }

    filtrarTemas = () => {
        var search = this.state.temasGenerales.filter(item => {
            if (item.Descripcion.toLocaleLowerCase().includes(this.state.busqueda.toLocaleLowerCase())) {
                return item;
            }
        });
        this.setState({ misTemasGenerales: search });
    }

    filtrarCoberturas = () => {
        var search = this.state.coberturas.filter(item => {
            if (item.Nombre.toLocaleLowerCase().includes(this.state.busqueda.toLocaleLowerCase())) {
                return item;
            }
        });
        this.setState({ misCoberturas: search });
    }

    // Método de guardado simple para un solo corte
    guardarNoticiaSencilla = async (datosNoticia) => {
        const response = await Conexion.InserNoticia(
            datosNoticia.aclaracion,
            datosNoticia.entrevistado,
            datosNoticia.fechaInicio,
            datosNoticia.fechaFin,
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

        // Insertar temas y coberturas si existen
        if (datosNoticia.temas.length > 0) {
            await Conexion.insertSinMarcar(response.data.id, datosNoticia.temas, datosNoticia.fechaAlta, "tema");
        }
        if (datosNoticia.coberturas.length > 0) {
            await Conexion.insertSinMarcar(response.data.id, datosNoticia.coberturas, datosNoticia.fechaAlta, "cobertura");
        }

        return response;
    }
}
const addImprovementStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .swal-wide {
            max-width: 90% !important;
        }
        
        .improve-button {
            background: linear-gradient(45deg, #28a745, #20c997);
            border: none;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
        }
        
        .improve-button:hover {
            background: linear-gradient(45deg, #218838, #1fa88a);
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
            color: white;
        }
        
        .improve-button:disabled {
            background: #6c757d;
            transform: none;
            box-shadow: none;
            cursor: not-allowed;
        }
        
        .improve-button i {
            margin-right: 5px;
        }
    `;
    document.head.appendChild(style);
};



export default withRouter(Noticia);