import React from 'react';
import "../estilos/Principal.css"

const TableBody = (props) => {
    const indice = props.indice
    const filas = props.itemsData.map((fila) => {
        if (indice.ID === fila.IdProyectoInversion.ID) {
            let date = new Date(fila.Modified);
            let RFS = fila.Title;
            RFS = RFS.substring(0, 2);
            RFS = RFS === "T-" ? false : true;
            let txtTerreno = fila.NombredelTerreno2 === fila.NombredelTerreno ? fila.NombredelTerreno : fila.NombredelTerreno2;
            return (
                <tr className='row' key={fila.ID} onClick={() => props.selecciontereno(fila.ID, fila.IdProyectoInversion.ID, txtTerreno,
                    fila.MACO, RFS, fila.Title, fila.IdProyectoInversion.Title)}>
                    <td className='col-sm-1'>{fila.ID}</td>
                    <td className='col-sm-1'>{fila.Title}</td>
                    <td className='col-sm-9'>{fila.NombredelTerreno2}</td>
                    <td className='col-sm-1'>{date.getDay().toString().length > 1 ? date.getDay() : "0" + date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear()}</td>
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
            <TableBody selecciontereno={selecciontereno} itemsData={itemsData} indice={indice} />
        </table>
    )
}

export default Tabla