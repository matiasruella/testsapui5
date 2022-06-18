sap.ui.define([
    "mr/employees/controller/Base.controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.Filter } Filter
     * @param {typeof sap.ui.model.FilterOperator } FilterOperator
     */
    function (Base,Filter,FilterOperator) {
        "use strict";

        return Base.extend("mr.employees.controller.MasterEmployee", {
            onInit: function () {

              this._bus = sap.ui.getCore().getEventBus();

            },

            onValidate : onValidate,

            onFilter: onFilter,

            onClearFilter: onClearFilter,

            onDetailPress : onDetailPress,

            onShowCitySelect: onShowCitySelect,

            onShowOrders:onShowOrders,

            onShowOrdersByIcon:onShowOrdersByIcon,
            
            onCloseOrders:onCloseOrders,

            onNavigationEmplpoyee: onNavigationEmplpoyee
        });


        function onNavigationEmplpoyee(oEvent){

            let path = oEvent.getSource().getBindingContext("odataNorthwind").getPath();
            this._bus.publish("flexible","showDetails",path);

        }

        function onDetailPress(oEvent){
            var itemSelected = oEvent.getSource();
            var oContext = itemSelected.getBindingContext();
            var objectContext = oContext.getObject();
            sap.m.MessageToast.show(objectContext.FirstName + " tiene el código postal " + objectContext.PostalCode)
        }

        function onShowOrdersByIcon(oEvent){
            
            var itemPressed = oEvent.getSource();

            var oContext = itemPressed.getBindingContext("odataNorthwind");

            if  (!this._oDialogOrders)
            {   
                this._oDialogOrders = sap.ui.xmlfragment("mr.employees.fragment.DialogOrders",this);
                this.getView().addDependent(this._oDialogOrders);

            }
            
                this._oDialogOrders.bindElement("odataNorthwind>" + oContext.getPath());

              this._oDialogOrders.open();

        }
        
        function onCloseOrders(){
            this._oDialogOrders.close();

        }
        function onShowOrders(oEvent){
            console.log(oEvent)
            var itemSelected = oEvent.getSource();
            var oContext = itemSelected.getBindingContext();
            var objectContext = oContext.getObject();

            var orderTable = this.byId("ordersTable");
            orderTable.destroyItems();

            var ordersItems = [];
            
            this.getView().getModel().read("/Employees("+ objectContext.EmployeeID + ")/Orders", {
                success: function(oRetrievedResult)
                 {
                    oRetrievedResult.results.forEach(element => {
                        ordersItems.push( new sap.m.ColumnListItem({
                            cells:[
                                new sap.m.Label({text:element.OrderID}),
                                new sap.m.Label({text:element.Freight}),
                                new sap.m.Label({text:element.ShipAddress})
                            ] 
                        }));
                         });
                        var newTable = new sap.m.Table({
                            width:"auto",
                            columns:[
                                new sap.m.Column({ header : new sap.m.Label({text:"{i18n>orderIdColumn}"})}),
                                new sap.m.Column({ header : new sap.m.Label({text:"{i18n>freightColumn}"})}),
                                new sap.m.Column({ header : new sap.m.Label({text:"{i18n>shipAddressColumn}"})})
                            ],
                            items: ordersItems                           

                        }).addStyleClass("sapUiSmallMargin");

                        orderTable.addItem(newTable);

                    
                 },
                error: function(oError) 
                { 
                    console.log(oError)
                 }
              });


        }

        function onShowCitySelect(oControlEvent){
            console.log(oControlEvent)
        }
        function onFilter(){
    
            var filters = [];
            
            var modelCountry = this.getView().getModel("Countries").getData();            
    
            if (modelCountry.EmployeeId !== "")
            {
                filters.push( new Filter("EmployeeID",FilterOperator.EQ,modelCountry.EmployeeId))

                
            }

            if (modelCountry.CountryId !== "")
            {
                filters.push( new Filter("Country",FilterOperator.EQ,modelCountry.CountryId))

                
            }

            var oList = this.getView().byId("employeesTable");
            var oBinding = oList.getBinding("items");
            oBinding.filter(filters);
    
            
    
        }
        function onClearFilter(){

            var modelCountry = this.getView().getModel("Countries");  
            modelCountry.setProperty("/EmployeeId","");
            modelCountry.setProperty("/CountryId","");
        }
        function onValidate(){
            var inputEmployee = this.byId("inputEmployee");
            var valueEmployee = inputEmployee.getValue();
    
            var labelCountry = this.byId("labelCountry");
            var slCountry = this.byId("slCountry");
    
            if (valueEmployee.length === 6){
                labelCountry.setVisible(true);
                slCountry.setVisible(true);
    
            }else{
                labelCountry.setVisible(false);
                slCountry.setVisible(false);
            }
    
        }
    });

   
