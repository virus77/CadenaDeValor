import { sp } from "@pnp/sp";

export async function onSave(elementos){
    elementos.forEach(elemento => {
        if(elemento.cambio){
            if(elemento.datos.IdFlujoTareasID == null){
                //Crea la tarea en flujo tareas
                sp.web.lists.getByTitle("Flujo Tareas").items.add({
                    IdProyectoInversion: elemento.datos.IdProyectoInversion.ID,
                    IdTarea: elemento.datos.Tarea.ID,
                    Terreno: elemento.datos.Terreno.ID,
                    GrupoResponsable: elemento.datos.Grupo.ID,
                    AsignadoA: elemento.datos.AsignadoA,
                    Estatus: 1,
                    Visible: true
                }).then(a=>{
                    sp.web.lists.getByTitle("EstrategiaGestion").items.getById(elemento.datos.ID).update({
                        Seleccionado: elemento.datos.Seleccionado,
                        IdFlujoTareas: a.ID
                    }).then(u=>{
                        elemento.datos.IdFlujoTareas = a.ID
                    });
                });
            }else{
                //Actualiza la tarea en flujo tareas
                sp.web.lists.getByTitle("Flujo Tareas").items.getById(elemento.datos.IdFlujoTareas).update({
                    AsignadoA: elemento.AsignadoA,
                    Visible: !elemento.datos.Seleccionado
                }).then(u=>{
                    //Establece como seleccionado en la lista de EG
                    sp.web.lists.getByTitle("EstrategiaGestion").items.getById(elemento.datos.ID).update({
                        Seleccionado: !elemento.datos.Seleccionado
                    });
                });
            }
        }
    });
}