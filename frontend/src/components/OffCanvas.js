import React, { useEffect, useState } from 'react'
import Conexion from '../utilities/Conexion';
import moment from 'moment';
import 'moment-timezone';

const Offcanvas = (props) => {
  const [fechaActual,setFechaActual] = useState(moment().tz('America/Bogota'));
  const fechaFormateada = fechaActual.format('YYYY-MM-DDThh:mm');
  const [fechaCortes, setFechaCortes] = useState(fechaFormateada);
  const [cortesMedio, setCortesMedio] = useState([]);
  
 useEffect(() => {
  setCortesMedio(props.cortes);
}, [props.cortes]);
  const onFechaCortesChange = (e) => {
    setFechaCortes(e.target.value);
  }
  const onSubirFecha = async () => {
    const fecha=moment(fechaCortes).tz('America/Bogota')
    const fechaformat = fecha.format('YYYY-MM-DD');
    console.log(fechaformat)
    const idmedio = props.medioid;
    const cortesMedio = await Conexion.cortesMedio(idmedio, fechaformat);
    setCortesMedio(cortesMedio);
  };
    return (
      <div className="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasNavbarLabel">Cortes Del Medio</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <input
            type="datetime-local"
            className="form-control"
            name="fechaCortes"
            value={fechaCortes}
            onChange={onFechaCortesChange}
          />
  
          <button className="mx-auto btn btn-outline-success" style={{minWidth:"15.3rem",display:'flex',justifyContent:'center' ,marginTop:'1rem'}} onClick={onSubirFecha}>Buscar</button>
  
          <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
            {cortesMedio.map(corteMedio => (
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href={"/" + props.medioid + "/" + corteMedio.NombreMedio}>{corteMedio.NombreMedio}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  
  export default Offcanvas;