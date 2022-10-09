sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "excelupload/utils/CommonUpload",
    "excelupload/utils/Constants"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, CommonUpload, Constants) {
        "use strict";

        return Controller.extend("excelupload.controller.ExcelUpload", {
            onInit: function () {
                // Passing reference of contansts to utility file for data upload
                CommonUpload.init({
                    oRef: this,
                    sServiceURL: Constants.serviceURL,
                    sService: Constants.service,
                    sUploadEntity: Constants.entitySet,
                    sFileName: Constants.excelFileName
                })
            },

            // Function to export data in table    
            onExport: function() {
                // Calling export function in utility file 
                CommonUpload.onExport()               
            },

            // change event of File uploader
            onUploadChange: function(oEvent) {
                // Calling change function in utility file
                CommonUpload.handleUploadChange (oEvent)                
            },            

            // Submit button function
            handlePress: function(oEvent) {
                // Calling submit button function in utility file
                CommonUpload.handlePress()
            },

            // Event for upload complete
            handleUploadComplete: function(oEvent) {
                // Calling upload complete function in utility file
                CommonUpload.handleComplete(oEvent)
            }
        });
    });
