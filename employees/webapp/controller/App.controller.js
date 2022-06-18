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


        var App = Controller.extend("mr.employees.controller.App",{});

        App.prototype.onInit = onInit;

        return App;
    });
