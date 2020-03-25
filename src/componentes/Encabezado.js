import React, { Component } from 'react';
import Modal from './Ventana';
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
    constructor(props) {
        super(props)
        this.inialState = {
            modal: {
                abierto: false,
                id: 0,
                terreno: '',
                esTarea: false
            }
        }
        this.state = this.inialState;
    }

    onCambiarVentana = (idVentana) => {
        if (idVentana !== this.props.idVentana) {
            this.props.cambiarVentana(idVentana)
        }
    }

    onAbrirModal = (terreno, id, esTarea) => {
        this.setState({ modal: { abierto: true, id: id, terreno: terreno, esTarea: esTarea } })
    }

    onCerrarModal = () => {
        this.setState({ modal: this.inialState.modal })
    };

    render() {
        const { terreno, totalAdmin, totalNorm, totalProy, maco, disabled } = this.props
        var mimaco = maco;
        var mimacoAlt = maco;
        return (
            <div>
                <div className='container-fluid'>
                    <div className='row'>
                        <div className='col-sm-3 nombreTerreno'><label id='NombreTerreno'><b>{terreno}</b></label></div>
                        <div className='col-sm-1 columna'><img id='FiltroFavoritos' onClick={() => this.onCambiarVentana(5)} src={favoritos_icon} alt='favoritos_icon' disabled={disabled} ></img></div>
                        <div className='col-sm-1 columna'><img id='FiltroGantt' onClick={() => this.onCambiarVentana(6)} src={gantt_icon} alt='gantt_icon' disabled={disabled} ></img></div>
                        <div className='col-sm-1 columna'><img id='FiltroVerTodo' onClick={() => this.onCambiarVentana(7)} src={user_icon} alt='user_icon' disabled={disabled} ></img></div>
                        <div className='col-sm-1 columna'><img id='MACO' onClick={() => { this.onAbrirModal(terreno, 268, false) }} ></img></div>
                        <div className='col-sm-1 columna'><img id='ToGantt' src={external_icon} alt='external_icon' ></img></div>
                        <div className='col-sm-4 menu'>
                            <div className="btn-group btn-group-toggle" data-toggle="buttons">
                                <label className="btn btn-secondary btn-sm">
                                    <input type="radio" onClick={() => this.onCambiarVentana(1)} />Administración - {totalAdmin}
                                </label>
                                <label className="btn btn-secondary btn-sm">
                                    <input type="radio" onClick={() => this.onCambiarVentana(2)} />Normativo - {totalNorm}
                                </label>
                                <label className="btn btn-secondary btn-sm">
                                    <input type="radio" onClick={() => this.onCambiarVentana(3)} /> Proyectos - {totalProy}
                                </label>
                                <label className="btn btn-primary btn-sm">
                                    <input type="radio" onClick={() => this.onCambiarVentana(4)} /> Estrategia de gestión
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div colSpan={7} className='col-sm egupload'>
                            <p>
                                <img id='CargaEG' src={egupload_icon} alt='egupload_icon' onClick={() => { this.onAbrirModal(terreno, 269, false) }}></img>
                                E. de G. autorizada
                            </p>
                        </div>
                    </div>
                </div>
                {this.state.modal.abierto ? <Modal abrir={this.state.modal} cerrar={this.onCerrarModal} /> : null}
            </div>
        );
    }
}

export default Encabezado;