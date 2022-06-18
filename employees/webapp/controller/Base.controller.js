//@ts-nocheck
sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    /**
     * 
     * @param { typeof sap.ui.core.mvc.Controller } Controller 
     */
    function (Controller) {

        /**
         * 
         */
        function onInit(){

        }

        
        function toOrderDetails(oEvent){

            var orderID = oEvent.getSource().getBindingContext("odataNorthwind").getObject().OrderID;

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            oRouter.navTo("RouteOrderDetails",{
                OrderID : orderID
            });
        }

        var Base = Controller.extend("mr.employees.controller.Base",{});

        Base.prototype.onInit = onInit;
        Base.prototype.toOrderDetails = toOrderDetails;

        return Base;
    });
