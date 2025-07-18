import React from 'react'

function SelectionList(props) {
    return (
        <div>
            <div>
      <h5><b>Temas Generales</b></h5>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          id="exampleFormControlInput1"
          name='Temas'
          onChange={props.onChange}
          placeholder="Buscar Temas Generales"
        />
      </div>
      <div className="content" style={{ overflow: "scroll", height: "16rem" }}>
        {props.misTemasGenerales.map(temasGenerales => (
          <div id="temasGenerales" className="form-check">
            <div>
              <input
                className="form-check-input"
                type="checkbox"
                onChange={props.handleChange}
                value={temasGenerales.id}
                id="temasGenerales"
              />
              <label className="form-check-label" >
                {temasGenerales.Descripcion}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div></div>
    )
}

export default SelectionList






