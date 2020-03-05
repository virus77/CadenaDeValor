import React, { Component } from 'react';
import arrow_down_icon from '../imagenes/arrow_down_icon.png';
import '../estilos/encabezado.css';

class Generico extends Component{
    render(){
        return(
            <div>
                <table className='contenedor'>
                    <thead>
                        <tr>
                            <td></td>
                            <td>Grupo responsable</td>
                            <td>Asignados</td>
                        </tr>
                    </thead>
                    <tbody>
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
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Generico;