import React, { useState, useEffect } from 'react';
import "../assets/Home.css"
import Conexion from '../utilities/Conexion'
import { Link, Redirect } from 'react-router-dom';
import DataTable from 'react-data-table-component';

const MyNotes = () => {

  
  

  const [filterText, setFilterText] = useState('');
  const [notesVT, setNotesVT] = useState([]);
  const [notesDsk, setNotesDsk] = useState([]);
  const [view, setView] = useState(true);


  const handleToggle = () => {
    setView(!view);
  };


  useEffect(() => {
    if (view === false && notesDsk.length === 0) {
      const usuario = Conexion.getCurrentUser();
      const getMyNotesDsk = async () => {
        const mynotesdsk = await Conexion.mynotesdsk(usuario.userId);
        setNotesDsk(mynotesdsk);
      };
      getMyNotesDsk();
    }
  }, [view]);

  var filteredItems = view ? notesVT  : notesDsk ;
  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
  };
 
 
   filteredItems = filteredItems.filter(
    (item) =>
      item.noticiaid.toString().includes(filterText) ||
      item.nombremedio.toLowerCase().includes(filterText.toLowerCase()) ||
      item.titulo.toLowerCase().includes(filterText.toLowerCase())
  )
  const handleAuditarMedio = (noticiaid) => {
    if (view){
    window.open(`http://192.168.1.156:3033/noticiavt/${noticiaid}`)
  }else{
    window.open(`http://192.168.1.156:3033/noticia/${noticiaid}`)
  }
  };

  useEffect(() => {
    const usuario = Conexion.getCurrentUser();

    const getMyNotesVT = async () => {
      const mynotes = await Conexion.mynotes(usuario.userId);
      //const mynotesdsk = await Conexion.mynotesdsk(usuario.userId);
      setNotesVT(mynotes);
      //setNotesDsk(mynotesdsk);

    };

   

    getMyNotesVT();
  }, []);

  
  const columns = [
    {
      name: 'Noticia ID',
      selector: 'noticiaid',
      sortable: true
    },
    {
      name: 'Titulo',
      selector: 'titulo',
      sortable: true
    },
    {
      name: 'Nombre del Medio',
      selector: 'nombremedio',
      sortable: true
    },
    {
      name: 'Fecha alta',
      selector: 'fechaalta',
      sortable: true
    },

    {
      name: 'ver',
      button: true,
      cell: row => (

        <button
          className="btn btn-dark"
          type="button"
          title='Auditar medio'
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar"
          onClick={() => handleAuditarMedio(row.noticiaid)}>


          <i className="bi bi-eye-fill" />
        </button>
      ),
    }
  ];

  return (
    <div className='container'>
      <h1 className='title'>Tabla Notas Montadas</h1>
      <form className="row g-3 title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
        <div className="col-auto">
          <Link to={'/'}>
            <button type="button" className="btn btn-info" style={{ marginRight: 10 }}>Inicio</button>
          </Link>
        </div>
        <div className="col-auto">
          <input
            type="text"
            placeholder="Buscar medio..."
            value={filterText}
            onChange={handleFilterChange}
            style={{ backgroundColor: '#f2f2f2', padding: 10, border: 'none', borderRadius: 5 }}
          />
        </div>
        <div className="col-auto">
          <button type="button" className="btn btn-primary" onClick={handleToggle}>
            {view ? 'Notas con Voz a Texto' : 'Notas sin Voz a Texto'}
          </button>
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
          noDataComponent={<h3>No se encontraron datos</h3>}
        />
      </div>
    </div>
  );
};
export default MyNotes