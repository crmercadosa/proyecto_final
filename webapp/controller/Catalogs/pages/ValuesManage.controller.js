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

    return BaseController.extend("com.inv.sapfioriwebinvestments.controller.Catalogs.pages.ValuesManage", {

        // ===================================================
        // ============ Inicialización =======================
        // ===================================================

        /**
         * Evento inicial del controlador.
         */
        onInit: function () {
            this.loadValues();  
            this.savedValuess = []; // Copia de valores originales para búsquedas

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

        loadValues: function(){
            var oTable = this.byId("IdTable1ValuesManageTable");
            var oModel = new JSONModel();
            var that = this;
            
            BusyIndicator.show(0);

            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_VALUES_URL_BASE + "getallvalues"))
                .then(res => res.json())
                .then(data => {
                    that._aAllValues = data.value[0].values; // Copia original
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
        // ============== Modal: Crear Valor ================
        // ===================================================

        /**
         * Abre la modal para crear un valor.
         */
        onCreate: function () {
            var oView = this.getView();

            if (!this._oCreateValueDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.inv.sapfioriwebinvestments.view.Catalogs.modals.CreateValueDialog",
                    controller: this
                }).then(oDialog => {
                    this._oCreateValueDialog = oDialog;
                    oView.addDependent(oDialog);
                    this._oCreateValueDialog.open();
                });
            } else {
                this._oCreateValueDialog.open();
            }
        },

        onCreateValueSubmit: function(){
            var oView = this.getView();
            var that = this;

            // Obtener valores del formulario
            var CompanyId = oView.byId("inputValueCompanyId").getValue();
            var CediId = oView.byId("inputValueCediId").getValue();
            var LabelId = oView.byId("inputValueLabelId").getValue();
            var ValueId = oView.byId("inputValueId").getValue();
            var Value = oView.byId("inputValue").getValue();
            var Alias = oView.byId("inputAlias").getValue();
            var Sequence = oView.byId("inputValueSequence").getValue();
            var Image = oView.byId("inputValueImage").getValue();
            var Description = oView.byId("inputValueDescription").getValue();

            if (!LabelId || !ValueId || !CompanyId || !CediId || !Value) {
                MessageToast.show("Por favor, completa los campos obligatorios.");
                return;
            }

            
            var valueBody = {
                value: {
                    COMPANYID: CompanyId,
					CEDIID: CediId,
					LABELID: LabelId,
					VALUEID: ValueId,
					VALUE: Value,
					ALIAS: Alias,
					SEQUENCE: Sequence,
					IMAGE: Image,
					DESCRIPTION: Description
                }
            };

            BusyIndicator.show(0);

            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_VALUES_URL_BASE + "addonevalue", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(valueBody)
                }))
                .then(response => {
                    if (!response.ok) {throw new Error("Error en la respuesta del servidor");}
                    return response.json();
                })
                .then(() => {
                    MessageToast.show("Valor creado correctamente");
                    that.loadValues();
                    that.getView().byId("CreateValueDialog").close();
                })
                .catch(err => MessageToast.show("Error al crear el valor: " + err.message))
                .finally(() => BusyIndicator.hide());

        },

        /**
         * Función de cancelar, cierra la modal de create value.
         */
        onCloseCreateCatalogDialog: function () {
            this._oCreateValueDialog.close();
        },

        // ===================================================
        // ============ Modal: Editar Valores ================
        // ===================================================

        // eslint-disable-next-line valid-jsdoc
        /**
         * Función onUpdate del edit button que abre la modal.
         */
        onUpdate: function () {
            var oView = this.getView();

            // Validar selección
            if (!this.selectedValue) {
                MessageToast.show("Por favor, selecciona un valor para editar.");
                return;
            }

            var ValueData = this.selectedValue;

            // Cargar la modal si no existe
            if (!this._oUpdateValueDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.inv.sapfioriwebinvestments.view.Catalogs.modals.UpdateValueDialog",
                    controller: this
                }).then(oDialog => {
                    this._oUpdateValueDialog = oDialog;
                    oView.addDependent(oDialog);

                    // Precargar datos del valor seleccionado
                    this.setUpdateValueDialogData(ValueData);

                    // Abrir la modal
                    this._oUpdateValueDialog.open();
                });
            } else {

                // Precargar datos del valor seleccionado
                this.setUpdateValueDialogData(ValueData);

                // Abrir la modal
                this._oUpdateValueDialog.open();
            }
        },

        setUpdateValueDialogData: function (ValueData) {
            var oView = this.getView();

            // Rellenar inputs
            oView.byId("inputValueCompanyId2").setValue(ValueData.COMPANYID || "");
            oView.byId("inputValueCediId2").setValue(ValueData.CEDIID || "");
            oView.byId("inputValueLabelId2").setValue(ValueData.LABELID || "");
            oView.byId("inputValueId2").setValue(ValueData.VALUEID || "");
            oView.byId("inputValue2").setValue(ValueData.VALUE || "");
            oView.byId("inputAlias2").setValue(ValueData.ALIAS || "");
            oView.byId("inputValueSequence2").setValue(ValueData.SEQUENCE || "");
            oView.byId("inputValueImage2").setValue(ValueData.IMAGE || "");
            oView.byId("inputValueDescription2").setValue(ValueData.DESCRIPTION || "");

        },

        onUpdateValueSubmit: function () {
            var oView = this.getView();
            var that = this;

            // Obtener valores del formulario
            var CompanyId = oView.byId("inputValueCompanyId2").getValue();
            var CediId = oView.byId("inputValueCediId2").getValue();
            var LabelId = oView.byId("inputValueLabelId2").getValue();
            var ValueId = oView.byId("inputValueId2").getValue();
            var Value = oView.byId("inputValue2").getValue();
            var Alias = oView.byId("inputAlias2").getValue();
            var Sequence = oView.byId("inputValueSequence2").getValue();
            var Image = oView.byId("inputValueImage2").getValue();
            var Description = oView.byId("inputValueDescription2").getValue();

            if (!LabelId || !ValueId || !CompanyId || !CediId || !Value) {
                MessageToast.show("Por favor, completa los campos obligatorios.");
                return;
            }

            
            var valueBody = {
                value: {
                    COMPANYID: CompanyId,
					CEDIID: CediId,
					LABELID: LabelId,
					VALUEID: ValueId,
					VALUE: Value,
					ALIAS: Alias,
					SEQUENCE: Sequence,
					IMAGE: Image,
					DESCRIPTION: Description
                }
            };

            BusyIndicator.show(0);

            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_VALUES_URL_BASE + "updateonevalue?VALUEID=" + ValueId, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(valueBody)
                }))
                .then(response => {
                    if (!response.ok) {throw new Error("Error en la respuesta del servidor");}
                    return response.json();
                })
                .then(() => {
                    MessageToast.show("Valor actualizado correctamente");
                    that.loadValues();
                    that.getView().byId("UpdateValueDialog").close();
                })
                .catch(err => MessageToast.show("Error al actualizar el valor: " + err.message))
                .finally(() => BusyIndicator.hide());

        },

        onCloseUpdateValueDialog: function(){
            this._oUpdateValueDialog.close();
        },

        // ===================================================
        // ====== Modal: Eliminar valores Fisicamente ========
        // ===================================================

        // eslint-disable-next-line valid-jsdoc
        /**
         * Función onDelete del delete button que abre el MessageBox.
         */
        onDelete: function(){
            if (this.selectedValue) {
                var that = this;
                sap.m.MessageBox.confirm("Estas a punto de liminar el valor de " + this.selectedValue.VALUE + ". Presiona ok para eliminar", {
                    title: "Confirmar eliminación",
                    icon: sap.m.MessageBox.Icon.WARNING,
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            that.deleteValuePhy(that.selectedValue.VALUEID);
                        }
                    }
                });
            }else{
                MessageToast.show("Selecciona un valor para eliminar de la base de datos");
            }
        },

        // eslint-disable-next-line valid-jsdoc
        /**
         * Función para eliminar fisicamente de la BD el valor.
         */
        deleteValuePhy: function (ValueId) {
            var that = this;
            sap.ui.core.BusyIndicator.show(0);

            fetch("env.json")
                .then(function (response) {
                    return response.json();
                })
                .then(function (env) {
                    const apiBaseUrl = env.API_VALUES_URL_BASE;
                    return fetch(apiBaseUrl + "delvaluephysically?VALUEID=" + ValueId, {
                        method: "POST"
                    });
                })
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("Error en la eliminación del valor");
                    }
                    sap.m.MessageToast.show("Valor eliminado correctamente");
                    that.loadValues();
                })
                .catch(function (err) {
                    sap.m.MessageToast.show("Error al eliminar el valor: " + err.message);
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
         * Busca valores de catálogos en la tabla según la consulta ingresada.
         */
        onSearchValue: function (oEvent) {
            var sQuery = oEvent.getSource().getValue().toLowerCase();
            var oTable = this.byId("IdTable1ValuesManageTable");
            var oModel = new JSONModel();

            var aFilteredValues = this._aAllValues.filter(value =>
                (value.LABELID && value.LABELID.toLowerCase().includes(sQuery)) ||
                (value.VALUEID && value.VALUEID.toLowerCase().includes(sQuery)) ||
                (value.VALUE && value.VALUE.toLowerCase().includes(sQuery))
            );

            oModel.setData({ value: [{ values: aFilteredValues }] });
            oTable.setModel(oModel);
        },

        // ===================================================
        // ============= Funciones de la tabla ===============
        // ===================================================

        // eslint-disable-next-line valid-jsdoc
        /**
         * Obtiene la fila seleccionada para tomar el CatalogId.
         */
        onValueRowSelected: function () {
            var oTable = this.byId("IdTable1ValuesManageTable");
            var iSelectedIndex = oTable.getSelectedIndex();

            if (iSelectedIndex < 0) {
                return;
            }

            var oContext = oTable.getContextByIndex(iSelectedIndex);
            var ValueData = oContext.getObject();

            this.selectedValue = ValueData;
        },

        /**
         * Refresca la tabla.
         */
        onRefresh: function(){
            this.loadValues();
        }


    });
});
