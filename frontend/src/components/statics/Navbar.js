import React, { useState  } from 'react';
import {useHistory} from 'react-router-dom';
import "../../assets/navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));; // obtenemos el usuario del localStorage
  const history = useHistory();
  const handleLogout = () => {
    localStorage.removeItem('user'); // eliminamos el usuario del localStorage
   history.push("/");
   window.location.reload();
    setUser(null);
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="/" style={{ color: "rgba(255, 255, 255, 0.9)" }}>CVT</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {user && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src="https://i2.wp.com/avatar-management--avatars.us-west-2.prod.public.atl-paas.net/default-avatar-3.png?ssl=1" style={{width:"1.5rem"}} alt="Foto de perfil" className="navbar-profile-img" />
                  <span className="navbar-profile-text"> {user.userName}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li><button className="dropdown-item" onClick={handleLogout}>Salir</button></li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;