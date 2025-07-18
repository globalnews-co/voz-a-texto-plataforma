import React, { Component, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import Noticia from './components/Noticia';
import './App.css';
import Login from './components/Login';
import MyNotes from './components/MyNotes';
import Navbar from './components/statics/Navbar';
import Start from './components/Start';
import NotFound from './components/NotFound';


const App = () => {
  const user = localStorage.getItem('user');

  return (
    <Router>
      <div>
        <Switch>
          {user ?
            <div>
              <Navbar user={user} />
              <Switch>
                <Route path="/" exact={true}>
                  <Start />
                  <footer class="footer bg-dark text-white mt-auto py-3">
                    <div class="container">
                      <section>
                        <p class="d-flex justify-content-center align-items-center mb-0">
                          <span class="me-3">Soporte Tecnológico</span>
                          <button type="button" class="btn btn-outline-light btn-sm">Reportar Error</button>
                        </p>
                      </section>
                    </div>
                    <div class="text-center py-2" style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}>
                      <p class="mb-0">© 2023 GNC -JJ</p>
                    </div>
                  </footer>
                </Route>
                <Route path='/auditmedia' exact={true} component={Home} />
                <Route path='/mynotes' exact={true} component={MyNotes} />
                <Route path='/nota/:filtro/:id' component={Noticia} />
                <Route path='/:medio/:id' component={Noticia} />
                <Route path='*' component={NotFound} />
              </Switch>
            </div>
            :
            <Route path='/' exact={true} component={Login} />
          }
          <Route path="/login" component={Login} exact={true} />
          <Route path="*" component={() => <Redirect to="/" />} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;