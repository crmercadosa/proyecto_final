// @ts-nocheck
sap.ui.define([
    "com/inv/sapfioriwebinvestments/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (BaseController, JSONModel, BusyIndicator, MessageToast, MessageBox, Fragment) {
    "use strict";

    return BaseController.extend("com.inv.sapfioriwebinvestments.controller.Investments.pages.Companies", {
        onInit: function () {
            const oData = {
                symbols: [
                    { symbol: "AAPL", name: "Apple Inc." },
                    { symbol: "GOOGL", name: "Alphabet Inc." },
                    { symbol: "TSLA", name: "Tesla Inc." },
                    { symbol: "WDW", name: "Window corp." }
                ]
            };
            // Aquí está el cambio importante: nombrar el modelo como "CompaniesModel"
            const oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "CompaniesModel");  // ✅ <- este era el problema
        },

        onCompanyPress: function (oEvent) {
            const oItem = oEvent.getParameter("listItem");
            const sSymbol = oItem.getBindingContext("CompaniesModel").getProperty("symbol");  // ✅ Añadí "CompaniesModel" en el contexto

            this.getOwnerComponent().getRouter().navTo("RouteInvertions", {
                symbol: sSymbol
            });
        }
    });
});
