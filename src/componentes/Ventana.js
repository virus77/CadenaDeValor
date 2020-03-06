import React, {Component} from 'react';
import '../estilos/modal.css';
import Modal from "react-responsive-modal";

class Ventana extends Component{
    render(){
        return(
            <div>
                <Modal open={this.props.open[0].showModal} onClose={this.props.cerrar} closeOnEsc={false} closeOnOverlayClick={false} closeIconSize={20}>
                    <div className='encabezado'>{this.props.open[0].encabezado}</div>
                    <div className='datoTerreno'>{this.props.open[0].terreno}</div>
                    <div className='cuerpo'>
                        Aquí va el contenido
                    </div>
                    <div className='pie'>
                        <input type='button' value='Guardar'></input>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default Ventana;