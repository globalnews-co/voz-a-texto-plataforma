import React, { Component } from 'react'
import { Redirect } from 'react-router-dom';
import Swal from 'sweetalert2';
import "../assets/login/css/login.css"
import loginpng from "../assets/login/images/login.webp" ;
import logo from "../assets/login/images/logo.png" ;
import Conexion from '../utilities/Conexion';
import CryptoJS from 'crypto-js';


export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nombreUsuario: "",
      password: "",
      error: "",
      user: undefined,
      fechaInicio : undefined
    };
  }

  componentDidMount() {
    const user = Conexion.getCurrentUser();
    
    this.setState({user: user});
    console.log("user", user);
  }
  

  changeHandler = (event) => {
    let nam = event.target.name;
    let val = event.target.value;
    this.setState({[nam]: val});
  }


 doLogin = async (event) => {
   event.preventDefault();
   const encryptedPassword = CryptoJS.SHA256(this.state.password + 'globalnews4102').toString();
   Conexion
        .signin(this.state.nombreUsuario, 
          encryptedPassword)
     .then(async () => {
          const user = Conexion.getCurrentUser();
          this.setState({user: user});  
          this.props.history.push('/');
        },
        error => {
          Swal.fire({
            title: 'Error al iniciar sesión',
            text: error.message,
            icon: 'error',
            confirmButtonText: 'Ok'
          })  ;
          console.log("Login fail: error = { " + error.toString() + " }");
          this.setState({error: "Can not signin successfully ! Please check nombreUsuario/password again"});

        }
    )
  }
  render() {
    let login="";
  
    const user = this.state.user;
  
    if (user !== undefined && user !== null)  {
      { window.location.reload(); }
      login = <Redirect to="/" />;
    } else {
      login = (
        <div className="bodyLogin">
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" />
          <main className="d-flex align-items-center min-vh-100 py-3 py-md-0">
            <div className="container">
              <div className="card login-card">
                <div className="row no-gutters">
                  <div className="col-md-5">
                    <img src={loginpng} alt="login" className="login-card-img" />
                  </div>
                  <div className="col-md-7">
                    <div className="card-body">
                      <div className="brand-wrapper">
                        <img src={logo} alt="logo" className="logo" />
                      </div>
                      <p className="login-card-description">Administrador AudioVisual</p>
                      <form onSubmit={this.doLogin}>
                        <div className="form-group">
                          <label htmlFor="Usuario" className="sr-only">Usuario</label>
                          <input type="text"
                            name="nombreUsuario"
                            id="Usuario"
                            className="form-control"
                            placeholder="Usuario"
                            autoComplete="Usuario"
                            onChange={this.changeHandler} />
                        </div>
                        <div className="form-group mb-4">
                          <label htmlFor="password" className="sr-only">Contraseña</label>
                          <input type="password"
                            name="password"
                            id="password"
                            className="form-control"
                            value={this.state.password}
                            placeholder="contraseña"
                            autoComplete="password"
                            onChange={this.changeHandler}
                          />
                        </div>
                        <button name="login" id="login" className="btn btn-block login-btn mb-4" type="submit" value="Login">Ingresa</button>
                      </form>
  
                      <nav className="login-card-footer-nav">
                        <a href="#!">Terms of use.</a>
                        <a href="#!">Privacy policy</a>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>)
    }
  
    return (
      <div>
        {login}
      </div>
    )
    }
  }