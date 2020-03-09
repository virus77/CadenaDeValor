import React from 'react';
import "../estilos/Principal.css"

/*const TableHeader = () => {
    return (
        <thead>
            <tr>
                <th>ID</th>
                <th>Título</th>
            </tr>
        </thead>
    )
}*/

const TableBody = (props) => {
    const indice = props.indice
    var id = -1;
    const filas = props.itemsData.map((fila, index) => {
        if (indice.ID === fila.IdProyectoInversion.ID) {
            var date = new Date(fila.Modified);
            return (
                <tr  key={fila.ID} onClick={() => props.selecciontereno(fila.ID, fila.NombredelTerreno2)}>
                    <td>{fila.ID}</td>
                    <td>{fila.Title}</td>
                    <td>{fila.NombredelTerreno2}</td>
                    <td>{date.getDay().toString().length > 1 ? date.getDay() : "0" + date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear()}</td>
                </tr>
            )
        }
    })
    return <tbody>{filas}</tbody>
}

const Tabla = (props) => {
    const { selecciontereno, itemsData, indice } = props
    return (
        <table className="table table-striped table-bordered table-hover">
            {/*<TableHeader />*/}
            <TableBody selecciontereno={selecciontereno} itemsData={itemsData} indice={indice} />
        </table>
    )
}

export default Tabla