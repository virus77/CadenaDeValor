import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';
import '../estilos/modal.css';
//import Modal from "react-responsive-modal";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.css';

class Ventana extends Component {

    constructor(props) {
        super(props);
        this.state = { modal: false, name: '', team: '', country: '' };

        this.toggle = this.toggle.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);
        this.handleChangeTeam = this.handleChangeTeam.bind(this);
        this.handleChangeCountry = this.handleChangeCountry.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }
    handleChangeName(event) {
        this.setState({ name: event.target.value });
    }
    handleChangeTeam(event) {
        this.setState({ team: event.target.value });
    }
    handleChangeCountry(event) {
        this.setState({ country: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    render() {
        const { lgShow, setLgShow } = this.state
        return (
            <div>
                <h1>React Bootstrap Modal Example</h1>
                <Button color="success" onClick={this.toggle}>React Modal</Button>
                <Modal isOpen={this.state.modal}>
                    <form onSubmit={this.handleSubmit}>
                        <ModalHeader>IPL 2018</ModalHeader>
                        <ModalBody>
                            <div className="row">
                                <div className="form-group col-md-4">
                                    <label>Name:</label>
                                    <input type="text" value={this.state.name} onChange={this.handleChangeName} className="form-control" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="form-group col-md-4">
                                    <label>Team:</label>
                                    <input type="text" value={this.state.team} onChange={this.handleChangeTeam} className="form-control" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="form-group col-md-4">
                                    <label>Country:</label>
                                    <input type="text" value={this.country} onChange={this.handleChangeCountry} className="form-control" />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <input type="submit" value="Submit" color="primary" className="btn btn-primary" />
                            <Button color="danger" onClick={this.toggle}>Cancel</Button>
                        </ModalFooter>
                    </form>
                </Modal>
                {/*  <Modal open={this.props.open[0].showModal} onClose={this.props.cerrar} closeOnEsc={false} closeOnOverlayClick={false} closeIconSize={20}>
                    <div className='encabezado'>{this.props.open[0].encabezado}</div>
                    <div className='datoTerreno'>{this.props.open[0].terreno}</div>
                    <div className='cuerpo'>
                        Aquí va el contenido
                    </div>
                    <div className='pie'>
                        <input type='button' value='Guardar'></input>
                    </div>
                </Modal>*/}
            </div >
        );
    }
}

export default Ventana;