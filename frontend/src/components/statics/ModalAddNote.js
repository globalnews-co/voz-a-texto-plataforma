import React, { useEffect, useState } from 'react'
import Conexion from '../../utilities/Conexion';
import moment from 'moment';
import Swal from 'sweetalert2';

export default function ModalAddNote() {
    // Initialize medios as an empty array to prevent mapping errors
    const [titulo, setTitulo] = useState("");
    const [contenido, setContenido] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [medios, setMedios] = useState([]);
    const [medio, setMedio] = useState("");
    const [programas, setProgramas] = useState([]);
    const [programa, setPrograma] = useState("");
    const [media, setMedia] = useState("");
    const [duracion, setDuracion] = useState();
    const [fechaFin, setFechaFin] = useState("");
    const [conductores, setConductores] = useState("");
    const [entrevistado, setEntrevistado] = useState("");
    const [tiposNoticia, setTiposNoticia] = useState([]);
    const [tipoNoticia, setTipoNoticia] = useState("");

    // Validation states
    const [tituloError, setTituloError] = useState("");
    const [contenidoError, setContenidoError] = useState("");
    const [conductoresError, setConductoresError] = useState("");
    const [entrevistadoError, setEntrevistadoError] = useState("");

    // Field max lengths from backend validation
    const maxLengths = {
        titulo: 2000,
        contenido: 8000,
        conductores: 2000,
        entrevistado: 2000
    };

    // Validation function
    const validateField = (name, value) => {
        if (value && value.length > maxLengths[name]) {
            return `El campo excede el máximo de ${maxLengths[name]} caracteres.`;
        }
        return "";
    };

    // Handle field changes with validation
    const handleFieldChange = (name, value) => {
        const error = validateField(name, value);

        switch (name) {
            case 'titulo':
                setTitulo(value);
                setTituloError(error);
                break;
            case 'contenido':
                setContenido(value);
                setContenidoError(error);
                break;
            case 'conductores':
                setConductores(value);
                setConductoresError(error);
                break;
            case 'entrevistado':
                setEntrevistado(value);
                setEntrevistadoError(error);
                break;
            default:
                break;
        }
    };

    // funcion para enviar datos al backend
    const enviarDatos = async () => {
        console.log("enviando datos");

        // Validate all fields before sending
        const tituloValidation = validateField('titulo', titulo);
        const contenidoValidation = validateField('contenido', contenido);
        const conductoresValidation = validateField('conductores', conductores);
        const entrevistadoValidation = validateField('entrevistado', entrevistado);

        // Update error states
        setTituloError(tituloValidation);
        setContenidoError(contenidoValidation);
        setConductoresError(conductoresValidation);
        setEntrevistadoError(entrevistadoValidation);

        // Check if any validation errors exist
        if (tituloValidation || contenidoValidation || conductoresValidation || entrevistadoValidation) {
            Swal.fire({
                icon: 'error',
                title: 'Error de validación',
                text: 'Uno o más campos exceden el límite de caracteres permitido.',
            });
            return;
        }

        // enviar datos al backend teniendo en cuenta que voy a enviar un archivo
        if (titulo !== "" && contenido !== "" && fechaInicio !== "" && medio !== "" && media !== "" && fechaFin !== "") {
            const data = new FormData();
            const fecha = moment().format('YYYY-MM-DD HH:mm:ss');
            const usuario = Conexion.getCurrentUser();
            data.append("titulo", titulo);
            data.append("contenido", contenido);
            data.append("fechaInicio", fechaInicio.replace("T", " "));
            data.append("fechaFin", fechaFin.replace("T", " "));
            data.append("medio", medio);
            data.append("programa", programa);
            data.append("duracion", duracion);
            data.append("conductores", conductores);
            data.append("entrevistado", entrevistado);
            data.append("tipoNoticia", tipoNoticia);
            data.append("userid", usuario.userId);
            data.append("fechatransmitido", fecha);
            data.append("file", media);

            Swal.fire({
                title: 'Subiendo Archivo',
                html:
                    '<div class="spinner-border text-success" style="display:flex;margin-left: auto;margin-right: auto; width:10rem;height:10rem" role="status">' +
                    '<span class="visually-hidden">Loading...</span>' +
                    '</div>'
                    +
                    '<br><br>' +
                    '<span>Por favor espere no cierre esta ventana</span>' +
                    '<br><br>',
                allowOutsideClick: false,
                showConfirmButton: false
            });

            console.log(data.get("titulo"));
            console.log(data.get("contenido"));
            console.log(data.get("fechaInicio"));
            console.log(data.get("fechaFin"));
            console.log(data.get("medio"));

            await Conexion.subirArchivo(data).then((response) => {
                console.log(response);

                if (response.status == 200) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Nota montada correctamente',
                        text: 'La nota se montó correctamente con el id: ' + response.data.filename.split(".")[0],
                        footer: '<a href="http://192.168.1.156:3000/noticiavt/' + response.data.filename.split(".")[0] + '" target="_blank">Ver Nota</a>'
                    });
                }
                else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al montar la nota',
                        text: (response.data && response.data.message) || 'La nota no se montó correctamente',
                    });
                }
            }).catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al montar la nota',
                    text: (error.response && error.response.data && error.response.data.message) || 'Ocurrió un error al procesar la solicitud',
                });
            });
        }
        else {
            Swal.fire({
                icon: 'error',
                title: 'Faltan campos por llenar...',
                text: 'Por favor llena todos los campos requeridos',
            });
        }
    };

    useEffect(() => {
        const getdata = async () => {
            try {
                const medios = await Conexion.getMedios();
                const tipsNoticia = await Conexion.tipos("12");
                console.log(tipsNoticia);
                setTiposNoticia(tipsNoticia || []); // Add fallback to empty array
                setMedios(medios || []); // Add fallback to empty array
                //fecha con moment
                const fecha = moment().format('YYYY-MM-DD HH:mm:ss');
                setFechaInicio(fecha);
                setFechaFin(fecha);
                //duracion
                const duracion = moment(fecha).diff(fecha, 'seconds');
                setDuracion(duracion);
            } catch (error) {
                console.error("Error fetching data:", error);
                // Optionally show error message to user
                Swal.fire({
                    icon: 'error',
                    title: 'Error al cargar datos',
                    text: 'No se pudieron cargar los datos necesarios. Por favor, intente de nuevo más tarde.',
                });
            }
        }
        getdata();
    }, []);

    return (
        <div>
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-lg modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Montar Nota - GNSync</h5>
                            <button type="button" className="btn-close " data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="titulo" className="form-label">
                                        Titulo <small className="text-muted">({titulo.length}/{maxLengths.titulo} caracteres)</small>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${tituloError ? 'is-invalid' : ''}`}
                                        id="titulo"
                                        placeholder="Titulo"
                                        value={titulo}
                                        onChange={(e) => handleFieldChange('titulo', e.target.value)}
                                    />
                                    {tituloError && <div className="invalid-feedback">{tituloError}</div>}
                                </div>

                                <div className="mb-3">
                                    <div className='row'>
                                        <div className='col-6'>
                                            <label htmlFor="fechainicio" className="form-label">Fecha Inicio</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control"
                                                id="fechainicio"
                                                name="fechainicio"
                                                placeholder="Fecha Inicio"
                                                value={fechaInicio}
                                                required
                                                onChange={(event) => {
                                                    if (event.target.value !== "" && event.target.value !== null && event.target.value !== undefined) {
                                                        const value = event.target.value;
                                                        setFechaInicio(value);
                                                        setDuracion(moment(fechaFin).diff(value, 'seconds'));
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className='col-6'>
                                            <label htmlFor="fechafin" className="form-label">Fecha Fin</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control"
                                                id="fechafin"
                                                name="fechafin"
                                                placeholder="Fecha Fin"
                                                value={fechaFin}
                                                required
                                                onChange={(event) => {
                                                    if (event.target.value !== "" && event.target.value !== null && event.target.value !== undefined) {
                                                        const value = event.target.value;
                                                        setFechaFin(value);
                                                        setDuracion(moment(value).diff(fechaInicio, 'seconds'));
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="duracion" className="form-label">Duración</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="duracion"
                                        placeholder="Duracion"
                                        value={duracion}
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-6">
                                        <div className="mb-3">
                                            <label htmlFor="medio" className="form-label">Medio</label>
                                            <select
                                                className="form-select"
                                                id="medio"
                                                aria-label="Default select example"
                                                onChange={async (event) => {
                                                    const value = event.target.value;
                                                    setMedio(value);
                                                    try {
                                                        const programas = await Conexion.Programas(value);
                                                        setProgramas(programas || []); // Add fallback to empty array
                                                    } catch (error) {
                                                        console.error("Error fetching programs:", error);
                                                        setProgramas([]);
                                                    }
                                                }}
                                            >
                                                <option value="">Selecciona un medio</option>
                                                {medios && Array.isArray(medios) && medios.length > 0 ?
                                                    medios.map((medio) => (
                                                        <option key={medio.value} value={medio.value}>{medio.label}</option>
                                                    )) :
                                                    <option value="">No hay medios disponibles</option>
                                                }
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-6">
                                        <div className="mb-3">
                                            <label htmlFor="programa" className="form-label">Programa</label>
                                            <select
                                                className="form-select"
                                                id="programa"
                                                aria-label="Default select example"
                                                onChange={(event) => {
                                                    const value = event.target.value;
                                                    setPrograma(value);
                                                }}
                                            >
                                                <option value="">Selecciona un Programa</option>
                                                {Array.isArray(programas) && programas.map((programa) => (
                                                    <option key={programa.ProgramaID} value={programa.ProgramaID}>{programa.Descripcion}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-6'>
                                        <div className="mb-3">
                                            <label htmlFor="conductores" className="form-label">
                                                Conductores <small className="text-muted">({conductores.length}/{maxLengths.conductores} caracteres)</small>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${conductoresError ? 'is-invalid' : ''}`}
                                                id="conductores"
                                                placeholder="Conductores"
                                                value={conductores}
                                                onChange={(e) => handleFieldChange('conductores', e.target.value)}
                                            />
                                            {conductoresError && <div className="invalid-feedback">{conductoresError}</div>}
                                        </div>
                                    </div>

                                    <div className='col-6'>
                                        <div className="mb-3">
                                            <label htmlFor="entrevistado" className="form-label">
                                                Entrevistado <small className="text-muted">({entrevistado.length}/{maxLengths.entrevistado} caracteres)</small>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${entrevistadoError ? 'is-invalid' : ''}`}
                                                id="entrevistado"
                                                placeholder="Entrevistado"
                                                value={entrevistado}
                                                onChange={(e) => handleFieldChange('entrevistado', e.target.value)}
                                            />
                                            {entrevistadoError && <div className="invalid-feedback">{entrevistadoError}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="tipoNoticia" className="form-label">Tipo de Noticia</label>
                                    <select
                                        className="form-select"
                                        id="tipoNoticia"
                                        aria-label="Default select example"
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setTipoNoticia(value);
                                        }}
                                    >
                                        <option value="">Selecciona un Tipo de noticia</option>
                                        {Array.isArray(tiposNoticia) && tiposNoticia.map((tipo) => (
                                            <option key={tipo.TipoNoticiaID} value={tipo.TipoNoticiaID}>{tipo.Descripcion}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="contenido" className="form-label">
                                        Contenido <small className="text-muted">({contenido.length}/{maxLengths.contenido} caracteres)</small>
                                    </label>
                                    <textarea
                                        className={`form-control ${contenidoError ? 'is-invalid' : ''}`}
                                        id="contenido"
                                        rows="3"
                                        value={contenido}
                                        onChange={(e) => handleFieldChange('contenido', e.target.value)}
                                    ></textarea>
                                    {contenidoError && <div className="invalid-feedback">{contenidoError}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="formFile" className="form-label">Media</label>
                                    <input
                                        className="form-control"
                                        type="file"
                                        id="formFile"
                                        onChange={(event) => {
                                            setMedia("");
                                            const archivo = event.target.files[0];
                                            //comprobar si el tipo de archivo es video
                                            if (archivo.type === "video/mp4" || archivo.type === "audio/mp3" || archivo.type === "audio/mpeg") {
                                                setMedia(archivo);
                                            }
                                            else {
                                                Swal.fire({
                                                    icon: 'error',
                                                    title: 'Error al subir el archivo',
                                                    text: 'El archivo debe ser de tipo mp4 o mp3. Su archivo es: ' + archivo.type,
                                                });
                                            }
                                        }}
                                    />
                                </div>

                                <div className="mb-3">
                                    <button type="button" className="btn btn-primary" onClick={enviarDatos}>Montar Nota</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}