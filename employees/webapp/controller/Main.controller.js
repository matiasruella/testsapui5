//@ts-nocheck
sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageBox"
    ],
    /**
     * 
     * @param { typeof sap.ui.core.mvc.Controller } Controller 
     * @param { typeof sap.m.MessageBox } MessageBox 
     */
    function (Controller,MessageBox) {

        return Controller.extend("mr.employees.controller.Main", {

            onBeforeRendering: function () {

                this._detailsEmployee = this.getView().byId("deteailsEmployee")

            },
            onInit: function () {

                let oJsonModel = new sap.ui.model.json.JSONModel();
                oJsonModel.loadData("./model/json/countries.json");
                this.getView().setModel(oJsonModel, "Countries");

                let oJsonEmployees = new sap.ui.model.json.JSONModel();
                oJsonEmployees.loadData("./model/json/Employees.json");
                this.getView().setModel(oJsonEmployees, "jsonEmployees");

                let oJsonModelConfig = new sap.ui.model.json.JSONModel({
                    visibleID: true,
                    visibleName: true,
                    visibleCountry: true,
                    visibleCity: false,
                    layoutConfig:
                    {
                        selected: "OneColumn",
                        layouts:
                            [
                                {
                                    id: "OneColumn",
                                    text: "One Column"

                                },
                                {
                                    id: "TwoColumnsBeginExpanded",
                                    text: "Two Columns Begin Expanded"

                                },
                                {
                                    id: "TwoColumnsMidExpanded",
                                    text: "Two Columns Mid Expanded"

                                },
                                {
                                    id: "MidColumnFullScreen",
                                    text: "Mid Column FullScreen"

                                },
                                {
                                    id: "ThreeColumnsMidExpanded",
                                    text: "Three Columns Mid Expanded"

                                },
                                {
                                    id: "ThreeColumnsEndExpanded",
                                    text: "Three Columns End Expanded"

                                },
                                {
                                    id: "ThreeColumnsMidExpandedEndHidden",
                                    text: "Three Columns Mid Expanded End Hidden"

                                },
                                {
                                    id: "ThreeColumnsBeginExpandedEndHidden",
                                    text: "Three Columns Begin Expanded End Hidden"

                                },
                                {
                                    id: "EndColumnFullScreen",
                                    text: "End Column FullScreen"

                                }
                            ]
                    }
                });

                this.getView().setModel(oJsonModelConfig, "jsonConfig");


                this._bus = sap.ui.getCore().getEventBus();

                this._bus.subscribe("flexible", "showDetails", this.showEmployeeDetail, this);

                this._bus.subscribe("incidence", "onSaveIncidence", this.onSaveDataIncidence, this);

                this._bus.subscribe("incidence", "onDeleteIncidence", function (channelId, eventId, data) {
                    
                    var oRessourceBundle = this.getView().getModel("i18n").getResourceBundle();
                    this.getView().getModel("incidenceModel").remove("/IncidentsSet(IncidenceId='" + data.IncidenceId +
                        "',SapId='" + data.SapId +
                        "',EmployeeId='" + data.EmployeeId + "')", {
                        success: function () {
                            this.onReadOdataIncidence.bind(this)(data.EmployeeId);
                            sap.m.MessageToast.show(oRessourceBundle.getText("odatadeleteOK"))
                        }.bind(this),
                        error: function (e) {
                            sap.m.MessageToast.show(oRessourceBundle.getText("odatadeleteKO"))
                        }.bind(this)
                    })
                }, this)

            },

            onSaveDataIncidence: function (channelId, eventId, data) {

                var oRessourceBundle = this.getView().getModel("i18n").getResourceBundle();
                var employeeId = this._detailsEmployee.getBindingContext("odataNorthwind").getObject().EmployeeID
                var incidenceModel = this._detailsEmployee.getModel("incidenceModel").getData();

                if (typeof incidenceModel[data.rowIncidence].IncidenceId == 'undefined') {
                    var body = {
                        SapId: this.getOwnerComponent().SapId,
                        EmployeeId: employeeId.toString(),
                        CreationDate: incidenceModel[data.rowIncidence].CreationDate,
                        Type: incidenceModel[data.rowIncidence].Type,
                        Reason: incidenceModel[data.rowIncidence].Reason
                    }

                    this.getView().getModel("incidenceModel").create("/IncidentsSet", body, {

                        success: function () {
                            this.onReadOdataIncidence.bind(this)(employeeId);
                            MessageBox.success(oRessourceBundle.getText("odataSaveOk"))
                            //sap.m.MessageToast.show(oRessourceBundle.getText("odataSaveOk"))
                        }.bind(this),
                        error: function (e) {
                            sap.m.MessageToast.show(oRessourceBundle.getText("odataSaveKo"))

                        }.bind(this)
                    })
                } else if (incidenceModel[data.rowIncidence].CreationDateX ||
                    incidenceModel[data.rowIncidence].ReasonX ||
                    incidenceModel[data.rowIncidence].TypeX) {
                    var body = {

                        CreationDate: incidenceModel[data.rowIncidence].CreationDate,
                        CreationDateX: incidenceModel[data.rowIncidence].CreationDateX,
                        Type: incidenceModel[data.rowIncidence].Type,
                        TypeX: incidenceModel[data.rowIncidence].TypeX,
                        Reason: incidenceModel[data.rowIncidence].Reason,
                        ReasonX: incidenceModel[data.rowIncidence].ReasonX
                    };
                    this.getView().getModel("incidenceModel").update("/IncidentsSet(IncidenceId='" + incidenceModel[data.rowIncidence].IncidenceId +
                        "',SapId='" + incidenceModel[data.rowIncidence].SapId +
                        "',EmployeeId='" + incidenceModel[data.rowIncidence].EmployeeId + "')", body, {
                        success: function () {
                            MessageBox.success(oRessourceBundle.getText("updateSaveOK"))
                           // sap.m.MessageToast.show(oRessourceBundle.getText("updateSaveOK"))
                        }.bind(this),
                        error: function (e) {
                            sap.m.MessageToast.show(oRessourceBundle.getText("updateSaveKO"))
                        }.bind(this)
                    })
                }
                else {
                    sap.m.MessageToast.show(oRessourceBundle.getText("odataNoChanges"));
                }
            },

            onReadOdataIncidence: function (employeeId) {

                this.getView().getModel("incidenceModel").read("/IncidentsSet", {
                    filters: [
                        new sap.ui.model.Filter("SapId", "EQ", this.getOwnerComponent().SapId),
                        new sap.ui.model.Filter("EmployeeId", "EQ", employeeId.toString())
                    ],
                    success: function (data) {
                        var incidenceModel = this._detailsEmployee.getModel("incidenceModel");
                        incidenceModel.setData(data.results);

                        var tableIncidence = this._detailsEmployee.byId("tableIncidence");
                        tableIncidence.removeAllContent();

                        for (var incidence in data.results) {

                            data.results[incidence]._ValidateDate = true;
                            data.results[incidence].EnabledSave = false;
                            var newIncidence = sap.ui.xmlfragment("mr.employees.fragment.NewIncidence", this._detailsEmployee.getController());
                            this._detailsEmployee.addDependent(newIncidence);
                            newIncidence.bindElement("incidenceModel>/" + incidence)
                            tableIncidence.addContent(newIncidence);
                        }
                    }.bind(this),
                    error: function (e) {

                    }.bind(this)
                })

            },

            showEmployeeDetail: function (category, nameEvent, path) {

                let viewDetail = this.getView().byId("deteailsEmployee");

                viewDetail.bindElement("odataNorthwind>" + path);

                this.getView().getModel("jsonConfig").setProperty("/layoutConfig/selected", "TwoColumnsMidExpanded");

                var jsonIncidence = new sap.ui.model.json.JSONModel([]);

                viewDetail.setModel(jsonIncidence, "incidenceModel");

                viewDetail.byId("tableIncidence").removeAllContent();

                this.onReadOdataIncidence(this._detailsEmployee.getBindingContext("odataNorthwind").getObject().EmployeeID);



            }
        });
    });
