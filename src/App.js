import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { sp } from '@pnp/sp';
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import Encabezado from './componentes/Encabezado';

class App extends Component {
  state ={
    idTerreno: 285,
    items: []
  }
  async componentDidMount(){
    var currentItem = await sp.web.lists.getByTitle('Terrenos').items.getById(this.state.idTerreno).get();
    this.setState({items: currentItem});
  }

  render(){
    const { idTerreno, items } = this.state;
    return (
      <div className="App">
        <Encabezado terreno = {items} />
        
      </div>
    );
  }
}

export default App;