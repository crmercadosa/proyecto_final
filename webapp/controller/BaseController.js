sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History", // for routes in app
    "sap/ui/core/UIComponent",     // UI get routes  
    "sap/ui/model/json/JSONModel", // create a model 
    "sap/ui/thirdparty/jquery",    // jquery for querys
    "sap/base/Log",                // log  
    "sap/ui/util/Storage"          // to access of the storage 
], function (Controller, History, UIComponent, JSONModel, jQuery, Log, Storage) {
    // eslint-disable-next-line no-unused-expressions, quotes
    `use strict`;

    //const urlBase = "https://ccnayt.dnsalias.com:9101";
    
    return Controller.extend("com.inv.sapfioriwebinvestments.controller.BaseController", {

        onInit: function () { }, //this ecxecute only first time
        getRouter: function () { return UIComponent.getRouterFor(this);},
        onNavBack: function () { let oHistory, sPreviousHash;

            oHistory = History.getInstance();
            sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("RouteLogin", {}, true /*no history*/);
            }
        }
    });
});