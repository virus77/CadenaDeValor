import React, { Component } from 'react';
import arrow_down_icon from '../imagenes/arrow_down_icon.png';
import attach_icon from '../imagenes/attach_icon.png';
import more_details_icon from '../imagenes/more_details_icon.png';
import assignedTo_icon from '../imagenes/assignedTo_icon.png';
import plus_icon from '../imagenes/plus_icon.png';
import '../estilos/generico.css';
import {onSave, onSave2} from '../js/eg.js';

class Generico extends Component{
    constructor(props){
        super(props)
        this.inialState = {
            clusterStatus: [],
            checkedItems: []
        }
        this.state = this.inialState;
    }

    abrirModal = textoVentana=>{
        this.props.abrirModal(textoVentana);
    }

    onSeleccionarItem = event =>{
        if(event.target.checked){
            this.setState({checkedItems: this.state.checkedItems.concat([event.target.name])})
        }else{
            var array = [...this.state.checkedItems];
            var index = array.indexOf(event.target.name);
            if (index !== -1) {
                array.splice(index, 1);
                this.setState({checkedItems: array});
              }
        }
    }

    render(){
        const Cluster = (props) =>{
            if(props.titulos.length > 0){
                if(props.idVentana !== 4){
                    //Otras ventanas
                    const filaCluster = props.titulos.map((fila)=>{
                        return (
                            <div key={fila.cluster.IdTarea.Orden} className= 'titulo col-sm-12'>
                                <p>
                                    <img id='expandir' src={arrow_down_icon} alt='arrow_down_icon'></img>
                                    {fila.cluster.IdTarea.TxtCluster}
                                </p>
                                <Body datos = {props.datos} idCluster = {fila.cluster.IdTarea.Orden} />
                                <div className= 'row item-personal col-sm-12' onDoubleClick={()=>{ this.abrirModal('Nueva actividad personal')}}>Agregar nueva actividad personal</div>
                                <div className='row empty-space'></div>
                            </div>
                        )
                    });
                    return <div key={0} className="row">{filaCluster}</div>
                }else{
                    //Ventana de estrategia de gestión
                    const filaCluster = props.titulos.map((fila)=>{
                        return (
                            <div key={fila.cluster.Tarea.OrdenEG} className= 'titulo col-sm-12'>
                                <p>
                                    {fila.cluster.Tarea.Checkable === '1' ? <input type='checkbox' className='checkBox' ></input>: null}
                                    <img id='expandir' src={arrow_down_icon} alt='arrow_down_icon'></img>
                                    {fila.cluster.Tarea.TxtCluster}
                                </p>
                                <Body datos = {props.datos} idCluster = {fila.cluster.Tarea.OrdenEG} esCheckable = {fila.cluster.Tarea.Checkable}  />
                                <div className='row empty-space' ></div>
                            </div>
                        )
                    });
                    return <div key={0} className="row justify-content-end">{filaCluster}<input type='button' value='OK' className='btn btn-primary' onClick={()=>onSave2('otro texto')} /></div>
                }
            }else{
                return null
            }
        }
        const Columna = (props) =>{
            //Si abre el modal cuando se da doble clic
            if(props.editable){
                return(
                    <div className={props.estilo} onDoubleClick={()=>{ this.abrirModal(props.titulo )} } >{props.titulo}</div>
                );
            }else{
                return(
                    <div className={props.estilo} >{props.titulo}</div>
                );
            }
        }
        const Header = (props) =>{
            const filaHeader = props.datosVentana.columnas.map((fila, index)=>{
                return (
                    <Columna key={index} titulo= {fila.titulo } estilo = {fila.estilo } />
                )
            });
            return <div key={0} className="row">{filaHeader}</div>
        }

        const Body = (props) =>{
            if(props.idCluster >= 4){
                //Otras ventanas
                const filaBody = props.datos.datos.map((fila)=>{
                    if(fila.Tarea.OrdenEG === props.idCluster){
                        return (
                            <div key ={fila.ID} className="row item">
                                {props.esCheckable === '1' ? <input type='checkbox' name={fila.Tarea.ID} className='checkBox-sm' defaultChecked={fila.Seleccionado} onChange={this.onSeleccionarItem} ></input>: null}
                                <Columna key={fila.Tarea.ID} titulo= {fila.Tarea.Title } estilo = 'col-sm' editable= { props.esCheckable === '1' ? false: true} />
                                <Columna titulo= {fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo = 'col-sm' editable= {false} />
                                <Columna titulo= {<p><img title={fila.AsignadoA !== undefined ? fila.AsignadoA : 'Sin asignar'} src= {fila.AsignadoA !== undefined ? assignedTo_icon : plus_icon} alt='assignedTo_icon' /></p> } estilo = 'col-sm' editable= {false} />
                            </div>
                        )
                    }else{
                        return null
                    }
                });
                return filaBody
            }else{
                //Estrategia de gestión
                const filaBody = props.datos.datos.map((fila)=>{
                    if(fila.IdTarea.Orden === props.idCluster){
                        return (
                            <div key ={fila.ID} className="row item">
                                <Columna titulo= {fila.IdTarea.Title } estilo = 'col-sm-5' editable= {true} />
                                <Columna titulo= {fila.GrupoResponsable !== undefined ? fila.GrupoResponsable.NombreCortoGantt : 'Sin asignar'} estilo = 'col-sm-1' editable= {false} />
                                <Columna titulo= {<p><img title={fila.AsignadoA !== undefined ? fila.AsignadoA : 'Sin asignar'} src= {fila.AsignadoA !== undefined ? assignedTo_icon : plus_icon} alt='assignedTo_icon' /></p> } estilo = 'col-sm-1' editable= {false} />
                                <Columna titulo= {fila.LineaBase !== null ? fila.LineaBase : <p><img title='Agregar' src= {plus_icon} alt='plus_icon' /></p>} estilo = 'col-sm-1' editable= {false} />
                                <Columna titulo= {fila.FechaEstimada !== null ? fila.FechaEstimada : <p><img title='Agregar' src= {plus_icon} alt='plus_icon' /></p>} estilo = 'col-sm-1' editable= {false} />
                                <Columna titulo= {fila.Estatus.Title} estilo = 'col-sm-1' editable= {false} />
                                <Columna titulo= {<img src= {attach_icon} alt='attach_icon' />} estilo = 'col-sm-1' editable= {false} />
                                <Columna titulo= {<img src= {more_details_icon} alt='more_details_icon' />} estilo = 'col-sm-1' editable= {true} />
                            </div>
                        )
                    }else{
                        return null
                    }
                });
                return filaBody
            }
        }

        return(
            <div>
                <div className='container-fluid'>
                    <Header datosVentana= {this.props.datosVentana} />
                    <Cluster titulos = {this.props.clusters} idVentana = {this.props.idVentana} datos = {this.props.datosVentana} />
                </div>
            </div>
        );
    }
}

export default Generico;