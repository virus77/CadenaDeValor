import React, { Component } from 'react';
import arrow_down_icon from '../imagenes/arrow_down_icon.png';
import attach_icon from '../imagenes/attach_icon.png';
import more_details_icon from '../imagenes/more_details_icon.png';
import assignedTo_icon from '../imagenes/assignedTo_icon.png';
import plus_icon from '../imagenes/plus_icon.png';
import '../estilos/generico.css';
//import {onSave} from '../js/eg.js';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

var checkedItems = [];
class Generico extends Component {
    constructor(props) {
        super(props)
        this.inialState = {
            clusterStatus: []
        }
        this.state = this.inialState;
    }

    abrirModal = (id, esTarea) => {
        this.props.abrirModal(id, esTarea);
    }

    onSeleccionarItem = (event, idElemento) => {
        const indice = checkedItems.findIndex((obj => obj.datos.ID === idElemento));
        if (indice !== -1) {
            checkedItems[indice].datos.Seleccionado = event.target.checked;
            checkedItems[indice].cambio = !checkedItems[indice].cambio;
        }
    }

    onSave = async elementos => {
        elementos.forEach(async elemento => {
            if (elemento.cambio) {
                if (elemento.datos.IdFlujoTareasId === null) {
                    //Crea la tarea en flujo tareas
                    await sp.web.lists.getByTitle("Flujo Tareas").items.add({
                        IdProyectoInversionId: elemento.datos.ProyectoInversion.ID,
                        IdTareaId: elemento.datos.Tarea.ID,
                        IdTerrenoId: elemento.datos.Terreno.ID,
                        NivelId: 2,
                        GrupoResponsableId: elemento.datos.GrupoResponsable.ID,
                        AsignadoAId: elemento.datos.AsignadoA !== undefined ? elemento.datos.AsignadoA : { results: [] },
                        EstatusId: 1,
                        Visible: true
                    }).then(async a => {
                        await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(elemento.datos.ID).update({
                            Seleccionado: elemento.datos.Seleccionado,
                            IdFlujoTareasId: a.data.Id
                        }).then(u => {
                            const indice = checkedItems.findIndex((obj => obj.datos.ID === elemento.datos.ID));
                            if (indice !== -1) {
                                checkedItems[indice].datos.IdFlujoTareasId = a.data.Id
                            }
                        });
                    });
                } else {
                    //Actualiza la tarea en flujo tareas
                    await sp.web.lists.getByTitle("Flujo Tareas").items.getById(elemento.datos.IdFlujoTareasId).update({
                        AsignadoA: elemento.datos.AsignadoA !== undefined ? elemento.datos.AsignadoA : { results: [] },
                        Visible: elemento.datos.Seleccionado
                    }).then(async u => {
                        //Establece como seleccionado en la lista de EG
                        await sp.web.lists.getByTitle("EstrategiaGestion").items.getById(elemento.datos.ID).update({
                            Seleccionado: elemento.datos.Seleccionado
                        });
                    });
                }
            }
        });
    }

