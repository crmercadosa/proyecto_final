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
                case "page40":
                    this.oNavContainer.to(this.byId("page40"));
                    break;
                case "page50":
                    this.oNavContainer.to(this.byId("page50"));
                    break;
                // Agregar más casos si tienes más páginas
            }
        },

        onMenuButtonPress: function() {
            var toolPage = this.byId("IdToolPage1Users");
            toolPage.setSideExpanded(!toolPage.getSideExpanded());
        },

        onAvatarPress: function () {
            let oMyAvatar = this.getView().byId("IdAvatar1Usuarios");

            oMyAvatar.setActive(!oMyAvatar.getActive());

            // Create a popover with the menu
            let oPopover = new sap.m.Popover({
                title: "Opciones",
                placement: sap.m.PlacementType.Bottom,
                afterClose: function () {
                    oMyAvatar.setActive(false);
                },
                content: new sap.m.List({
                    items: [
                        new sap.m.StandardListItem({
                            title: "Cerrar sesión",
                            icon: "sap-icon://log",
                            type: sap.m.ListType.Active,
                            press: function () {
                                // this.clearSession();
                                oPopover.close();
                                oMyAvatar.setActive(false);
                                // this.getRouter().navTo("RouteLogin", {}, true /*no history*/);
                                MessageToast.show("Cerrando sesión");
                            }
                        })
                    ]
                })
            });

            // Open the popover
            oPopover.openBy(oMyAvatar);
        }

    });
});
