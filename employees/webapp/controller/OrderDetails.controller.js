//@ts-nocheck
sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/routing/History",
        "sap/m/MessageBox",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"
    ],
    /**
     * 
     * @param { typeof sap.ui.core.mvc.Controller } Controller 
     * @param { typeof sap.ui.core.routing.History } History 
     * @param { typeof sap.m.MessageBox } MessageBox 
     * @param { typeof sap.ui.model.Filter } Filter 
     * @param { typeof sap.ui.model.FilterOperator } FilterOperator 
     */
    function (Controller, History, MessageBox,Filter,FilterOperator) {

        function _onObjectMatched(oEvent) {

            this.onClearSignature();

            this.getView().bindElement({
                path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
                model: "odataNorthwind",
                events: {
                    dataReceived: function (oData) {
                        var data = oData.getParameter("data");
                        _readSignature.bind(this)(data.OrderID, data.EmployeeID);
                        _readFiles.bind(this)(data.OrderID, data.EmployeeID);

                    }.bind(this)
                }
            });

            const objContext = this.getView().getModel("odataNorthwind").getContext("/Orders("
                + oEvent.getParameter("arguments").OrderID + ")").getObject();

            if (objContext) {
                _readSignature.bind(this)(objContext.OrderID, objContext.EmployeeID);
                _readFiles.bind(this)(objContext.OrderID, objContext.EmployeeID);
            }

        }

        function _readFiles(orderId, employeeId){

            this.byId("uploadCollection").bindAggregation("items",{
                path: "incidenceModel>/FilesSet",
                filters:[
                    new Filter("OrderId",FilterOperator.EQ,orderId),
                    new Filter("SapId",FilterOperator.EQ,this.getOwnerComponent().SapId),
                    new Filter("EmployeeId",FilterOperator.EQ,employeeId)                   

                ],
                template: new sap.m.UploadCollectionItem({
                    documentId:"{incidenceModel>AttId}",
                    fileName: "{incidenceModel>FileName}"

                }).attachPress(this.downloadFile)
            
            })

        }
        function _readSignature(orderId, employeeId) {

            this.getView().getModel("incidenceModel").read("/SignatureSet(OrderId='" + orderId + "',SapId='" + this.getOwnerComponent().SapId + "',EmployeeId='" + employeeId + "')", {
                success: function (data) {

                    var signature = this.getView().byId("signature");

                    if (data.MediaContent !== "") {
                        signature.setSignature("data:image/png;base64," + data.MediaContent)
                    }

                }.bind(this),
                error: function (e) {
                    console.error(e);
                }.bind(this)
            });


        }


        /**
         * 
         */
        function onInit() {

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMatched, this);

        }



        function onBack() {

            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMain", true);
            }


        }

        function onClearSignature(oEvent) {

            var signature = this.byId("signature");
            signature.clear();
        }

        function factoryOrderDetails(listId, oContext) {

            var contextobj = oContext.getObject();

            contextobj.Currency = "EUR";

            var unitsInStock = oContext.getModel().getProperty("/Products(" + contextobj.ProductID + ")/UnitsInStock");
            console.log(contextobj.Quantity + "<=" + unitsInStock)
            if (contextobj.Quantity <= unitsInStock) {
                var objectListItem = new sap.m.ObjectListItem({

                    title: "{odataNorthwind>/Products(" + contextobj.ProductID + ")/ProductName} ({odataNorthwind>Quantity})",
                    number: "{parts: [ {path: 'odataNorthwind>UnitPrice'}, {path:'odataNorthwind>Currency'}], type:'sap.ui.model.type.Currency', formatOptions:{showMeasure:false}}",
                    numberUnit: "{odataNorthwind>Currency}"
                });

                return objectListItem;

            } else {

                var customListItem = new sap.m.CustomListItem({

                    content: [
                        new sap.m.Bar({
                            contentLeft: new sap.m.Label({ text: "{odataNorthwind>/Products(" + contextobj.ProductID + ")/ProductName} ({odataNorthwind>Quantity})" }),
                            contentMiddle: new sap.m.ObjectStatus({ text: "{i18n>availableStock} {odataNorthwind>/Products(" + contextobj.ProductID + ")/UnitsInStock}", state: "Error" }),
                            contentRight: new sap.m.Label({ text: "{parts: [ { path: 'odataNorthwind>UnitPrice'}, {path:'odataNorthwind>Currency'}], type:'sap.ui.model.type.Currency'}" })
                        })
                    ]

                });

                return customListItem;

            }



        }

        function onSaveSignature(oEvent) {

            const signature = this.byId("signature");

            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            let signaturePng;

            if (!signature.isFill()) {

                MessageBox.error(oResourceBundle.getText("fillSignature"))

            } else {

                signaturePng = signature.getSignature().replace("data:image/png;base64,", "");
                let objectOrder = oEvent.getSource().getBindingContext("odataNorthwind").getObject();

                var body = {
                    OrderId: objectOrder.OrderID.toString(),
                    SapId: this.getOwnerComponent().SapId,
                    EmployeeId: objectOrder.EmployeeID.toString(),
                    MimeType: "image/png",
                    MediaContent: signaturePng
                };

                this.getView().getModel("incidenceModel").create("/SignatureSet", body, {
                    success: function () {
                        MessageBox.information(oResourceBundle.getText("signatureSaved"))
                    }.bind(this),
                    error: function (e) {
                        MessageBox.information(oResourceBundle.getText("signatureNotSaved"))
                    }.bind(this)


                })



            }




        }

        function onFileBeforeUpload(oEvent){

            let fileName = oEvent.getParameter("fileName");

            let objContext = oEvent.getSource().getBindingContext("odataNorthwind").getObject();

            let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: objContext.OrderID + ";" + this.getOwnerComponent().SapId + ";" + objContext.EmployeeID + ";" + fileName

            })

            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);           


        }

        function onFileChange(oEvent){

            let oUploadCollection = oEvent.getSource();

            // Header Token CSRF
            let oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("incidenceModel").getSecurityToken()
            })

            oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
        }

        function onFileUploadComplete(oEvent){

            oEvent.getSource().getBinding("items").refresh();


        }
        
        function onFileDeleted(oEvent){
            var oUploadCollection = oEvent.getSource();

            var sPath = oEvent.getParameter("item").getBindingContext("incidenceModel").getPath();

            this.getView().getModel("incidenceModel").remove(sPath,{
                success: function(){
                    oUploadCollection.getBinding("items").refresh()

                }.bind(this),
                error: function(e){}
            })
        }

        function downloadFile(oEvent){
            const sPath = oEvent.getSource().getBindingContext("incidenceModel").getPath();

            window.open("sap/opu/odata/sap/YSAPUI5_SRV_01" + sPath + "/$value");
        }


        var OrderDetails = Controller.extend("mr.employees.controller.OrderDetails", {});

        OrderDetails.prototype.onInit = onInit;
        OrderDetails.prototype.onBack = onBack;
        OrderDetails.prototype.onClearSignature = onClearSignature;
        OrderDetails.prototype.factoryOrderDetails = factoryOrderDetails;
        OrderDetails.prototype.onSaveSignature = onSaveSignature;
        OrderDetails.prototype.onFileBeforeUpload = onFileBeforeUpload;
        OrderDetails.prototype.onFileChange = onFileChange;
        OrderDetails.prototype.onFileUploadComplete = onFileUploadComplete;
        OrderDetails.prototype.onFileDeleted = onFileDeleted;
        OrderDetails.prototype.downloadFile = downloadFile;
        return OrderDetails;
    });
