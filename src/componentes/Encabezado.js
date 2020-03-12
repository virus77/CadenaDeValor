import React, { Component } from 'react';
import favoritos_icon from '../imagenes/favoritos_icon.png';
import favoritos_icon_clicked from '../imagenes/favoritos_icon_clicked.png';
import gantt_icon from '../imagenes/gantt_icon.png';
import user_icon from '../imagenes/user_icon.png';
import user_icon_clicked from '../imagenes/user_icon_clicked.png';
import external_icon from '../imagenes/external_icon.png';
import egupload_icon from '../imagenes/egupload_icon.png';
import macob from '../imagenes/macob_24.png';
import macoc from '../imagenes/macoc_16.png';
import '../estilos/encabezado.css';

class Encabezado extends Component {
    abrirModal = textoVentana=>{
        this.props.abrirModal(textoVentana);
    }

    onChangeWindow = (idVentana) =>{
        this.props.cambiarVentana(idVentana);
    }

    render(){
        const {terreno} = this.props;
        return (
            <div>
                <div className='container-fluid'>
                    <div className='row'>
                        <div className='col-sm-3 nombreTerreno'><label id='NombreTerreno'><b>{ terreno.NombredelTerreno2 }</b></label></div>
                        <div className='col-sm-1 columna'><img id='FiltroFavoritos' src={favoritos_icon} alt='favoritos_icon' ></img></div>
                        <div className='col-sm-1 columna'><img id='FiltroGantt' src={gantt_icon} alt='gantt_icon' ></img></div>
                        <div className='col-sm-1 columna'><img id='FiltroVerTodo' src={user_icon} alt='user_icon' ></img></div>
                        <div className='col-sm-1 columna'><img id='MACO' src={macob} alt='macob' onClick={()=>{ this.abrirModal('¿Qué tipo de MACO es?')} } ></img></div>
                        <div className='col-sm-1 columna'><img id='ToGantt' src={external_icon} alt='external_icon' ></img></div>
                        <div className='col-sm-4 menu'>
                            <div className="btn-group btn-group-toggle" data-toggle="buttons">
                                <label className="btn btn-secondary btn-sm">
                                    <input type="radio" onClick = {()=>this.onChangeWindow(1)} />Administración
                                </label>
                                <label className="btn btn-secondary btn-sm">
                                    <input type="radio" onClick = {()=>this.onChangeWindow(2)} />Normativo
                                </label>
                                <label className="btn btn-secondary btn-sm">
                                    <input type="radio" onClick = {()=>this.onChangeWindow(3)} /> Proyectos
                                </label>
                                <label className="btn btn-primary btn-sm">
                                    <input type="radio" onClick = {()=>this.onChangeWindow(4)} /> Estrategia de gestión
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div colSpan={7} className='col-sm egupload'>
                            <p>
                                <img id='CargaEG' src={egupload_icon} alt='egupload_icon' onClick={()=>{ this.abrirModal('Estrategia de gestión autorizada')} }></img>
                                E. de G. autorizada
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          );
    }
}

export default Encabezado;