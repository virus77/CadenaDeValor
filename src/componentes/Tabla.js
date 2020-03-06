import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../estilos/Principal.css"

const TableHeader = () => {
    return (
        <thead>
            <tr>
                <th>ID</th>
                <th>Título</th>
            </tr>
        </thead>
    )
}

function abrirCompra() {
    alert("Sitio de compra");
}

const TableBody = (props) => {
    const indice = props.indice
    var id = -1;
    const filas = props.itemsData.map((fila, index) => {
        if (fila.IdTerreno.ID !== id) {
            if (indice.ID === fila.IdProyectoInversion.ID) {
                id = fila.IdTerreno.ID
                var date = new Date(fila.Modified);

                return (
                    <tr onClick={abrirCompra} key={fila.IdTerreno.ID}>
                        <td>{fila.IdTerreno.ID}</td>
                        <td>{fila.IdTerreno.NombredelTerreno}</td>
                        <td>{fila.IdTarea.ID}</td>
                        <td>{fila.IdTarea.Title}</td>
                        <td>{fila.Estatus.Title}</td>
                        <td>{fila.Editor.Title}</td>
                        <td>{date.getDay().toString().length > 1 ? date.getDay() : "0" + date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear()}</td>
                    </tr>
                )
            }
        }
    })
    return <tbody>{filas}</tbody>
}

const Tabla = (props) => {
    const { itemsData, indice } = props
    return (
        <table className="table table-striped table-bordered table-hover">
            <TableHeader />
            <TableBody itemsData={itemsData} indice={indice} />
        </table>
    )
}

export default Tabla