    render() {
        const Cluster = (props) => {
            if (props.titulos.length > 0) {
                if (props.idVentana !== 4) {
                    //Otras ventanas
                    const filaCluster = props.titulos.map((fila) => {
                        return (
                            <div key={fila.cluster.IdTarea.Orden} className='titulo col-sm-12'>
                                <p>
                                    <img id='expandir' src={arrow_down_icon} alt='arrow_down_icon'></img>
                                    {fila.cluster.IdTarea.TxtCluster}
                                </p>
                                <Body datos={props.datos} idCluster={fila.cluster.IdTarea.Orden} />
                                <div className='row item-personal col-sm-12' onDoubleClick={() => { this.abrirModal('Nueva actividad personal') }}>Agregar nueva actividad personal</div>
                                <div className='row empty-space'></div>
                            </div>
                        )
                    });
                    return <div key={0} className="row">{filaCluster}</div>
                } else {
                    //Ventana de estrategia de gestión
                    const filaCluster = props.titulos.map((fila) => {
                        return (
                            <div key={fila.cluster.Tarea.OrdenEG} className='titulo col-sm-12'>
                                <p>
                                    {fila.cluster.Tarea.Checkable === '1' ? <input type='checkbox' className='checkBox' ></input> : null}
                                    <img id='expandir' src={arrow_down_icon} alt='arrow_down_icon'></img>
                                    {fila.cluster.Tarea.TxtCluster}
                                </p>
                                <Body datos={props.datos} idCluster={fila.cluster.Tarea.OrdenEG} esCheckable={fila.cluster.Tarea.Checkable} />
                                <div className='row item-personal col-sm-12' onDoubleClick={() => { this.abrirModal('Nueva actividad personal') }}>Agregar nueva actividad personal</div>
                                <div className='row empty-space' ></div>
                            </div>
                        )
                    });
                    //return <div key={0} className="row justify-content-end">{filaCluster}<input type='button' value='OK' className='btn btn-primary' onClick={()=>onSave(checkedItems)} /></div>
                    return <div key={0} className="row justify-content-end">{filaCluster}<input type='button' value='OK' className='btn btn-primary' onClick={() => this.onSave(checkedItems)} /></div>
                }
            } else {
                return null
            }
        }
        const Columna = (props) => {
            //Si abre el modal cuando se da doble clic
            if (props.editable) {
                return (
                    <div className={props.estilo} onDoubleClick={() => { this.abrirModal(props.idElemento, props.esTarea) }} >{props.titulo}</div>
                );
            } else {
                return (
                    <div className={props.estilo} >{props.titulo}</div>
                );
            }
        }
        const Header = (props) => {
            const filaHeader = props.datosVentana.columnas.map((fila, index) => {
                return (
                    <Columna key={index} titulo={fila.titulo} estilo={fila.estilo} />
                )
            });
            return <div key={0} className="row">{filaHeader}</div>
        }

        const Body = (props) => {
            if (props.idCluster >= 4) {
                //Estrategia de gestión
                const filaBody = props.datos.datos.map((fila) => {
                    if (fila.Tarea.OrdenEG === props.idCluster) {
                        if (props.esCheckable) {
                            checkedItems = checkedItems.concat({ datos: fila, cambio: false })
                        }
                        return (
                            <div key={fila.ID} className="row item">
                                {props.esCheckable === '1' ? <input type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={(e) => this.onSeleccionarItem(e, fila.ID)} ></input> : null}
                                <Columna key={fila.Tarea.ID} titulo={fila.Tarea.Title} estilo='col-sm' editable={props.esCheckable === '1' ? false : true} />
                                <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm' editable={false} />
                                <Columna titulo={<p><img title={fila.AsignadoA !== undefined ? fila.AsignadoA : 'Sin asignar'} src={fila.AsignadoA !== undefined ? assignedTo_icon : plus_icon} alt='assignedTo_icon' /></p>} estilo='col-sm' editable={false} />
                            </div>
                        )
                    } else {
                        return null
                    }
                });
                return filaBody
            } else {
                //Otras ventanas
                const filaBody = props.datos.datos.map((fila) => {
                    if (fila.IdTarea.Orden === props.idCluster) {
                        return (
                            <div key={fila.ID} className="row item">
                                <Columna titulo={fila.IdTarea.Title} estilo='col-sm-5' editable={true} idElemento={fila.ID} esTarea={true} />
                                <Columna titulo={fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo='col-sm-1' editable={false} />
                                <Columna titulo={<p><img title={fila.AsignadoA !== undefined ? fila.AsignadoA : 'Sin asignar'} src={fila.AsignadoA !== undefined ? assignedTo_icon : plus_icon} alt='assignedTo_icon' /></p>} estilo='col-sm-1' editable={false} />
                                <Columna titulo={fila.LineaBase !== null ? fila.LineaBase : <p><img title='Agregar' src={plus_icon} alt='plus_icon' /></p>} estilo='col-sm-1' editable={false} />
                                <Columna titulo={fila.FechaEstimada !== null ? fila.FechaEstimada : <p><img title='Agregar' src={plus_icon} alt='plus_icon' /></p>} estilo='col-sm-1' editable={false} />
                                <Columna titulo={fila.Estatus.Title} estilo='col-sm-1' editable={false} />
                                <Columna titulo={<img src={attach_icon} alt='attach_icon' />} estilo='col-sm-1' editable={false} />
                                <Columna titulo={<img src={more_details_icon} alt='more_details_icon' />} estilo='col-sm-1' editable={true} />
                            </div>
                        )
                    } else {
                        return null
                    }
                });
                return filaBody
            }
        }

        return (
            <div>
                <div className='container-fluid'>
                    <Header datosVentana={this.props.datosVentana} />
                    <Cluster titulos={this.props.clusters} idVentana={this.props.idVentana} datos={this.props.datosVentana} />
                </div>
            </div>
        );
    }
}

export default Generico;