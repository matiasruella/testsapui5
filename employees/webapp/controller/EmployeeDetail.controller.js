//@ts-nocheck
sap.ui.define(
    [
        "mr/employees/controller/Base.controller",
        "mr/employees/model/formatter",
        "sap/m/MessageBox"
    ],
    /**
     * 
     * @param { typeof sap.ui.core.mvc.Controller } Controller 
     * @param { typeof mr.employees.model.formatter } formatter 
     * @param { typeof sap.m.MessageBox } MessageBox 
     */
    function (Base, formatter, MessageBox) {

        /**
         * Evento onInit del ciclo de vida del controlador
         */
        function onInit() {

            this._bus = sap.ui.getCore().getEventBus();


        };

        /**
         * Crea un incidencia.
         * 
         */
        function onCreateIncidence() {

            var tableIncidence = this.getView().byId("tableIncidence");
            var newIncidence = sap.ui.xmlfragment("mr.employees.fragment.NewIncidence", this);
            var incidenceModel = this.getView().getModel("incidenceModel");
            var odata = incidenceModel.getData();
            var index = odata.length;

            odata.push({ index: index + 1, _ValidateDate: false, EnabledSave: false });
            incidenceModel.refresh();
            newIncidence.bindElement("incidenceModel>/" + index);
            tableIncidence.addContent(newIncidence);

        };

        /***
         * Guarda una incidencia
         * @param {*} oEvent 
         */
        function onSaveIncidence(oEvent) {

            var incidence = oEvent.getSource().getParent().getParent();
            var rowIncidence = incidence.getBindingContext("incidenceModel");
            this._bus.publish("incidence", "onSaveIncidence", { rowIncidence: rowIncidence.sPath.replace('/', '') });


        }

        /**
         * Elimina una incidencia
         * @param {*} oEvent 
         */
        function onDeleteIncidence(oEvent) {

            var oRessourceBundle = this.getView().getModel("i18n").getResourceBundle();

            var contextObj = oEvent.getSource().getBindingContext("incidenceModel").getObject();

            MessageBox.confirm(oRessourceBundle.getText("confirmIncidenceDelete"), {
                onClose: function (oAction) {

                    if (oAction === 'OK') {

                        this._bus.publish("incidence", "onDeleteIncidence", {
                            IncidenceId: contextObj.IncidenceId,
                            SapId: contextObj.SapId,
                            EmployeeId: contextObj.EmployeeId
                        });

                    }

                }.bind(this)
            });
        }

        function onDeleteIncidence2(oEvent) {
            let tableIncidence = this.getView().byId("tableIncidence");
            let itemPress = oEvent.getSource().getParent().getParent();
            let incidenceModel = this.getView().getModel("incidenceModel");
            let odata = incidenceModel.getData();

            let contextObj = itemPress.getBindingContext("incidenceModel");

            odata.splice(contextObj.index - 1, 1)

            for (var i in odata) {
                odata[i].index = parseInt(i) + 1;

            }

            incidenceModel.refresh();
            tableIncidence.removeContent(itemPress);

            for (var j in tableIncidence.getContent()) {
                tableIncidence.getContent()[j].bindElement("incidenceModel>/" + j)

            }

        }

        /**
         * Eventp al cambiar el valor del DatePicker
         * @param {*} oEvent 
         */
        function onCreationDateChange(oEvent) {
            var context = oEvent.getSource().getBindingContext("incidenceModel");
            var contextObj = context.getObject();
            var oRessourceBundle = this.getView().getModel("i18n").getResourceBundle();

            if (!oEvent.getSource().isValidValue()) {

                contextObj._ValidateDate = false;
                contextObj.CreationDateState = "Error"
                MessageBox.error(oRessourceBundle.getText("ErrorCreationDate"), {
                    title: "Error",
                    onClose: null, //cuando se cierra el popup
                    styleClass: "", //aplica estilos
                    actions: MessageBox.Action.Close,
                    emphasizedAction: null,
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit

                })

            } else {

                contextObj._ValidateDate = true;
                contextObj.CreationDateX = true;
                contextObj.CreationDateState = "None"

            }

            if (oEvent.getSource().isValidValue() && contextObj.Reason) {
                contextObj.EnabledSave = true;
            } else {
                contextObj.EnabledSave = false;

            }
            context.getModel().refresh()




        }

        /**
         * Eventp al cambiar el valor del Reason
         * @param {*} oEvent 
         */
        function onReasonChange(oEvent) {

            var context = oEvent.getSource().getBindingContext("incidenceModel");
            var contextObj = context.getObject();

            if (oEvent.getSource().getValue()) {

                contextObj.ReasonX = true;
                contextObj.ReasonState = "None"

            } else {

                contextObj.ReasonX = false;
                contextObj.ReasonState = "Error"

            }

            if (contextObj._ValidateDate && oEvent.getSource().getValue()) {
                contextObj.EnabledSave = true;
            } else {
                contextObj.EnabledSave = false;

            }

            context.getModel().refresh()

        }

        /**
         * Eventp al cambiar el valor del Type
         * @param {*} oEvent 
         */
        function onTypeChange(oEvent) {

            var context = oEvent.getSource().getBindingContext("incidenceModel");
            var contextObj = context.getObject();

            contextObj.TypeX = true;

        }

        
        



        var EmployeeDetail = Base.extend("mr.employees.controller.EmployeeDetail", {});

        EmployeeDetail.prototype.onInit = onInit;
        EmployeeDetail.prototype.onCreateIncidence = onCreateIncidence;
        EmployeeDetail.prototype.Formatter = formatter;
        EmployeeDetail.prototype.onDeleteIncidence = onDeleteIncidence;
        EmployeeDetail.prototype.onSaveIncidence = onSaveIncidence;
        EmployeeDetail.prototype.onCreationDateChange = onCreationDateChange;
        EmployeeDetail.prototype.onReasonChange = onReasonChange;
        EmployeeDetail.prototype.onTypeChange = onTypeChange;

        return EmployeeDetail;

    });
