sap.ui.define([
    "com/inv/sapfioriwebinvestments/controller/BaseController",  // Importación del controlador base
    "sap/ui/model/json/JSONModel"  // Importación del modelo JSON
], 
function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("com.inv.sapfioriwebinvestments.controller.Users.pages.RolesManage", {
        //*FIC: Evento inicial del controlador
        onInit: function () {
            // Aquí puedes inicializar cosas cuando se cargue la vista
        }

        //*FIC: Otros controladores de eventos
        // Aquí agregarías funciones adicionales para gestionar otros eventos (ej. botones, selección de fila, etc.)
    });
});