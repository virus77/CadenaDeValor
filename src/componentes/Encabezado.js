import React, { Component } from 'react';
import Modal from './Ventana';
import { Badge, Button } from 'reactstrap';
import disabled_icon from '../imagenes/disabled.png';
import favoritos_icon from '../imagenes/favoritos_icon.png';
import favDis_icon from '../imagenes/favDis_icon.png';
import gantt_icon from '../imagenes/gantt.png';
import ganttDis_icon from '../imagenes/ganttDis.png';
import viewAll from '../imagenes/viewAll.png';
import egupload_icon from '../imagenes/egupload_icon.png';
import fav_icon from '../imagenes/fav_icon.png';
import viewAllDis from '../imagenes/viewAllDis.png';
import macob from '../imagenes/macoB.png';
import macoc from '../imagenes/macoC.png';
import macox from '../imagenes/macoX.png';
import toGantt from '../imagenes/toGantt.png';
import '../estilos/encabezado.css';

class Encabezado extends Component {
    constructor(props) {
        super(props)
        this.inialState = {
            idPITerr: props.idPITerr,
            modal: {
                abierto: false,
                id: 0,
                terreno: '',
                esTarea: false,
                filaSeleccionada: {}
            },
            datos: {
                campo: '',
                valor: ''
            },
            maco: props.maco,
        }
        this.state = this.inialState;
    }

    onCambiarVentana = (idVentana, mensaje, name, style) => {
        if (idVentana !== this.props.idVentana) {
            this.props.cambiarVentana(idVentana, 'Cargando contenido...', name, style, "")
        }
    }

    onAbrirModal = (terreno, id, esTarea, campo, valor, fila) => {
        this.setState({
            modal: { abierto: true, id: id, terreno: terreno, esTarea: esTarea, filaSeleccionada: fila },
            datos: { campo: campo, valor: valor }
        })
    }

    onActualizarMaco = nuevoMaco => {
        this.props.cambioMaco(nuevoMaco)
        this.setState({ maco: nuevoMaco })
    }

    onCerrarModal = () => {
        this.setState({ modal: this.inialState.modal })
    };

    render() {
        const { terreno, totalAdmin, totalNorm, totalProy, disabled, idVentana } = this.props
        return (
            <div>
                <div className='container-fluid' style={{ paddingTop: "1%" }}>
                    <div className='row'>
                        <div className='col-sm-2 nombreTerreno'><label id='NombreTerreno'><b>{terreno}</b></label></div>
                        <div className='col-sm-1 columna'><img id='FiltroFavoritos' onClick={() => this.onCambiarVentana(5)} src={idVentana !== 4 ? fav_icon : favDis_icon} alt='favoritos_icon' disabled={disabled} ></img></div>
                        <div className='col-sm-1 columna'><img id='FiltroGantt' onClick={() => this.onCambiarVentana(6)} src={idVentana !== 4 ? gantt_icon : gantt_icon} alt='gantt_icon' disabled={false} ></img></div>
                        <div className='col-sm-1 columna'><img id='FiltroVerTodo' onClick={() => this.onCambiarVentana(7)} src={idVentana !== 4 ? viewAll : viewAllDis} alt='user_icon' disabled={disabled} ></img></div>
                        <div className='col-sm-1 columna'><img id='MACO' src={this.state.maco === '' ? macox : (this.state.maco === 'B' ? macob : macoc)} alt='macob' onClick={() => { this.onAbrirModal(terreno, 268, false, 'radioChecked', this.state.maco, { Tarea: { ID: 268 } }) }} ></img></div>
                        <div className='col-sm-1 columna'><img id='ToGantt' onClick={() => this.onCambiarVentana(8)} src={toGantt} alt='toGantt' ></img></div>
                        <div className='col-sm-5 menu'>
                            <nav className="navbar navbar-expand-sm bg-light navbar-light">
                                <ul className="navbar-nav" style={{ borderBottomStyle: "solid", borderBottomColor: "#3C8891" }}>
                                    <li name='admin' className={idVentana === 1 ? "nav-item active colorBlueMenu" : "bg-light nav-item colorNoMenu"} onClick={(e) => this.onCambiarVentana(1, e, "genericoAdmin.css", "../estilos/genericoAdmin.css")}>
                                        <a className={idVentana === 1 ? "nav-link colorWhite" : "nav-link disabled"} href="#">Administración <Badge color="secondary">{totalAdmin}</Badge></a>
                                    </li>
                                    <li name='norm' className={idVentana === 2 ? "nav-item active colorBlueMenu" : "bg-light nav-item colorNoMenu"} onClick={(e) => this.onCambiarVentana(2, e, "genericoNorm.css", "../estilos/genericoNorm.css")}>
                                        <a className={idVentana === 2 ? "nav-link colorWhite" : "nav-link disabled"} href="#">Normativo <Badge color="secondary">{totalNorm}</Badge></a>
                                    </li>
                                    <li name='proy' className={idVentana === 3 ? "nav-item active colorBlueMenu" : "bg-light nav-item colorNoMenu"} onClick={(e) => this.onCambiarVentana(3, e, "genericoProy.css", "../estilos/genericoProy.css")}>
                                        <a className={idVentana === 3 ? "nav-link colorWhite" : "nav-link disabled"} href="#">Proyectos <Badge color="secondary">{totalProy}</Badge></a>
                                    </li>
                                    <li name='eg' className={idVentana === 4 ? "nav-item active colorBlueMenu" : "bg-light nav-item colorNoMenu"} onClick={(e) => this.onCambiarVentana(4, e, "genericoEG.css", "../estilos/genericoEG.css")} >
                                        <a className={idVentana === 4 ? "nav-link colorWhite" : "nav-link disabled"} href="#" >Estrategia de gestión</a>
                                    </li>
                                </ul>
                            </nav>
                            <hr className='hr' />
                        </div>
                    </div>
                </div>
                {this.state.modal.abierto ? <Modal abrir={this.state.modal} cerrar={this.onCerrarModal} rfs={this.props.rfs} idPITerr={this.state.idPITerr} evento={this.onActualizarMaco} datos={this.state.datos} /> : null}
            </div>
        );
    }
}

export default Encabezado;