sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageBox"
], function (JSNOModel, exportLibrary, Spreadsheet, MessageBox) {
    "use strict";
    var EdmType = exportLibrary.EdmType;

    return {
		/**
		 * Initialization of events for upload
		 * @param {object} 
		 *	oRef - Reference of where the commonuploadUI.fragment.xml used.
		 *	sService - oData Service name
		 *	sUploadEntity - Create stream entity name for upload
		 * 
		 * 
		 */
        init: function (initData) {
            this.initData = initData;
            // if (initData.oRef) {
            initData.oRef.getView().setModel(new JSNOModel([]), "EXCEL_RESULTS_MODEL");

            //  Called if mismatch in file type
            initData.oRef.byId("idFileUploader").attachTypeMissmatch(function () {
                MessageBox.error(initData.oRef.getView().getModel("i18n").getResourceBundle().getText("messageBoxError"));
            }.bind(initData.oRef));
        },

        //change event
        handleUploadChange: function (oEvent) {
            if (oEvent.getParameter("files") && oEvent.getParameter("files")[0]) { 
                this.addHeaderParameters();
            }
        },

        //Add header parameters and sets the uplodUrl
        addHeaderParameters: function () {
            this.initData.oRef.getView().setBusy(true);              
            var oCustomerHeaderToken = new sap.ui.unified.FileUploaderParameter({
                name: "x-csrf-token",
                value: this.initData.oRef.getView().getModel().getSecurityToken()
            });
            this.initData.oRef.getView().byId("idFileUploader").addHeaderParameter(oCustomerHeaderToken);

            var oSlug = new sap.ui.unified.FileUploaderParameter({
                name: "slug",
                value: this.initData.oRef.getView().byId("idFileUploader").getValue() + "|" + this.attachSelect()
            });
            this.initData.oRef.getView().byId("idFileUploader").addHeaderParameter(oSlug);

            var sUploadURL = this.initData.sServiceURL + this.initData.sService + "/" + this.initData.sUploadEntity;
            this.initData.oRef.getView().byId("idFileUploader").setUploadUrl(sUploadURL);  
            this.initData.oRef.getView().setBusy(false);          
        },

        //Fetches the value based on checkbox state
        attachSelect: function () {
            if (this.initData.oRef.getView().byId("idChkBox").getSelected()) {
                var sTestRunValue = "X";
            } else {
                var sTestRunValue = "";
            }
            return sTestRunValue;
        },

        // Function to upload template file
        handlePress: function () {
            this.initData.oRef.getView().setBusy(true);
            this.initData.oRef.byId("idFileUploader").upload();
        },

        //upload complete method 
        handleComplete: function (oEvent) {
            var oResponse = (new window.DOMParser()).parseFromString(oEvent.getParameter("responseRaw"), "text/xml");
            if (oResponse.childNodes[0].children[6].children.length > 0) {
                var aItem = oResponse.childNodes[0].children[6].children[2];
                this.parseMessages(aItem.innerHTML);
            }
            this.initData.oRef.getView().byId("idFileUploader").clear();
            this.initData.oRef.getView().byId("idFileUploader").removeAllHeaderParameters();
            this.initData.oRef.getView().setBusy(false);
        },

        //Parsing data and assigning to objects
        parseMessages: function (aItem) {
            var aExcelData = [];
            var aData = aItem.split("\n");
            for (var i = 1; i <= aData.length - 2; i++) {
                var oExcelObjects = {};
                oExcelObjects.PARTNER = aData[i].split("||")[1];
                oExcelObjects.GRADE_METHOD = aData[i].split("||")[2];
                oExcelObjects.GRADE = aData[i].split("||")[3];
                oExcelObjects.TENDENCY = aData[i].split("||")[4];
                oExcelObjects.ID = aData[i].split("||")[5];
                oExcelObjects.TEXT = aData[i].split("||")[6];
                oExcelObjects.RUNSTATUS = aData[i].split("||")[7];
                oExcelObjects.RUNMSG = aData[i].split("||")[8];
                aExcelData.push(oExcelObjects);
            }

            // Setting data to the model
            this.initData.oRef.getView().getModel("EXCEL_RESULTS_MODEL").setData(aExcelData);
        },

        //Export table data
        onExport: function () {
            var aCols, aProducts, oSettings, oSheet;

            aCols = this.createColumnConfig();
            aProducts = this.initData.oRef.getView().getModel("EXCEL_RESULTS_MODEL").getData()

            oSettings = {
                workbook: { columns: aCols },
                dataSource: aProducts,
                fileName: this.initData.sFileName
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(function () {
                    MessageBox.information(this.initData.oRef.getView().getModel("i18n").getResourceBundle().getText("messageBoxInformation"));
                })
                .finally(oSheet.destroy);
        },

        // Building labels & properties for excel
        createColumnConfig: function () {
            return [
                {
                    label: this.initData.oRef.getView().getModel("i18n").getResourceBundle().getText("customerNo"),
                    property: 'PARTNER',
                    type: EdmType.String
                },
                {
                    label: this.initData.oRef.getView().getModel("i18n").getResourceBundle().getText("rating"),
                    property: 'GRADE_METHOD',
                    type: EdmType.String
                },
                {
                    label: this.initData.oRef.getView().getModel("i18n").getResourceBundle().getText("ratingPoints"),
                    property: 'GRADE',
                    type: EdmType.String
                },
                {
                    label: this.initData.oRef.getView().getModel("i18n").getResourceBundle().getText("tendency"),
                    property: 'TENDENCY',
                    type: EdmType.String
                },
                {
                    label: this.initData.oRef.getView().getModel("i18n").getResourceBundle().getText("id"),
                    property: 'ID',
                    type: EdmType.String
                },
                {
                    label: this.initData.oRef.getView().getModel("i18n").getResourceBundle().getText("text"),
                    property: 'TEXT',
                    type: EdmType.String
                },
                {
                    label: this.initData.oRef.getView().getModel("i18n").getResourceBundle().getText("status"),
                    property: 'RUNSTATUS',
                    type: EdmType.String
                },
                {
                    label: this.initData.oRef.getView().getModel("i18n").getResourceBundle().getText("message"),
                    property: 'RUNMSG',
                    type: EdmType.String
                }];
        }
    };
});