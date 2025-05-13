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

    return BaseController.extend("com.inv.sapfioriwebinvestments.controller.Users.pages.UsersManage", {

        // ===================================================
        // ============ Inicialización =======================
        // ===================================================

        /**
         * Evento inicial del controlador.
         */
        onInit: function () {
            this.savedUsers = []; // Copia de usuarios original para búsquedas
            this.loadUsers();     // Cargar usuarios al iniciar
        },


        // ===================================================
        // ============ Carga de Datos =======================
        // ===================================================

        /**
         * Carga la lista de usuarios desde la API.
         */
        loadUsers: function () {
            var oTable = this.byId("IdTable1UsersManageTable");
            var oModel = new JSONModel();
            var that = this;

            BusyIndicator.show(0);

            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_USERS_URL_BASE + "getallusers"))
                .then(res => res.json())
                .then(data => {
                    data.value.forEach(user => {
                        user.ROLES = that.formatRoles(user.ROLES);
                    });
                    that._aAllUsers = data.value[0].users; // Copia original
                    oModel.setData(data);
                    oTable.setModel(oModel);
                })
                .catch(err => MessageToast.show("Error al cargar usuarios: " + err.message))
                .finally(() => BusyIndicator.hide());
        },

        /**
         * Carga la lista de roles disponibles desde la API.
         */
        loadRoles: function () {
            var oView = this.getView();
            var oRolesModel = new JSONModel();

            BusyIndicator.show(0);

            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_ROLES_URL_BASE + "getallroles"))
                .then(res => res.json())
                .then(data => {
                    oRolesModel.setData({ roles: data.value });
                    oView.setModel(oRolesModel);
                })
                .catch(err => MessageToast.show("Error al cargar roles: " + err.message))
                .finally(() => BusyIndicator.hide());
        },


        // ===================================================
        // ============ Funcionalidades de Usuarios ==========
        // ===================================================

        // eslint-disable-next-line valid-jsdoc
        /**
         * Busca usuarios en la tabla según la consulta ingresada.
         */
        onSearchUser: function (oEvent) {
            var sQuery = oEvent.getSource().getValue().toLowerCase();
            var oTable = this.byId("IdTable1UsersManageTable");
            var oModel = new JSONModel();

            var aFilteredUsers = this._aAllUsers.filter(user =>
                (user.USERID && user.USERID.toLowerCase().includes(sQuery)) ||
                (user.USERNAME && user.USERNAME.toLowerCase().includes(sQuery)) ||
                (user.EMAIL && user.EMAIL.toLowerCase().includes(sQuery))
            );

            oModel.setData({ value: [{ users: aFilteredUsers }] });
            oTable.setModel(oModel);
        },


        // ===================================================
        // ============ Funcionalidades de Roles =============
        // ===================================================

        // eslint-disable-next-line valid-jsdoc
        /**
         * Evento al seleccionar un rol del ComboBox.
         */
        onRoleSelected: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var sSelectedKey = oComboBox.getSelectedKey();
            var sSelectedText = oComboBox.getSelectedItem().getText();

            var oVBox;
            if (oComboBox.getId().includes("comboBoxRoles2")) {
                oVBox = this.getView().byId("selectedRolesVBox2");  // Update User VBox
            } else {
                oVBox = this.getView().byId("selectedRolesVBox");   // Create User VBox
            }
            // Validar duplicados
            var bExists = oVBox.getItems().some(oItem => oItem.data("roleId") === sSelectedKey);
            if (bExists) {
                MessageToast.show("El rol ya ha sido añadido.");
                return;
            }

            // Crear item visual del rol seleccionado
            var oHBox = new sap.m.HBox({
                items: [
                    new sap.m.Label({ text: sSelectedText }).addStyleClass("sapUiSmallMarginEnd"),
                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        type: "Transparent",
                        press: () => oVBox.removeItem(oHBox)
                    })
                ]
            });

            oHBox.data("roleId", sSelectedKey);
            oVBox.addItem(oHBox);
        },

        // eslint-disable-next-line valid-jsdoc
        /**
         * Formatea un array de roles a texto separado por guiones.
         */
        formatRoles: function (rolesArray) {
            return Array.isArray(rolesArray) 
                ? rolesArray.map(role => role.ROLENAME).join("-") 
                : "";
        },


        // ===================================================
        // ============ Modal: Crear Usuario ===============
        // ===================================================

        /**
         * Abre la modal para crear un usuario.
         */
        onCreate: function () {
            var oView = this.getView();

            if (!this._oCreateUserDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.inv.sapfioriwebinvestments.view.Users.modals.CreateUserDialog",
                    controller: this
                }).then(oDialog => {
                    this._oCreateUserDialog = oDialog;
                    oView.addDependent(oDialog);
                    this.loadRoles();
                    this._oCreateUserDialog.open();
                });
            } else {
                this.loadRoles();
                this._oCreateUserDialog.open();
            }
        },

        /**
         * Envía los datos del nuevo usuario a la API para crear.
         */
        onCreateUserSubmit: function () {
            var oView = this.getView();
            var that = this;

            // Obtener valores del formulario
            var UserId = oView.byId("inputUserId").getValue();
            var Username = oView.byId("inputUsername").getValue();
            var Email = oView.byId("inputEmail").getValue();
            var Birthday = oView.byId("inputBirthdayDate").getDateValue();
            var Company = oView.byId("inputCompanyName").getValue();
            var Phone = oView.byId("inputPhoneNumber").getValue();
            var Department = oView.byId("inputDepartment").getValue();
            var Function = oView.byId("inputFunction").getValue();

            // Roles seleccionados
            var SelectedRoles = oView.byId("selectedRolesVBox").getItems().map(oItem => ({
                ROLEID: oItem.data("roleId"),
                ROLEIDSAP: ""
            }));

            if (!Username || !Email || !UserId) {
                MessageToast.show("Por favor, completa los campos.");
                return;
            }

            var userBody = {
                user: {
                    USERID: UserId,
                    USERNAME: Username,
                    EMAIL: Email,
                    BIRTHDAYDATE: Birthday,
                    COMPANYNAME: Company,
                    PHONENUMBER: Phone,
                    DEPARTMENT: Department,
                    FUNCTION: Function,
                    ROLES: SelectedRoles
                }
            };

            BusyIndicator.show(0);

            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_USERS_URL_BASE + "addoneuser", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userBody)
                }))
                .then(response => {
                    if (!response.ok) {throw new Error("Error en la respuesta del servidor");}
                    return response.json();
                })
                .then(() => {
                    MessageToast.show("Usuario creado correctamente");
                    that.loadUsers();
                    that.getView().byId("CreateUserDialog").close();
                })
                .catch(err => MessageToast.show("Error al crear usuario: " + err.message))
                .finally(() => BusyIndicator.hide());

            this.resetInputDialog();
        },

        /**
         * Cierra el diálogo de creación de usuario y limpia inputs.
         */
        onCloseCreateUserDialog: function () {
            this.resetInputDialog();
            this._oCreateUserDialog.close();
        },

        /**
         * Resetea los campos del diálogo de creación de usuario.
         */
        resetInputDialog: function () {
            var oView = this.getView();
            ["inputUserId", "inputUsername", "inputEmail", "inputBirthdayDate",
             "inputCompanyName", "inputPhoneNumber", "inputDepartment", "inputFunction"]
                .forEach(id => oView.byId(id).setValue(""));
            
            oView.byId("selectedRolesVBox").removeAllItems();
        },

        // ===================================================
        // ============ Modal: Editar Usuario ================
        // ===================================================

        // eslint-disable-next-line valid-jsdoc
        /**
         * Función onUpdate del edit button que abre la modal.
         */
        onUpdate: function () {
            var oView = this.getView();

            // Validar selección
            if (!this.selectedUser) {
                MessageToast.show("Por favor, selecciona un usuario para editar.");
                return;
            }

            var UserData = this.selectedUser;

            // Cargar la modal si no existe
            if (!this._oUpdateUserDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.inv.sapfioriwebinvestments.view.Users.modals.UpdateUserDialog",
                    controller: this
                }).then(oDialog => {
                    this._oUpdateUserDialog = oDialog;
                    oView.addDependent(oDialog);

                    // Cargar roles en ComboBox
                    this.loadRoles();

                    // Precargar datos del usuario seleccionado
                    this.setUpdateUserDialogData(UserData);

                    // Abrir la modal
                    this._oUpdateUserDialog.open();
                });
            } else {
                // Recargar roles en ComboBox
                this.loadRoles();

                // Precargar datos del usuario seleccionado
                this.setUpdateUserDialogData(UserData);

                // Abrir la modal
                this._oUpdateUserDialog.open();
            }
        },

        setUpdateUserDialogData: function (UserData) {
            var oView = this.getView();

            // Rellenar inputs
            oView.byId("inputUserId2").setValue(UserData.USERID || "");
            oView.byId("inputUsername2").setValue(UserData.USERNAME || "");
            oView.byId("inputEmail2").setValue(UserData.EMAIL || "");
            oView.byId("inputCompanyName2").setValue(UserData.COMPANYNAME || "");
            oView.byId("inputPhoneNumber2").setValue(UserData.PHONENUMBER || "");
            oView.byId("inputDepartment2").setValue(UserData.DEPARTMENT || "");
            oView.byId("inputFunction2").setValue(UserData.FUNCTION || "");

            // Fecha de nacimiento (DatePicker)
            if (UserData.BIRTHDAYDATE) {
                oView.byId("inputBirthdayDate2").setDateValue(new Date(UserData.BIRTHDAYDATE));
            } else {
                oView.byId("inputBirthdayDate2").setValue("");
            }

            // Seleccionar el Rol en el ComboBox
            var oComboBox = oView.byId("comboBoxRoles2");
            if (UserData.ROLES && UserData.ROLES.length > 0) {
                oComboBox.setSelectedKey(UserData.ROLES[0].ROLEID);
            } else {
                oComboBox.setSelectedKey("");
            }

            // Mostrar roles seleccionados en el VBox (con botón eliminar)
            var oVBox = oView.byId("selectedRolesVBox2");
            oVBox.removeAllItems();

            if (UserData.ROLES && UserData.ROLES.length > 0) {
                UserData.ROLES.forEach(role => {
                    var SelectedKey = role.ROLEID;
                    var SelectedText = role.ROLENAME;

                    var oHBox = new sap.m.HBox({
                        items: [
                            new sap.m.Label({ text: SelectedText }).addStyleClass("sapUiSmallMarginEnd"),
                            new sap.m.Button({
                                icon: "sap-icon://decline",
                                type: "Transparent",
                                press: function () {
                                    oVBox.removeItem(oHBox);
                                }
                            })
                        ]
                    });

                    oHBox.data("roleId", SelectedKey);
                    oVBox.addItem(oHBox);
                });
            }

        },

        onCloseUpdateDialog: function () {
            this.resetUpdateInputDialog();
            this._oUpdateUserDialog.close();
        },

        onUpdateSubmit: function () {
            var oView = this.getView();
            var that = this;

            // Obtener valores del formulario
            var UserId = oView.byId("inputUserId2").getValue();
            var Username = oView.byId("inputUsername2").getValue();
            var Email = oView.byId("inputEmail2").getValue();
            var Birthday = oView.byId("inputBirthdayDate2").getDateValue();
            var Company = oView.byId("inputCompanyName2").getValue();
            var Phone = oView.byId("inputPhoneNumber2").getValue();
            var Department = oView.byId("inputDepartment2").getValue();
            var Function = oView.byId("inputFunction2").getValue();

            // Roles seleccionados
            var SelectedRoles = oView.byId("selectedRolesVBox2").getItems().map(oItem => ({
                ROLEID: oItem.data("roleId"),
                ROLEIDSAP: ""
            }));

            if (!Username || !Email) {
                MessageToast.show("Por favor, completa los campos.");
                return;
            }

            var userBody = {
                user: {
                    USERID: UserId,
                    USERNAME: Username,
                    EMAIL: Email,
                    BIRTHDAYDATE: Birthday,
                    COMPANYNAME: Company,
                    PHONENUMBER: Phone,
                    DEPARTMENT: Department,
                    FUNCTION: Function,
                    ROLES: SelectedRoles
                }
            };

            BusyIndicator.show(0);

            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_USERS_URL_BASE + "updateoneuser?USERID=" + UserId, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userBody)
                }))
                .then(response => {
                    if (!response.ok) {throw new Error("Error en la respuesta del servidor");}
                    return response.json();
                })
                .then(() => {
                    MessageToast.show("Usuario actualizado correctamente");
                    that.loadUsers();
                    that.getView().byId("UpdateUserDialog").close();
                })
                .catch(err => MessageToast.show("Error al actualizar usuario: " + err.message))
                .finally(() => BusyIndicator.hide());

            this.resetUpdateInputDialog();
        },

        /**
         * Resetea los campos del diálogo de actualización de usuario.
         */
        resetUpdateInputDialog: function () {
            var oView = this.getView();
            ["inputUserId2", "inputUsername2", "inputEmail2", "inputBirthdayDate2",
             "inputCompanyName2", "inputPhoneNumber2", "inputDepartment2", "inputFunction2"]
                .forEach(id => oView.byId(id).setValue(""));
            
            oView.byId("selectedRolesVBox2").removeAllItems();
        },

        // ===================================================
        // ====== Modal: Eliminar Usuario Fisicamente ========
        // ===================================================

        // eslint-disable-next-line valid-jsdoc
        /**
         * Función onDelete del delete button que abre el MessageBox.
         */
        onDelete: function(){
            if (this.selectedUser) {
                var that = this;
                sap.m.MessageBox.confirm("¿Deseas eliminar el usuario con USERID: " + this.selectedUser.USERID + "?", {
                    title: "Confirmar eliminación",
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            that.deleteUserPhy(that.selectedUser.USERID);
                        }
                    }
                });
            }else{
                MessageToast.show("Selecciona un usuario para eliminar de la base de datos");
            }
        },

        // eslint-disable-next-line valid-jsdoc
        /**
         * Función para eliminar fisicamente de la BD el usuario.
         */
        deleteUserPhy: function (UserId) {
            var that = this;
            sap.ui.core.BusyIndicator.show(0);

            fetch("env.json")
                .then(function (response) {
                    return response.json();
                })
                .then(function (env) {
                    const apiBaseUrl = env.API_USERS_URL_BASE;
                    return fetch(apiBaseUrl + "deluserphysically?USERID=" + UserId, {
                        method: "POST"
                    });
                })
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("Error en la eliminación del usuario");
                    }
                    sap.m.MessageToast.show("Usuario eliminado correctamente");
                    that.loadUsers();
                })
                .catch(function (err) {
                    sap.m.MessageToast.show("Error al eliminar usuario: " + err.message);
                })
                .finally(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
        },



        // ===================================================
        // ============= Funciones de la tabla ===============
        // ===================================================

        // eslint-disable-next-line valid-jsdoc
        /**
         * Obtiene la fila seleccionada para tomar el UserId.
         */
        onUserRowSelected: function () {
            var oTable = this.byId("IdTable1UsersManageTable");
            var iSelectedIndex = oTable.getSelectedIndex();

            if (iSelectedIndex < 0) {
                return;
            }

            var oContext = oTable.getContextByIndex(iSelectedIndex);
            var UserData = oContext.getObject();

            this.selectedUser = UserData;
        }

    });
});
