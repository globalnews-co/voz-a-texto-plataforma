import React, { Component, useRef } from 'react'
import "../assets/noticia.css"
import { Link, withRouter } from 'react-router-dom';
import Conexion from '../utilities/Conexion';
import Swal from 'sweetalert2';
import moment, { duration } from 'moment';
import SelectionList from './statics/SelectionList';
import OffCanvas from './OffCanvas';

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
        };
        this.handleModificacionFechaStart = this.handleModificacionFechaStart.bind(this);
        this.handleModificacionFechaEnd = this.handleModificacionFechaEnd.bind(this);
        this.videoRef = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.inputHandleChange = this.inputHandleChange.bind(this);
    };
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
        return formattedDate
    }
    startTime = () => {
        this.setState({ inicioMarcado: true });

        const segundos = Math.ceil(this.videoRef.current.currentTime)
        let segundosfotmat = this.formatTime(segundos)
        let fechaStart = new Date(this.state.fechaCorte)
        fechaStart.setSeconds(fechaStart.getSeconds() + segundos);
        const inicio = this.addseconds(segundos)
        this.setState({ start: segundos, fechaInicial: inicio, fechastart: fechaStart, secondsfoStart: segundosfotmat });
    }
    handleStartChange = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({ [name]: value })

    }
    handleModificacionFechaStart() {
        if (this.state.inicioMarcado) {
            const regex = /^([0-5][0-9]):([0-5][0-9])$/; // expresión regular para validar el formato "00:00"
            const inputValue =this.state.secondsfoStart;
            if (regex.test(inputValue) ) { 
            let [minutes, seconds] = this.state.secondsfoStart.split(':');
            let segundos = (parseInt(minutes) * 60) + parseInt(seconds);
            const inicio = this.addseconds(segundos)
            this.videoRef.current.currentTime = segundos
            this.setState({ fechaInicial: inicio, start: segundos });}
            else {
                Swal.fire({
                    icon: 'error',
                    title: 'error de formato',
                    text: 'El formato debe ser "mm:ss (minutos:segundos)"',
                })
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Debes marcar el botón Inicio antes de poder modificar la fecha de finalización.!',
            })

        }
    }
    handleModificacionFechaEnd() {
        if (this.state.finMarcado) {
            const regex = /^([0-5][0-9]):([0-5][0-9])$/; // expresión regular para validar el formato "00:00"
            const inputValue =this.state.secondsfoEnd;
            if (regex.test(inputValue) ) { // si el valor coincide con la expresión regular o está vacío, actualizar el estado
                let [minutes, seconds] = this.state.secondsfoEnd.split(':');
                let segundos = (parseInt(minutes) * 60) + parseInt(seconds);
                const fin = this.addseconds(segundos)
                this.videoRef.current.currentTime = segundos
                this.setState({ fechaFinal: fin, end: segundos });
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: 'error de formato',
                    text: 'El formato debe ser "mm:ss (minutos:segundos)"',
                })
            }
            
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Debes marcar el botón de fin antes de poder modificar la fecha de finalización.!',
            })

        }

    }


    endTime = () => {
        this.setState({ finMarcado: true });
        const segundos = Math.ceil(this.videoRef.current.currentTime)
        let segundosfotmat = this.formatTime(segundos)
        const fin = this.addseconds(segundos)
        let fechaEnd = new Date(this.state.fechaCorte)
        fechaEnd.setSeconds(fechaEnd.getSeconds() + segundos);
        this.setState({ end: segundos, fechaFinal: fin, fechaend: fechaEnd, secondsfoEnd: segundosfotmat });
    }
    handleTimeRangeClick = (e) => {
        const i = parseInt(e.target.getAttribute("data-index"));

        const start = Math.floor(this.state.listaTime[i][0])
        const end = Math.ceil(this.state.listaTime[i][1])
        this.setState({ start: start, end: end });
        if (start !== null && end !== null) {
            this.videoRef.current.currentTime = start;
            this.videoRef.current.play();
        }
      

    }

    inputHandleChange = e => {
        let name = e.target.name;
        let value = e.target.value
        this.setState({ userDetail: ({ [name]: value }), [name]: value });
    }
    handleChange(event) {
        var isChecked = event.target.checked;
        var id = event.target.id
        var item = event.target.value;
        var nombre = event.target.name;

        if (id === "temasGenerales") {
            this.setState({ item: isChecked })
            this.setState(prevState => ({ checkedItems: prevState.checkedItems.set(item, isChecked) }));
            if (isChecked === true) {
                const arreglo = this.state.insertTemas;
                arreglo.push(item);
                this.setState({ insertTemas: arreglo })
               
            }
            if (isChecked === false) {
                const nada = this.state.insertTemas.filter((item1) => item1 !== item)
                this.setState({ insertTemas: nada })
             

            }
        }
    }

    inputChange = (e) => {
        let name = e.target.name;
        let value = e.target.value
        this.setState({ [name]: value });
    }

    saveChanges = (event) => {
        event.preventDefault();
        var date = new Date();
        var fechaAlta =
            ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
            ("00" + date.getDate()).slice(-2) + "-" +
            date.getFullYear() + " " +
            ("00" + date.getHours()).slice(-2) + ":" +
            ("00" + date.getMinutes()).slice(-2) + ":" +
            ("00" + date.getSeconds()).slice(-2) + "." + ("000" + date.getMilliseconds()).slice(-3)
            ;
        var validador = 0

        if (this.state.insertCoberuras.length > 0) {
            validador = 1
            Conexion.insertSinMarcar(this.props.match.params.id, this.state.insertCoberuras, fechaAlta, "cobertura")
        }

        if (this.state.titulo !== "" && this.state.aclaracion !== "" && this.state.fechaInicial!=="" && this.state.fechaFinal !== "") {
            let duracion=this.state.end- this.state.start
            Conexion.InserNoticia(this.state.aclaracion, this.state.entrevistado, this.state.fechaInicial, this.state.fechaFinal, duracion, this.state.medioid, this.state.programaid, this.state.fechaCorte, this.state.conductores, this.state.tiponoticiaid, this.state.tipotonoid, this.state.titulo, this.state.userid, this.state.transcripcion.LinkStreamming, this.state.start, this.state.end).then
                (response => {

                    //Conexion.cutNews(response.data.id, this.state.transcripcion.LinkStreamming, this.state.start, this.state.end)
                    if (this.state.insertTemas.length > 0) {
                        validador = 1
                        Conexion.insertSinMarcar(response.data.id, this.state.insertTemas, fechaAlta, "tema")

                    }
                })
            validador = 1
        }else {
            console.log(this.state.titulo)
            console.log(this.state.aclaracion)
            console.log(this.state.fechaInicial)
            console.log(this.state.fechaFinal)
        }
        if (validador === 1) {
            const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                    confirmButton: 'btn btn-success',
                    cancelButton: 'btn btn-danger'
                },
                buttonsStyling: false
            })

            swalWithBootstrapButtons.fire({
                title: '¿Desea Volver Al Menu de Inicio?',
                text: 'La Nota Se ha Modificado Correctamente',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'SI ',
                cancelButtonText: 'No',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    this.props.history.push('/');
                } else {
                    window.location.reload();
                }
            })
        }
        else {
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'No se hizo Ninguna Modificacion',
                text: 'Algo salio mal!',
                showConfirmButton: false,
                timer: 2500
            })
        }

    }

    onChange = async e => {
        e.persist();
        await this.setState({ busqueda: e.target.value });
        const nombre = e.target.name

        if (nombre === "Temas") {
            this.filtrarTemas();
        }
        if (nombre === "coberturas") {
            this.filtrarCoberturas();
        }
    }


    filtrarTemas = () => {
        var search = this.state.temasGenerales.filter(item => {
            if (item.Descripcion.toLocaleLowerCase().includes(this.state.busqueda.toLocaleLowerCase())
            ) {
                return item;
            }
        });
        this.setState({ misTemasGenerales: search })
    }
    filtrarCoberturas = () => {
        var search = this.state.coberturas.filter(item => {
            if (item.Nombre.toLocaleLowerCase().includes(this.state.busqueda.toLocaleLowerCase())
            ) {
                return item;
            }
        });
        this.setState({ misCoberturas: search })
    }


    handleTimeUpdate = () => {
        this.setState({ currentTime: this.videoRef.current.currentTime });
    };

    handleDurationChange = () => {
        this.setState({ duration: this.videoRef.current.duration });
    };

    onFechaCortesChange = (event) => {
        this.setState({ fechaCortes: event.target.value });
    };

    async componentDidMount() {
        const idnota = this.props.match.params.id;
        const nombreNota = idnota
        const idmedio = this.props.match.params.medio
        const dateString = nombreNota;
        const regex = /(\d{2})(\d{2})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/;// Obtener los últimos 15 caracteres (YYMMDD_HHmmss)
        const match = dateString.match(regex);
        if (match) { // Si se encuentra el patrón en la cadena de texto
            const year = match[1] + match[2]; // Obtener el año (YY) y agregar "20" al principio
            const month = match[3]; // Obtener el mes (MM)
            const day = match[4]; // Obtener el día (DD)
            const hour = match[5]; // Obtener la hora (HH)
            const minute = match[6]; // Obtener los minutos (mm)
            const second = match[7];
            const date = `${year}-${month}-${day}T${hour}:${minute}:${second}`; // Construir el objeto de fecha
            const localDateString = date.toLocaleString()
            this.setState({ fechaCorte: date, medioid: idmedio })
            // Mostrar la fecha en la consola
        } else {
            console.log("No se encontró una fecha en el formato esperado en la cadena de texto."); // Mostrar un mensaje si no se encuentra el patrón
        }
        const usuario = Conexion.getCurrentUser();
        const fechaActual = new Date().toISOString().slice(0, -8)
        const fechaCortes = new Date().toISOString().slice(0, 10)
        const cortesMedio = await Conexion.cortesMedio(idmedio, fechaCortes);
        const transcripcion = await Conexion.transcripcion(idmedio, nombreNota);
        const temasGeneralesBasic = await Conexion.tabla("temas");
        const medio = await Conexion.medio(idmedio);
        const tipos = await Conexion.tipos();
        const programas = await Conexion.Programas(this.props.match.params.medio);
        const texto = transcripcion ? transcripcion.Texto : ""
        const listaTranscripciones = texto.split("|");

        const listaTime = [];
        for (let i = 0; i < listaTranscripciones.length; i++) {
            const element = listaTranscripciones[i];
            const regex = /<([^>]+)>/g;
            const matches = element.match(regex);
            if (matches) {
                const value1 = matches[0].slice(1, -1);
                const value2 = matches[1].slice(1, -1);
                const tuple = [value1, value2];
                listaTime.push(tuple);
                listaTranscripciones[i] = element.replace(matches[0], '').replace(matches[1], '').trim();
            }
        }
        const palabras = await Conexion.palabras();
    

        this.setState({
            tipos: tipos,
            userid: usuario.userId,
            palabras: palabras,
            programas: programas,
            transcripcion: transcripcion,
            idmedio: idmedio,
            cortesMedio: cortesMedio,
            fechaCortes: fechaActual,
            listaTime: listaTime,
            listatrancript: listaTranscripciones,
            medio: medio,
            idnotatranscript: nombreNota,
            noticiamp4: idnota,
            temasGenerales: temasGeneralesBasic,
            misTemasGenerales: temasGeneralesBasic,
            fechaCortes: new Date().toISOString().slice(0, -8),
        });

    }

    handleVideoSkip = (seconds) => {
        this.videoRef.current.currentTime += seconds;
    }
    render() {
        const elementosLista = [];


        function segundosAHora(segundos) {
            let roundSeconds = Math.round(segundos)
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
        try {
            const listaTranscripciones = this.state.listatrancript;
            const listaTiempo = this.state.listaTime;
            const palabrasClave = this.state.palabras;
            let i = 0;
            listaTranscripciones.forEach((transcripcion, index) => {
                const palabras = transcripcion.split(" ");
                const palabrasDestacadas = palabras.map((palabra) => {

                    const palabraClave = palabrasClave.find((obj) => obj.palabra.toLowerCase() === palabra.toLowerCase());
                    if (palabraClave) {
                        return `<b style="color: red">${palabra}</b>`;
                    } else {
                        return palabra;
                    }
                });
                const transcripcionDestacada = palabrasDestacadas.join(" ");
                elementosLista.push(
                    <li key={index}>
                        <a >
                            <span className="times badge text-bg-success" data-index={i} onClick={this.handleTimeRangeClick}>
                                {segundosAHora(listaTiempo[i][0])} a {segundosAHora(listaTiempo[i][1])}
                            </span>{" "}
                            <span dangerouslySetInnerHTML={{ __html: transcripcionDestacada }}></span>
                        </a>
                    </li>
                );
                i++;
            });
        } catch {
            elementosLista.push(<li key={0}>No hay Transcripcion</li>);

        }
        return (
            <div className='noticia' >
                <div className="contenedor">
                    <div className='row'>
                        <div className='col'>
                            <div className="container-fluid">
                                <button className="btn btn-danger" style={{ position: "relative", marginBottom: "1rem" }} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
                                    <i className="bi bi-cassette-fill"></i> cortes del medio
                                </button>
                                <OffCanvas
                                    cortes={this.state.cortesMedio}
                                    medioid={this.props.match.params.medio}
                                />
                            </div>
                            <div className="media">
                                <video ref={this.videoRef} width={"100%"} className="video-stream html5-main-video" controls="True" src={this.state.transcripcion.LinkStreamming} onTimeUpdate={this.handleTimeUpdate} onDurationChange={this.handleDurationChange} />
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
                                                <h3> Marcar Tiempo:</h3>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <button className="btn btn-danger" style={{ minWidth: "5rem", marginRight: '1rem' }} name="fechaInicio" onClick={this.startTime}>Inicio</button>
                                                <input
                                                    type='text'
                                                    className="form-control"
                                                    name='secondsfoStart'
                                                    value={this.state.secondsfoStart}
                                                    onChange={this.handleStartChange}
                                                    style={{ marginLeft: '1rem', marginRight: '1rem', width: '18rem' }}
                                                />
                                                  <button className="btn btn-primary" onClick={this.handleModificacionFechaStart}>Modificar inicio</button>
                                            
                                            </div>

                                            <div className='mt-1' style={{ display: 'flex', alignItems: 'center' }}>
                                                <button className="btn btn-danger" style={{ minWidth: "5rem", marginRight: '1rem' }} name="fechaFin" onClick={this.endTime}>Fin</button>
                                                <input
                                                    type='text'
                                                    className="form-control"
                                                    name='secondsfoEnd'
                                                    value={this.state.secondsfoEnd}
                                                    onChange={this.handleStartChange}
                                                    style={{ marginLeft: '1rem', marginRight: '1rem', width: '18rem' }}
                                                />
                                                <button className="btn btn-primary" onClick={this.handleModificacionFechaEnd}>Modificar fin</button>
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
                                                <button type="button" className="btn btn-info" >Inicio</button>
                                            </Link>
                                        </div>
                                        <div className='col'>
                                            <button type="button" className="btn btn-warning" onClick={this.saveChanges}>Guardar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card my-2">
                                <div className="card-body">
                                    <h3 className="card-title text-center"> <b>{this.state.medio.nombremedio} </b> </h3>
                                    <form className="form">
                                        <div className="form-group">
                                            <label htmlFor="titulo">Título</label>
                                            <input type="text" className="form-control" id="titulo" name="titulo" value={this.state.titulo} onChange={this.inputChange} required/>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="programaid">Programas</label>
                                            <select className="form-control" id="programaid" name="programaid" value={this.state.programaid} onChange={this.inputChange}>
                                                <option value="">Selecciona una opción</option>
                                                {this.state.programas.sort((a, b) => a.Descripcion > b.Descripcion).map(programa => (
                                                    <option key={programa.ProgramaID} value={programa.ProgramaID}>{programa.Descripcion}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="entrevistado">Entrevistado</label>
                                            <input type="text" className="form-control" id="entrevistado" name="entrevistado" value={this.state.entrevistado} onChange={this.inputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="entrevistado">Tipo De Noticia</label>
                                            <select className="form-control" id="tipoid" name="tipoid" onChange={this.inputChange} required>
                                                <option value="">Selecciona una opción</option>
                                                {this.state.tipos.sort((a, b) => a.Descripcion > b.Descripcion).map(tipo => (
                                                    <option key={tipo.TipoNoticiaID} value={tipo.TipoNoticiaID}>{tipo.Descripcion}</option>
                                                ))}
                                            </select>                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="aclaracion">Aclaración</label>
                                            <textarea className="form-control" id="aclaracion" name="aclaracion" rows="5" value={this.state.aclaracion} onChange={this.inputChange} required></textarea>
                                        </div>
                                    </form>
                                </div>
                            </div>


                        </div>
                    </div>
                    <div className='row tabla checks'>
                        <div className='col'>
                            <SelectionList misTemasGenerales={this.state.misTemasGenerales}
                                handleChange={this.handleChange} onChange={this.onChange}
                                Temas={this.state.Temas}
                            />
                        </div>
                        <div className='col'>
                            <h5><b>Coberturas</b></h5>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control" id="exampleFormControlInput1"
                                    name='coberturas' onChange={this.onChange} placeholder="Buscar Coberturas"
                                />
                            </div>
                            <div className="content" style={{ overflow: "scroll", height: "16rem" }}>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(Noticia)




