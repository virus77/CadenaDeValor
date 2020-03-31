import React, { Component } from 'react';
import Modal from './Ventana';
import disabled_icon from '../imagenes/disabled.png';
import favoritos_icon from '../imagenes/favoritos_icon.png';
import gantt_icon from '../imagenes/gantt.png';
import viewAll from '../imagenes/viewAll.png';
import macob from '../imagenes/macoB.png';
import macoc from '../imagenes/macoC.png';
import macox from '../imagenes/macoX.png';
import toGantt from '../imagenes/toGantt.png';
import '../estilos/encabezado.css';
import { Badge, Button } from 'reactstrap';

class Encabezado extends Component {
    constructor(props) {
        super(props)
        this.inialState = {
            idPITerr: props.idPITerr,
            modal: {
                abierto: false,
                id: 0,
                terreno: '',
                esTarea:false
              },
            datos:{
                campo: '',
                valor:''
            },
            maco: props.maco,
        }
        this.state = this.inialState;
    }

    onCambiarVentana = (idVentana) =>{
        if(idVentana !== this.props.idVentana){
            this.props.cambiarVentana(idVentana, 'Cargando contenido...')
        }
    }

    onAbrirModal = (terreno, id, esTarea, campo, valor) => {
        this.setState({ modal: { abierto: true, id: id, terreno: terreno, esTarea: esTarea }, datos: { campo: campo, valor: valor } })
    }

    onActualizarMaco = nuevoMaco =>{
        this.props.cambioMaco(nuevoMaco.dato)
        this.setState({maco: nuevoMaco.dato})
    }

    onCerrarModal = () => {
        this.setState({ modal: this.inialState.modal })
    };

    render() {
        const { terreno, totalAdmin, totalNorm, totalProy, disabled, idVentana } = this.props
        return (
            <div>
                <div className='container-fluid'>
                    <div className='row'>
                    <div className='col-sm-3 nombreTerreno'><label id='NombreTerreno'><b>{terreno}</b></label></div>
                        <div className='col-sm-1 columna'><img id='FiltroFavoritos' onClick={() => this.onCambiarVentana(5)} src={idVentana !== 4 ? favoritos_icon : disabled_icon} alt='favoritos_icon' disabled={disabled} ></img></div>
                        <div className='col-sm-1 columna'><img id='FiltroGantt' onClick={() => this.onCambiarVentana(6)} src={idVentana !== 4 ? gantt_icon : disabled_icon} alt='gantt_icon' disabled={disabled} ></img></div>
                        <div className='col-sm-1 columna'><img id='FiltroVerTodo' onClick={() => this.onCambiarVentana(7)} src={idVentana !== 4 ? viewAll : disabled_icon} alt='user_icon' disabled={disabled} ></img></div>
                        <div className='col-sm-1 columna'><img id='MACO' src={this.state.maco === '' ? macox : (this.state.maco === 'B' ? macob : macoc)} alt='macob' onClick={() => { this.onAbrirModal(terreno, 268, false, 'radioChecked', this.state.maco) }} ></img></div>
                        <div className='col-sm-1 columna'><img id='ToGantt' onClick={() => this.onCambiarVentana(8)} src={toGantt} alt='toGantt' ></img></div>
                        <div className='col-sm-4 menu'>
                            <Button className={idVentana === 1 ? "btn btn-info btn-sm" : "btn btn-secondary btn-sm"} onClick={(e) => this.onCambiarVentana(1, e)}>
                                Administración <Badge color="secondary">{totalAdmin}</Badge>
                            </Button>
                            <Button name='norm' className={idVentana === 2 ? "btn btn-info btn-sm" : "btn btn-secondary btn-sm"} onClick={(e) => this.onCambiarVentana(2, e)}>
                                Normativo <Badge color="secondary">{totalNorm}</Badge>
                            </Button>
                            <Button name='proy' className={idVentana === 3 ? "btn btn-info btn-sm" : "btn btn-secondary btn-sm"} onClick={(e) => this.onCambiarVentana(3, e)}>
                                Proyectos <Badge color="secondary">{totalProy}</Badge>
                            </Button>
                            <Button name='eg' className={idVentana === 4 ? "btn btn-info btn-sm" : "btn btn-secondary btn-sm"} onClick={(e) => this.onCambiarVentana(4, e)}>
                                Estrategia de gestión
                            </Button>
                            <hr className='hr' />
                        </div>
                    </div>
                     {/* {idVentana === 4 ?
                        <div className='row'>
                            <div colSpan={7} className='col-sm egupload'>
                                <p>
                                    <img id='CargaEG' src={egupload_icon} alt='egupload_icon' onClick={() => { this.onAbrirModal(terreno, 269, false) }}></img>
                                    E. de G. autorizada
                                </p>
                            </div>
                        </div> : null
                    }*/}
                </div>
                {this.state.modal.abierto ? <Modal abrir = {this.state.modal} cerrar={this.onCerrarModal} rfs = {this.props.rfs} idPITerr = {this.state.idPITerr} evento = {this.onActualizarMaco} datos = {this.state.datos} /> : null}
            </div>
        );
    }
}

export default Encabezado;