import React, { Component } from 'react';
import * as ReactDOM from 'react-dom';
import { Accordion, Icon } from 'semantic-ui-react'
import { sp } from '@pnp/sp';
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { _SharePointQueryable } from '@pnp/sp/sharepointqueryable';
import "../estilos/Principal.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import Tabla from './Tabla';

class Principal extends Component {

    async componentDidMount() {
        //var listItemsT = await sp.web.lists.getByTitle("Flujo Tareas").views.getbytitle('MyView').items
        var listItemsT = await sp.web.lists.getByTitle("Flujo Tareas").items
            .select("ID", "Modified", "IdProyectoInversion/ID", "IdProyectoInversion/NombreProyectoInversion",
                "IdTerreno/ID", "IdTerreno/NombredelTerreno", "IdTarea/ID", "IdTarea/Title", "Estatus/Title",
                "Editor/Title")
            .expand("IdProyectoInversion", "IdTerreno", "IdTarea", "Estatus", "Editor")
            .filter("(IdTerreno/Empadronamiento eq null) and (IdTerreno/ID ne null)")
            .orderBy("IdTarea/ID", true)
            .getAll();

        listItemsT.sort(function (a, b) {
            if (a.IdTerreno.ID > b.IdTerreno.ID)
                return 1;
            if (a.IdTerreno.ID < b.IdTerreno.ID)
                return -1;

            return 0;
        });
        this.setState({ itemsT: listItemsT });

        var listItemsPI = await sp.web.lists.getByTitle("Proyecto Inversion").items
            .select("ID", "NombreProyectoInversion").orderBy("ID", false)
            .getAll();

        listItemsPI.sort(function (a, b) {
            if (a.NombreProyectoInversion > b.NombreProyectoInversion)
                return 1;
            if (a.NombreProyectoInversion < b.NombreProyectoInversion)
                return -1;

            return 0;
        });
        this.setState({ itemsPI: listItemsPI });

    }

    state = {
        itemsT: [],
        itemsPI: [],
        activeIndex: 0,
        isActive: false,
        idPI: 0
    };

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

        const { activeIndex, itemsT, itemsPI } = this.state

        { this.styleLink() }

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
                        <Accordion.Content active={activeIndex === index}>
                            <div><Tabla itemsData={itemsT} indice={item} /></div>
                        </Accordion.Content>
                    </Accordion>

                    <div id={"root"}></div>
                </div>
            ))
        )
    };
}

export default Principal