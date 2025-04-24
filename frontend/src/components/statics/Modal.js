import React from 'react';

const Modal = ({ showModal, setShowModal, message }) => {
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      {showModal && (
        <div className="modal fade show" role="dialog" aria-modal="true" style={{ display: 'block' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Mensaje recibido</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <p>{message}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;