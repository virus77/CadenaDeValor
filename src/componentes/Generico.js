import React, { Component } from 'react';
import arrow_down_icon from '../imagenes/arrow_down_icon.png';
import '../estilos/encabezado.css';

class Generico extends Component{
    render(){
        const Columna = (props) =>{
            return(
                <td>{props.titulo}</td>
            );
        }
        const Header = (props) =>{
            const filaHeader = props.ventanaEg.columnas.map((fila)=>{
                return (
                    <Columna titulo= {fila.titulo } />
                )
            });
            return <thead><tr key={0} className="HeaderAcc">{filaHeader}</tr></thead>
        }

        const Body = (props) =>{
            const filaBody = props.ventanaEg.datos.map((fila)=>{
                return (
                    <tr key ={fila.ID} className="table table-striped table-bordered table-hover">
                        <Columna titulo= {fila.Title } />
                        <Columna titulo= {fila.Grupo.NombreCortoGantt } />
                        <Columna titulo= 'Sin datos' />
                    </tr>
                )
            });
            return <tbody>{filaBody}</tbody>
        }

        return(
            <div>
                <table className='contenedor'>
                    <Header ventanaEg= {this.props.ventanaEg} />
                    <Body ventanaEg= {this.props.ventanaEg} />
                    {/*<tbody>
                        <tr>
                            <td colSpan='3' className='cluster'>
                                <p>
                                    <img id='expandir' src={arrow_down_icon} alt='arrow_down_icon'></img>
                                    Rectificación de linderos
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan='3' className='filaTerreno'>Nombre del terreno</td>
                        </tr>
                        <tr className='filaActividad'>
                            <td className='columnaActividad'>Plano topografico</td>
                            <td>Arq</td>
                            <td>Icono</td>
                        </tr>
                        <tr className='filaActividad'>
                            <td className='columnaActividad'>Documento SEDUVI</td>
                            <td>NT</td>
                            <td>Icono</td>
                        </tr>
                    </tbody>*/}
                </table>
            </div>
        );
    }
}

export default Generico;