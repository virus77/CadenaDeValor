import React from 'react';
import "../estilos/Principal.css"

const TableBody = (props) => {
    const indice = props.indice
    const filas = props.itemsData.map((fila, index) => {
        if (indice.ID === fila.IdProyectoInversion.ID) {
            let date = new Date(fila.Modified);
            let RFS = fila.Title;
            RFS = RFS.substring(0, 2);
            RFS = RFS === "T-" ? false : true;
<<<<<<< HEAD
            var txtTerreno = RFS === false ? fila.IdProyectoInversion.NombreProyectoInversion : fila.NombredelTerreno2;
=======
            let txtTerreno = !RFS ? fila.IdProyectoInversion.NombreProyectoInversion : fila.NombredelTerreno2;
>>>>>>> 523f3bf3eb3973cf4d095b6252c4078d00ae4d4b
            return (
                <tr key={fila.ID} onClick={() => props.selecciontereno(fila.ID, fila.IdProyectoInversion.ID, txtTerreno,
                    fila.MACO, RFS, fila.Title, fila.IdProyectoInversion.Title)}>
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