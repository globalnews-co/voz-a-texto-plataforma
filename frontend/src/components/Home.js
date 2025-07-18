import React, { useState, useEffect } from 'react';
import "../assets/Home.css"
import Conexion from '../utilities/Conexion'
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Offcanvas from './OffCanvas';
import DataTable from 'react-data-table-component';
import moment from 'moment';
import 'moment-timezone';

const Home = () => {
  const [mediosvt, setMediosvt] = useState([]);
  const [cortes, setCortes] = useState([]);
  const [medioid, setMedioid] = useState();
  const [filterText, setFilterText] = useState('');

  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
  };

  const filteredItems = mediosvt.filter(
    (item) =>
      item.NombreMedio.toLowerCase().includes(filterText.toLowerCase())
  )
  useEffect(() => {
    const getMediosvt = async () => {
      const mediosvt = await Conexion.mediosvt();
      setMediosvt(mediosvt);
    };

    getMediosvt();
  }, []);

  const onVerCortesClick = async (medioid) => {
    setMedioid(medioid);
    const fechaActual=moment().tz('America/Bogota')
    const fechaFormateada = fechaActual.format('YYYY-MM-DD');
    //const fecha = "2023-03-21"
    const cortesMedio = await Conexion.cortesMedio(medioid, fechaFormateada);
    setCortes(cortesMedio);
  };

  const columns = [
    {
      name: 'ID_Medio',
      selector: 'ID_Medio',
      sortable: true
    },
    {
      name: 'Nombre del Medio',
      selector: 'NombreMedio',
      sortable: true
    },
    {
      name: 'Auditar',
      button: true,
      cell: row => (
        <button
          className="btn btn-dark"
          type="button"
          title='Auditar medio'
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar"
          onClick={() => onVerCortesClick(row.ID_Medio)}
        >
          <i className="bi bi-eye-fill" />
        </button>
      ),
    }
  ];


    return (
      <div className='container'>
        
      <h1 className='title'>Tabla de Medios</h1>
      <form className="row g-3 title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',padding:'1rem' }}>   
           <div className="col-auto">
          <Link to={'/'}>
            <button type="button" className="btn btn-info" style={{ marginRight: 10 }}>Inicio</button>
          </Link>
        </div>
        <div className="col-auto" >
          <input
            type="text"
            placeholder="Buscar medio..."
            value={filterText}
            onChange={handleFilterChange}
            style={{ backgroundColor: '#f2f2f2', padding: 10, border: 'none', borderRadius: 5 }}
          />
        </div>
      </form>
      <div className="container tabla-container">
        <DataTable
          columns={columns}
          data={filteredItems}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 30]}
          highlightOnHover
          pointerOnHover
          onRowClicked={row => onVerCortesClick(row.ID_Medio)}
          noDataComponent={<h3>No se encontraron datos</h3>}
    
        />
      </div>
      <Offcanvas
        cortes={cortes}
        medioid={medioid}
      />
    </div>
    
    );
  };
  


export default Home;
