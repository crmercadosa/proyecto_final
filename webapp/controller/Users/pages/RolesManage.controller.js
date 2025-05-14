// @ts-nocheck
sap.ui.define([
    "com/inv/sapfioriwebinvestments/controller/BaseController",  // Controlador base
    "sap/ui/model/json/JSONModel",                               // Modelo JSON
    "sap/ui/core/BusyIndicator",                                 // Indicador de carga
    "sap/m/MessageToast",                                        // Toast de mensajes
    "sap/m/MessageBox",                                          // Box de mensajes
    "sap/ui/core/Fragment"                                       // Fragmentos (modales, etc.)
],
function (BaseController, JSONModel, BusyIndicator, MessageToast, MessageBox, Fragment) {
    "use strict";

    return BaseController.extend("com.inv.sapfioriwebinvestments.controller.Users.pages.RolesManage", {

        // ===================================================
        // ============ Inicialización ========================
        // ===================================================

        //*FIC: Evento inicial del controlador
        onInit: function () {
            this.loadRoles(); // Cargar roles al iniciar
        },


        // ===================================================
        // ============ Carga de Datos ========================
        // ===================================================

        /**
         * Carga la lista de roles desde la API.
         */
        loadRoles: function () {
            var oTable = this.byId("IdTable1RolesManageTable");
            var oModel = new JSONModel();
            var that = this;

            BusyIndicator.show(0);

            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_ROLES_URL_BASE + "getallroles"))
                .then(res => res.json())
                .then(data => {
                    that._aAllRoles = data.value; // Guardar copia para búsquedas
                    oModel.setData({ roles: data.value }); // Binding directo
                    oTable.setModel(oModel);
                })
                .catch(err => MessageToast.show("Error al cargar roles: " + err.message))
                .finally(() => BusyIndicator.hide());
        },


        // ===================================================
        // ============ Funcionalidades =======================
        // ===================================================

        /**
         * Filtra los roles en la tabla.
         */
        onSearchRole: function (oEvent) {
            var sQuery = oEvent.getSource().getValue().toLowerCase();
            var oTable = this.byId("IdTable1RolesManageTable");
            var oModel = new JSONModel();

            var aFilteredRoles = this._aAllRoles.filter(role =>
                (role.ROLEID && role.ROLEID.toLowerCase().includes(sQuery)) ||
                (role.ROLENAME && role.ROLENAME.toLowerCase().includes(sQuery)) ||
                (role.DESCRIPTION && role.DESCRIPTION.toLowerCase().includes(sQuery))
            );

            oModel.setData({ roles: aFilteredRoles });
            oTable.setModel(oModel);
        },

        /**
         * Obtiene el rol seleccionado de la tabla.
         */
        onRoleRowSelected: function () {
            var oTable = this.byId("IdTable1RolesManageTable");
            var iSelectedIndex = oTable.getSelectedIndex();

            if (iSelectedIndex < 0) {
                return;
            }

            var oContext = oTable.getContextByIndex(iSelectedIndex);
            var RoleData = oContext.getObject();

            this.selectedRole = RoleData;
        },


        // ===================================================
        // ============ Crear Rol ============================
        // ===================================================

        onCreate: function () {
            var oView = this.getView();

            if (!this._oCreateRoleDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.inv.sapfioriwebinvestments.view.Users.Modals.CreateRoleDialog",
                    controller: this
                }).then(oDialog => {
                    this._oCreateRoleDialog = oDialog;
                    oView.addDependent(oDialog);
                    this._oCreateRoleDialog.open();
                });
            } else {
                this._oCreateRoleDialog.open();
            }
        },

        onCreateRoleSubmit: function () {
            var oView = this.getView();
            var that = this;

            var RoleID = oView.byId("inputRoleID").getValue();
            var RoleName = oView.byId("inputRoleName").getValue();
            var Description = oView.byId("inputRoleDescription").getValue();

            if (!RoleID || !RoleName) {
                MessageToast.show("Completa todos los campos obligatorios.");
                return;
            }

            var roleBody = {
                role: {
                    ROLEID: RoleID,
                    ROLENAME: RoleName,
                    DESCRIPTION: Description
                }
            };

            BusyIndicator.show(0);

            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_ROLES_URL_BASE + "addonerole", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(roleBody)
                }))
                .then(res => {
                    if (!res.ok) throw new Error("Error al crear rol");
                    return res.json();
                })
                .then(() => {
                    MessageToast.show("Rol creado correctamente");
                    that.loadRoles();
                    that._oCreateRoleDialog.close();
                })
                .catch(err => MessageToast.show("Error: " + err.message))
                .finally(() => BusyIndicator.hide());
        },

        onCloseCreateRoleDialog: function () {
            this._oCreateRoleDialog.close();
        },


        // ===================================================
        // ============ Actualizar Rol =======================
        // ===================================================

        onUpdate: function () {
            var oView = this.getView();

            if (!this.selectedRole) {
                MessageToast.show("Selecciona un rol para editar.");
                return;
            }

            if (!this._oUpdateRoleDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.inv.sapfioriwebinvestments.view.Users.Modals.UpdateRoleDialog",
                    controller: this
                }).then(oDialog => {
                    this._oUpdateRoleDialog = oDialog;
                    oView.addDependent(oDialog);
                    this.setUpdateRoleDialogData(this.selectedRole);
                    this._oUpdateRoleDialog.open();
                });
            } else {
                this.setUpdateRoleDialogData(this.selectedRole);
                this._oUpdateRoleDialog.open();
            }
        },

        setUpdateRoleDialogData: function (RoleData) {
            var oView = this.getView();
            oView.byId("inputRoleID2").setValue(RoleData.ROLEID || "");
            oView.byId("inputRoleName2").setValue(RoleData.ROLENAME || "");
            oView.byId("inputRoleDescription2").setValue(RoleData.DESCRIPTION || "");
        },

        onUpdateRoleSubmit: function () {
            var oView = this.getView();
            var that = this;

            var RoleID = oView.byId("inputRoleID2").getValue();
            var RoleName = oView.byId("inputRoleName2").getValue();
            var Description = oView.byId("inputRoleDescription2").getValue();

            var roleBody = {
                role: {
                    ROLEID: RoleID,
                    ROLENAME: RoleName,
                    DESCRIPTION: Description
                }
            };

            BusyIndicator.show(0);

            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_ROLES_URL_BASE + "updateonerole?ROLEID=" + RoleID, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(roleBody)
                }))
                .then(res => {
                    if (!res.ok) throw new Error("Error al actualizar rol");
                    return res.json();
                })
                .then(() => {
                    MessageToast.show("Rol actualizado correctamente");
                    that.loadRoles();
                    that._oUpdateRoleDialog.close();
                })
                .catch(err => MessageToast.show("Error: " + err.message))
                .finally(() => BusyIndicator.hide());
        },

        onCloseUpdateRoleDialog: function () {
            this._oUpdateRoleDialog.close();
        },


        // ===================================================
        // ============ Eliminar Rol =========================
        // ===================================================

        onDelete: function () {
            if (!this.selectedRole) {
                MessageToast.show("Selecciona un rol para eliminar.");
                return;
            }

            var that = this;

            MessageBox.confirm(
                "¿Deseas eliminar el rol con ROLEID: " + this.selectedRole.ROLEID + "?",
                {
                    title: "Confirmar eliminación",
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            that.deleteRolePhy(that.selectedRole.ROLEID);
                        }
                    }
                }
            );
        },

        deleteRolePhy: function (RoleID) {
            var that = this;
            BusyIndicator.show(0);

            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_ROLES_URL_BASE + "delrolephysically?ROLEID=" + RoleID, {
                    method: "POST"
                }))
                .then(res => {
                    if (!res.ok) throw new Error("Error al eliminar rol");
                    MessageToast.show("Rol eliminado correctamente");
                    that.loadRoles();
                })
                .catch(err => MessageToast.show("Error: " + err.message))
                .finally(() => BusyIndicator.hide());
        },


        // ===================================================
        // ============ Placeholder Privilegios ==============
        // ===================================================

        onPressPrivileges: function () {
            MessageToast.show("Funcionalidad de privilegios aún no implementada.");
        }

    });
});
