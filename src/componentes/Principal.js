import React, { Component } from 'react';
import { Accordion, Icon } from 'semantic-ui-react'
import "../estilos/Principal.css"
import Tabla from './Tabla';

class Principal extends Component {
    constructor(props) {
        super(props);
        //this.initialState = { activeIndex: 0, isActive: false }
        this.initialState = { activeIndex: -1, isActive: false }
        this.state = this.initialState;
    }

    handleClick = (e, titleProps) => {
        const { index } = titleProps
        const { activeIndex } = this.state
        const newIndex = activeIndex === index ? -1 : index
        this.setState({ activeIndex: newIndex })
    }

    styleLink = () => {
        const styleLink = document.createElement("link");
        styleLink.rel = "stylesheet";
        styleLink.href = "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
        document.head.appendChild(styleLink);
    }

    render() {

        const { activeIndex } = this.state
        const { selecciontereno, itemsT, itemsPI } = this.props
        this.styleLink()

        return (
            itemsPI.map((item, index) => (
                <div>
                    <Accordion styled>
                        <Accordion.Title
                            active={activeIndex === index}
                            index={index}
                            onClick={this.handleClick} className="HeaderAcc">
                            <Icon name='dropdown' />
                            {item.NombreProyectoInversion}
                        </Accordion.Title>
                        <Accordion.Content active={activeIndex !== index}>
                            <div><Tabla selecciontereno={selecciontereno} itemsData={itemsT} indice={item} /></div>
                        </Accordion.Content>
                    </Accordion>
                    <div id={"root"}></div>
                </div>
            ))
        )
    };
}

export default Principal