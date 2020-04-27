sap.ui.define([
	"XFL/XFL/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, Filter, FilterOperator, FilterType, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("XFL.XFL.controller.App", {
        onLoadSession: function(myJSON) {
			try {
				var result = JSON.parse(myJSON);
				if (Object.keys(result).length > 0) {
						return result;
				}
			} catch (e) {
				return "";
			}
			return "";
		},

		getUsrType: function () {
			var aUrl = "/node/userinfo";
		
			return this.onLoadSession(
				jQuery.ajax({
					url: aUrl,
					method: "GET",
					dataType: "json",
					async: false
				}).responseText);
		},
	
		onInit: function () {
			BaseController.visible = false;
			var usrType = this.getUsrType();

			if(Object.keys(usrType).length > 0) {
				var scopes = usrType.scopes;
				for(var i=0; i < scopes.length; i++) {
					if(scopes[i].includes("ODATASERVICEADMIN")) {
						console.log("adm");
						BaseController.visible = true;
						break;
					}
				}
			}

			var oMessageManager = sap.ui.getCore().getMessageManager(),
				oMessageModel = oMessageManager.getMessageModel(),
				oMessageModelBinding = oMessageModel.bindList("/", undefined, [],
					new Filter("technical", FilterOperator.EQ, true));

			this.getView().setModel(oMessageModel, "message");

			oMessageModelBinding.attachChange(this.onMessageBindingChange, this);
			BaseController.technicalerror = false;
		},

		onMessageBindingChange: function (oEvent) {
			var aContexts = oEvent.getSource().getContexts(),
				aMessages,
				bMessageOpen = false;

			if (bMessageOpen || !aContexts.length) {
				return;
			}

			// Extract and remove the technical messages
			aMessages = aContexts.map(function (oContext) {
				return oContext.getObject();
			});
			sap.ui.getCore().getMessageManager().removeMessages(aMessages);

			BaseController.technicalerror = true;
			console.log("Error: " + aMessages[0].message);
			MessageBox.error(aMessages[0].message, {
				id: "serviceErrorMessageBox",
				onClose: function () {
					bMessageOpen = false;
				}
			});

			bMessageOpen = true;
		}

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf XFL.XFL.view.App
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf XFL.XFL.view.App
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf XFL.XFL.view.App
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf XFL.XFL.view.App
		 */
		//	onExit: function() {
		//
		//	}

	});

});