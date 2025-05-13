// @ts-nocheck
sap.ui.define([
    "com/inv/sapfioriwebinvestments/controller/BaseController",  // Controlador base
    "sap/ui/model/json/JSONModel",                               // Modelo JSON
    "sap/ui/core/BusyIndicator",                                 // Indicador de carga
    "sap/m/MessageToast",                                        // Toast de mensajes
    "sap/m/MessageBox",                                        // Box de mensajes
    "sap/ui/core/Fragment"                                       // Fragmentos (modales, etc.)
],
function (BaseController, JSONModel, BusyIndicator, MessageToast, MessageBox, Fragment) {
    "use strict";

    return BaseController.extend("com.inv.sapfioriwebinvestments.controller.Catalogs.pages.CatalogsManage", {

        // ===================================================
        // ============ Inicialización =======================
        // ===================================================

        /**
         * Evento inicial del controlador.
         */
        onInit: function () {
            this.loadLabels();  
            this.savedCatalogs = []; // Copia de catalogos originales para búsquedas

            // Modelo para RowMode UI
            const oUIModel = new JSONModel({
                rowMode: "Fixed" // Opciones: Fixed | Auto | Interactive
            });
            this.getView().setModel(oUIModel, "ui");
        },

        // ===================================================
        // ============ Carga de datos =======================
        // ===================================================

        /**
         * Función que carga el catálogo.
         */

        loadLabels: function(){
            var oTable = this.byId("IdTable1CatalogsManageTable");
            var oModel = new JSONModel();
            var that = this;
            
            BusyIndicator.show(0);

            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_LABELS_URL_BASE + "getalllabels"))
                .then(res => res.json())
                .then(data => {
                    that._aAllCatalogs = data.value[0].labels; // Copia original
                    oModel.setData(data);
                    oTable.setModel(oModel);
                })
                .catch(err => {
                    if(err.message === ("Cannot read properties of undefined (reading 'setModel')")){
                        return;
                    }else{
                        MessageToast.show("Error al cargar usuarios: " + err.message);
                    }      
                })
                .finally(() => BusyIndicator.hide());

        },

        // ===================================================
        // ============= Modal: Crear Catálogo ===============
        // ===================================================

        /**
         * Abre la modal para crear un catálogo.
         */
        onCreate: function () {
            var oView = this.getView();

            if (!this._oCreateCatalogDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.inv.sapfioriwebinvestments.view.Catalogs.modals.CreateCatalogDialog",
                    controller: this
                }).then(oDialog => {
                    this._oCreateCatalogDialog = oDialog;
                    oView.addDependent(oDialog);
                    this._oCreateCatalogDialog.open();
                });
            } else {
                this._oCreateCatalogDialog.open();
            }
        },

        onCreateCatalogSubmit: function(){
            var oView = this.getView();
            var that = this;

            // Obtener valores del formulario
            var CompanyId = oView.byId("inputCompanyId").getValue();
            var CediId = oView.byId("inputCediId").getValue();
            var LabelId = oView.byId("inputLabelId").getValue();
            var Label = oView.byId("inputLabel").getValue();
            var Index = oView.byId("inputIndex").getValue();
            var Collection = oView.byId("inputCollection").getValue();
            var Section = oView.byId("inputSection").getValue();
            var Sequence = oView.byId("inputSequence").getValue();
            var Image = oView.byId("inputImage").getValue();
            var Description = oView.byId("inputDescription").getValue();

            if (!LabelId || !Label || !CompanyId || !CediId) {
                MessageToast.show("Por favor, completa los campos obligatorios.");
                return;
            }

            
            var labelBody = {
                label: {
                    COMPANYID: CompanyId,
					CEDIID: CediId,
					LABELID: LabelId,
					LABEL: Label,
					INDEX: Index,
					COLLECTION: Collection,
					SECTION: Section,
					SEQUENCE: Sequence,
					IMAGE: Image,
					DESCRIPTION: Description
                }
            };

            BusyIndicator.show(0);

            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_LABELS_URL_BASE + "addonelabel", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(labelBody)
                }))
                .then(response => {
                    if (!response.ok) {throw new Error("Error en la respuesta del servidor");}
                    return response.json();
                })
                .then(() => {
                    MessageToast.show("Catálogo creado correctamente");
                    that.loadLabels();
                    that.getView().byId("CreateCatalogDialog").close();
                })
                .catch(err => MessageToast.show("Error al crear catálogo: " + err.message))
                .finally(() => BusyIndicator.hide());

        },

        /**
         * Función de cancelar, cierra la modal de catálogo.
         */
        onCloseCreateCatalogDialog: function () {
            this._oCreateCatalogDialog.close();
        },

        // ===================================================
        // ============ Modal: Editar Catálogo ===============
        // ===================================================

        // eslint-disable-next-line valid-jsdoc
        /**
         * Función onUpdate del edit button que abre la modal.
         */
        onUpdate: function () {
            var oView = this.getView();

            // Validar selección
            if (!this.selectedCatalog) {
                MessageToast.show("Por favor, selecciona un catálogo para editar.");
                return;
            }

            var CatalogData = this.selectedCatalog;

            // Cargar la modal si no existe
            if (!this._oUpdateCatalogDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.inv.sapfioriwebinvestments.view.Catalogs.modals.UpdateCatalogDialog",
                    controller: this
                }).then(oDialog => {
                    this._oUpdateCatalogDialog = oDialog;
                    oView.addDependent(oDialog);

                    // Precargar datos del catálogo seleccionado
                    this.setUpdateCatalogDialogData(CatalogData);

                    // Abrir la modal
                    this._oUpdateCatalogDialog.open();
                });
            } else {

                // Precargar datos del catálogo seleccionado
                this.setUpdateCatalogDialogData(CatalogData);

                // Abrir la modal
                this._oUpdateCatalogDialog.open();
            }
        },

        setUpdateCatalogDialogData: function (CatalogData) {
            var oView = this.getView();

            // Rellenar inputs
            oView.byId("inputCompanyId2").setValue(CatalogData.COMPANYID || "");
            oView.byId("inputCediId2").setValue(CatalogData.CEDIID || "");
            oView.byId("inputLabelId2").setValue(CatalogData.LABELID || "");
            oView.byId("inputLabel2").setValue(CatalogData.LABEL || "");
            oView.byId("inputIndex2").setValue(CatalogData.INDEX || "");
            oView.byId("inputCollection2").setValue(CatalogData.COLLECTION || "");
            oView.byId("inputSection2").setValue(CatalogData.SECTION || "");
            oView.byId("inputSequence2").setValue(CatalogData.SEQUENCE || "");
            oView.byId("inputImage2").setValue(CatalogData.IMAGE || "");
            oView.byId("inputDescription2").setValue(CatalogData.DESCRIPTION || "");

        },

        onUpdateCatalogSubmit: function () {
            var oView = this.getView();
            var that = this;

            // Obtener valores del formulario
            var CompanyId = oView.byId("inputCompanyId2").getValue();
            var CediId = oView.byId("inputCediId2").getValue();
            var LabelId = oView.byId("inputLabelId2").getValue();
            var Label = oView.byId("inputLabel2").getValue();
            var Index = oView.byId("inputIndex2").getValue();
            var Collection = oView.byId("inputCollection2").getValue();
            var Section = oView.byId("inputSection2").getValue();
            var Sequence = oView.byId("inputSequence2").getValue();
            var Image = oView.byId("inputImage2").getValue();
            var Description = oView.byId("inputDescription2").getValue();

            if (!LabelId || !Label || !CompanyId || !CediId) {
                MessageToast.show("Por favor, completa los campos obligatorios.");
                return;
            }

            
            var labelBody = {
                label: {
                    COMPANYID: CompanyId,
					CEDIID: CediId,
					LABELID: LabelId,
					LABEL: Label,
					INDEX: Index,
					COLLECTION: Collection,
					SECTION: Section,
					SEQUENCE: Sequence,
					IMAGE: Image,
					DESCRIPTION: Description
                }
            };

            BusyIndicator.show(0);

            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_LABELS_URL_BASE + "updateonelabel?LABELID=" + LabelId, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(labelBody)
                }))
                .then(response => {
                    if (!response.ok) {throw new Error("Error en la respuesta del servidor");}
                    return response.json();
                })
                .then(() => {
                    MessageToast.show("Catálogo actualizado correctamente");
                    that.loadLabels();
                    that.getView().byId("UpdateCatalogDialog").close();
                })
                .catch(err => MessageToast.show("Error al actualizar catálogo: " + err.message))
                .finally(() => BusyIndicator.hide());

        },

        onCloseUpdateCatalogDialog: function(){
            this._oUpdateCatalogDialog.close();
        },

        // ===================================================
        // ====== Modal: Eliminar Catalogo Fisicamente =======
        // ===================================================

        // eslint-disable-next-line valid-jsdoc
        /**
         * Función onDelete del delete button que abre el MessageBox.
         */
        onDelete: function(){
            if (this.selectedCatalog) {
                var that = this;
                sap.m.MessageBox.confirm("Estas a punto de liminar el catálogo de " + this.selectedCatalog.LABEL + ". Presiona ok para eliminar", {
                    title: "Confirmar eliminación",
                    icon: sap.m.MessageBox.Icon.WARNING,
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            that.deleteCatalogPhy(that.selectedCatalog.LABELID);
                        }
                    }
                });
            }else{
                MessageToast.show("Selecciona un catálogo para eliminar de la base de datos");
            }
        },

        // eslint-disable-next-line valid-jsdoc
        /**
         * Función para eliminar fisicamente de la BD el catálogo.
         */
        deleteCatalogPhy: function (LabelId) {
            var that = this;
            sap.ui.core.BusyIndicator.show(0);

            fetch("env.json")
                .then(function (response) {
                    return response.json();
                })
                .then(function (env) {
                    const apiBaseUrl = env.API_LABELS_URL_BASE;
                    return fetch(apiBaseUrl + "dellabelphysically?LABELID=" + LabelId, {
                        method: "POST"
                    });
                })
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("Error en la eliminación del catálogo");
                    }
                    sap.m.MessageToast.show("Catálogo eliminado correctamente");
                    that.loadLabels();
                })
                .catch(function (err) {
                    sap.m.MessageToast.show("Error al eliminar catálogo: " + err.message);
                })
                .finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
        },

        // ===================================================
        // ================ Barra de búsqueda ================
        // ===================================================

        // eslint-disable-next-line valid-jsdoc
        /**
         * Busca catálogos en la tabla según la consulta ingresada.
         */
        onSearchCatalog: function (oEvent) {
            var sQuery = oEvent.getSource().getValue().toLowerCase();
            var oTable = this.byId("IdTable1CatalogsManageTable");
            var oModel = new JSONModel();

            var aFilteredCatalogs = this._aAllCatalogs.filter(catalog =>
                (catalog.LABELID && catalog.LABELID.toLowerCase().includes(sQuery)) ||
                (catalog.LABEL && catalog.LABEL.toLowerCase().includes(sQuery))
            );

            oModel.setData({ value: [{ labels: aFilteredCatalogs }] });
            oTable.setModel(oModel);
        },

        

        // ===================================================
        // ============= Funciones de la tabla ===============
        // ===================================================

        // eslint-disable-next-line valid-jsdoc
        /**
         * Obtiene la fila seleccionada para tomar el CatalogId.
         */
        onCatalogRowSelected: function () {
            var oTable = this.byId("IdTable1CatalogsManageTable");
            var iSelectedIndex = oTable.getSelectedIndex();

            if (iSelectedIndex < 0) {
                return;
            }

            var oContext = oTable.getContextByIndex(iSelectedIndex);
            var CatalogData = oContext.getObject();

            this.selectedCatalog = CatalogData;
        },

        /**
         * Refresca la tabla.
         */
        onRefresh: function(){
            this.loadLabels();
        }

    });
});