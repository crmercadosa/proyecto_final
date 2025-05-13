sap.ui.define([
    "com/inv/sapfioriwebinvestments/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
    "use strict";

    return BaseController.extend("com.inv.sapfioriwebinvestments.controller.Users", {
        onInit: function () {
            var oModel = new JSONModel();
            oModel.loadData("./resources/jsons/securityNavItems.json"); 
            this.getView().setModel(oModel, "usersNavModel");

             // También podrías manejar el estado inicial del NavContainer aquí si es necesario
            this.oNavContainer = this.byId("IdNavContainer1Users");

        },

                // Este es el método que se ejecutará cuando selecciones un ítem en el menú
        onItemSelect: function(oEvent) {
            var selectedKey = oEvent.getParameter("item").getKey(); // O usa getSelectedKey() si tienes un control de tipo select
            this.navigateToPage(selectedKey);
        },

        navigateToPage: function(selectedKey) {
            // Usamos el NavContainer para cambiar la página dependiendo del key seleccionado
            switch (selectedKey) {
                case "page20":
                    this.oNavContainer.to(this.byId("page20"));
                    break;
                case "page30":
                    this.oNavContainer.to(this.byId("page30"));
                    break;
                // Agregar más casos si tienes más páginas
            }
        },

        onMenuButtonPress: function() {
            var toolPage = this.byId("IdToolPage1Users");
            toolPage.setSideExpanded(!toolPage.getSideExpanded());
        },

        onAvatarPress: function () {
            var oPopover = this.byId("profilePopover");
            oPopover.openBy(this.byId("IdAvatar1Usuarios")); // Abre el popover junto al avatar
        },

        // Maneja la acción cuando se presiona "Cerrar sesión"
        onLogoutPress: function () {
            // Aquí implementas la lógica para cerrar sesión, como eliminar el token de sesión, redirigir a la pantalla de login, etc.
            MessageToast.show("Cerrando sesión");
        }

    });
});
