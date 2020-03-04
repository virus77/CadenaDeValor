import React from 'react';
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

const Encabezado = (props) => {
    const {terreno} = props;

    return (
        <div>
            <table className='tabla'>
                <thead>
                </thead>
                <tbody>
                    <tr>
                        <td className='nombreTerreno'><label id='NombreTerreno'><b>{ terreno.NombredelTerreno2 }</b></label></td>
                        <td className='columna'><img id='FiltroFavoritos' src={favoritos_icon} alt='favoritos_icon' ></img></td>
                        <td className='columna'><img id='FiltroGantt' src={gantt_icon} alt='gantt_icon' ></img></td>
                        <td className='columna'><img id='FiltroVerTodo' src={user_icon} alt='user_icon' ></img></td>
                        <td className='columna'><img id='MACO' src={macob} alt='macob' ></img></td>
                        <td className='columna'><img id='ToGantt' src={external_icon} alt='external_icon' ></img></td>
                        <td className='menu'>
                            <input type='button' id='btn_administracion' className='boton' value='Administración'></input>
                            <input type='button' id='btn_normativo' className='boton' value='Normativo'></input>
                            <input type='button' id='btn_proyectos' className='boton' value='Proyectos'></input>
                            <input type='button' id='btn_eg' className='boton' value='Estrategia de gestión'></input>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={7} className='egupload'>
                            <p>
                                <img id='CargaEG' src={egupload_icon} alt='egupload_icon' ></img>
                                E. de G. autorizada
                            </p>
                        </td>
                    </tr>
                </tbody>
                
            </table>
        </div>
      );
}

export default Encabezado;