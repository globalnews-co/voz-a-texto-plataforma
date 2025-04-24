import React from 'react'
import Card from './statics/Card'
import ModalAddNote from './statics/ModalAddNote'

function Start() {
  return (
    <div class="home" style={{ minHeight: "83vh" }}>
      <div class="container mt-3">
        <div class="row row-cols-1 row-cols-lg-2 g-3 mb-3">
          <div class="col mb-3">
            <Card title='Auditar medios' text='Consulta y audita los medios actuales con voz a texto' link='/auditmedia' />
          </div>
          <div class="col mb-3">
            <Card title='Ver mis notas montadas' text='Consulta el historial de notas que has montado' link='/mynotes' />
          </div>
          <div class="col mb-3">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Montar Nota</h5>
                <p class="card-text">montar nota manualmente</p>
                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>

        <ModalAddNote />
      </div>
    </div>


  );
};

export default Start;
