//#region Componentes
import React, { Component } from 'react';
import Modal from './Ventana';
import { Badge } from 'reactstrap';
//#endregion
//#region Imágenes
import favDis_icon from '../imagenes/favDis_icon.png';
import gantt_icon from '../imagenes/gantt.png';
import viewAll from '../imagenes/viewAll.png';
import fav_icon from '../imagenes/fav_icon.png';
import viewAllDis from '../imagenes/viewAllDis.png';
import macob from '../imagenes/macoB.png';
import macob_eg from '../imagenes/macoB_EG.png';
import macoc from '../imagenes/macoC.png';
import macoc_eg from '../imagenes/macoC_EG.png';
import macox from '../imagenes/macoX.png';
import toGantt from '../imagenes/toGantt.png';
import toDashboard from '../imagenes/dashboard_icon.png';
//#endregion
//#region Estilos
import '../estilos/encabezado.css';
//#endregion

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
            esAdministrador: props.gruposUsuarioActual.some(x => x.NombreCortoGantt === 'EG')
        }
        this.state = this.inialState;
    }

    onCambiarVentana = (idVentana, mensaje, name, style) => {
        if (idVentana !== this.props.idVentana) {
            this.props.cambiarVentana(idVentana, mensaje, name, style, '', '', this.props.usuarioActual, this.props.gruposUsuarioActual, this.props.seguridad)
        }
    }

    onAbrirModal = (terreno, id, esTarea, campo, valor, fila, size, padding) => {
        if (id === 268 && this.props.rfs) {
            alert('No se puede cambiar el MACO porque ya se definió RFS. Para cambiarlo, envíe un ticket al área de sistemas.')
        } else {
            this.setState({
                modal: { abierto: true, id: id, terreno: terreno, esTarea: esTarea, filaSeleccionada: fila, size: size, padding: padding },
                datos: { campo: campo, valor: valor }
            })
        }
    }

    onActualizarMaco = nuevoMaco => {
        this.props.cambioMaco(nuevoMaco)
        this.setState({ maco: nuevoMaco })
    }

    onCerrarModal = () => {
        this.setState({ modal: this.inialState.modal })
    };

    render() {
        const { terreno, totalAdmin, totalNorm, totalProy, disabled, idVentana, maco, webs } = this.props
        const { esAdministrador } = this.state
        return (
            <div>
                <div className='container-fluid' style={{ paddingTop: "1%" }}>
                    <div className='row'>
                        <div className='col-sm-3 nombreTerreno'><label id='NombreTerreno'><b>{terreno}</b></label></div>
                        <div className='col-sm columna'>
                            <img id='FiltroFavoritos' className={this.props.filtros.favs.length === 0 ? 'normal' : 'presionado'} onClick={() => this.onCambiarVentana(5, disabled)} src={idVentana !== 4 ? fav_icon : favDis_icon} alt='favoritos_icon' disabled={disabled} title='Favoritos' ></img>
                            <img id='FiltroGantt' className={this.props.filtros.gantt.length === 0 ? 'normal' : 'presionado'} onClick={() => this.onCambiarVentana(6, false)} src={idVentana !== 4 ? gantt_icon : gantt_icon} alt='gantt_icon' disabled={false} title='Acts. Gantt' ></img>
                            <img id='FiltroVerTodo' className={this.props.filtros.ver.length === 0 ? 'normal' : 'presionado'} onClick={() => this.onCambiarVentana(7, disabled)} src={idVentana !== 4 ? viewAll : viewAllDis} alt='user_icon' disabled={disabled} title='Todas' ></img>
                            <img id='MACO' src={this.props.maco === '' || this.props.maco === null || this.props.maco === undefined ? macox : (idVentana === 4 ? (this.props.maco === 'B' ? macob_eg : macoc_eg) : (this.props.maco === 'B' ? macob : macoc))} alt='maco' onClick={idVentana === 4 ? () => { this.onAbrirModal(terreno, 268, false, 'radioChecked', maco, { Tarea: { ID: 268 } }, "", "190px") } : null} ></img>
                            <img id='ToGantt' onClick={() => this.onCambiarVentana(8)} src={toGantt} alt='toGantt' ></img>
                            <img id='ToDashboard' onClick={() => this.onCambiarVentana(9)} src={toDashboard} alt='toDashboard' ></img>
                        </div>
                        <div className='col-sm-5 menu'>
                            <nav className="navbar navbar-expand-sm bg-light navbar-light" style={{ padding: '0' }}>
                                <ul className="navbar-nav" style={{ borderBottomStyle: "solid", borderBottomColor: "#3C8891", textAlign: 'center' }}>
                                    <li name='admin' style={{ height: '35px', textAlign: "center" }} className={idVentana === 1 ? "nav-item active colorBlueMenu" : "bg-light nav-item colorNoMenu"} onClick={() => this.onCambiarVentana(1, 'Cargando contenido...', "genericoAdmin.css", "../estilos/genericoAdmin.css")}>
                                        {idVentana === 1 ?
                                            <label className="nav-link colorWhite">Administración <Badge color={idVentana === 1 ? "secondary" : ""}> {totalAdmin}</Badge></label> :
                                            <a className="nav-link disabled" href="#">Administración <Badge color={idVentana === 1 ? "secondary" : ""}>{totalAdmin}</Badge></a>
                                        }
                                    </li>
                                    <li name='norm' style={{ height: '35px', textAlign: "center" }} className={idVentana === 2 ? "nav-item active colorBlueMenu" : "bg-light nav-item colorNoMenu"} onClick={() => this.onCambiarVentana(2, 'Cargando contenido...', "genericoNorm.css", "../estilos/genericoNorm.css")}>
                                        {idVentana === 2 ?
                                            <label className="nav-link colorWhite">Normativo <Badge color={idVentana === 1 ? "secondary" : ""}>{totalNorm}</Badge></label> :
                                            <a className="nav-link disabled" href="#">Normativo <Badge color={idVentana === 1 ? "secondary" : ""}>{totalNorm}</Badge></a>
                                        }
                                    </li>
                                    <li name='proy' style={{ height: '35px', textAlign: "center" }} className={idVentana === 3 ? "nav-item active colorBlueMenu" : "bg-light nav-item colorNoMenu"} onClick={() => this.onCambiarVentana(3, 'Cargando contenido...', "genericoProy.css", "../estilos/genericoProy.css")}>
                                        {idVentana === 3 ?
                                            <label className="nav-link colorWhite">Proyectos <Badge color={idVentana === 1 ? "secondary" : ""}>{totalProy}</Badge></label> :
                                            <a className="nav-link disabled" href="#">Proyectos <Badge color={idVentana === 1 ? "secondary" : ""}>{totalProy}</Badge></a>
                                        }
                                    </li>
                                    <li name='eg' style={{ height: '35px', textAlign: "center" }} className={idVentana === 4 ? "nav-item active colorBlueMenu" : "bg-light nav-item colorNoMenu"} onClick={() => esAdministrador ? this.onCambiarVentana(4, 'Cargando contenido...', "genericoEG.css", "../estilos/genericoEG.css") : null}>
                                        {idVentana === 4 ?
                                            <label className="nav-link colorWhite">Estrategia de gestión</label> :
                                            <a className="nav-link disabled" href="#">Estrategia de gestión</a>
                                        }
                                    </li>
                                </ul>
                            </nav>
                            <hr className='hr' />
                        </div>
                    </div>
                </div>
                {this.state.modal.abierto && <Modal abrir={this.state.modal} cerrar={this.onCerrarModal} rfs={this.props.rfs} idPITerr={this.state.idPITerr} evento={this.onActualizarMaco} datos={this.state.datos} webs={webs} />}
            </div>
        );
    }
}

export default Encabezado;