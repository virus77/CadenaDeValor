const util = {
    //Inicializa el arreglo de datos de actividades
    inicializarArregloDatos: function(idVentana, arreglo){
        return idVentana === 4 ? {
                                    columnas: [
                                        { titulo: '', interN: '', Arreglo: "", estilo: 'col-sm-6' },
                                        { titulo: 'Responsable', interN: 'GrupoResponsable', value: 'NombreCortoGantt', Tipo: "EG", Arreglo: arreglo, estilo: 'col-sm-2' },
                                        { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "EG", Arreglo: arreglo, estilo: 'col-sm-2' },
                                        { titulo: 'E. de G. autorizada', Arreglo: "", estilo: 'col-sm-2' }
                                    ],
                                    datos: []
                                }
                            :
                                {
                                    columnas: [
                                        { titulo: '', interN: '', value: '', Tipo: "Act", Arreglo: '', estilo: 'col-sm-4' },
                                        { titulo: 'Responsable', interN: 'GrupoResponsable', Tipo: "Act", value: 'NombreCortoGantt', Arreglo: arreglo, estilo: 'col-sm-1' },
                                        { titulo: 'Asignado a', interN: 'AsignadoA', value: 'Title', Tipo: "Act", Arreglo: arreglo, estilo: 'col-sm-1' },
                                        { titulo: 'Linea base', interN: 'LineaBase', value: 'Title', Tipo: "Act", Arreglo: arreglo, estilo: 'col-sm-1' },
                                        { titulo: 'F. estimada', interN: 'FechaEstimada', value: 'Title', Tipo: "Act", Arreglo: arreglo, estilo: 'col-sm-1' },
                                        { titulo: 'Estatus', interN: 'Estatus', value: 'Title', Tipo: "Estatus", Arreglo: arreglo, estilo: 'col-sm-1' },
                                        { titulo: 'Adjunto', interN: 'Adjunto', value: 'Adjunto', Tipo: "Act", Arreglo: arreglo, estilo: 'col-sm-1' },
                                        { titulo: 'Detalle', interN: 'Detalle', value: 'Detalle', Tipo: "Act", Arreglo: arreglo, estilo: 'col-sm-1' },
                                        { titulo: 'Favoritos', interN: 'Favoritos', Tipo: "Act", value: 'Favoritos', Arreglo: arreglo, estilo: 'col-sm-1' }
                                    ],
                                    datos: []
                                }
    },
    //Rellena una cadena hasta el tamaño indicado con el carácter indicado por su parte izquierda
    padLeft: function (data,size,paddingChar) {
        return (new Array(size + 1).join(paddingChar || '0') + String(data)).slice(-size);
    },
    asyncForEach: async function (array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    },
    //Inicializa el estato filtrosTabla
    limpiarFiltrosTabla: function(){
        return {
            eg:[],
            acts: [],
            responsable: '',
            asignadoa: '',
            lineabase: '',
            festimada: '',
            estatus: ''
        }
    },
    //Convierte una cadena a un formato de fecha válido
    spDate: function (value) {
        if (value != null) {
            var date = value.substring(0, 10);
            if (date.substring(4, 5) === '-') {
                var separate = date.split('-');
                var newDate = separate[2] + "/" + separate[1] + "/" + separate[0];
                value = newDate;
            }
        }
        return newDate;
    }
}

export default util;