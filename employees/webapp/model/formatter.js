sap.ui.define([],
function(){

    function dateFormat(date){
        var timeDate = 24 * 60 * 60 * 1000;
        if (date){
            var dateNow = new Date();
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern:"yyyy/MM/dd"});

            var dateNowFormat = new Date(dateFormat.format(dateNow));

            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            
            switch(true){
                case date.getTime() === dateNowFormat.getTime():
                    return oResourceBundle.getText("today")
                
                case date.getTime() === dateNowFormat.getTime() + timeDate:
                    return oResourceBundle.getText("tomorrow")
                        
                case date.getTime() === dateNowFormat.getTime() - timeDate:
                    return oResourceBundle.getText("yesterday")
                
                default:
                    return "";
                    
            }



        }

    }

    return {
        dateFormat:dateFormat
    };


});