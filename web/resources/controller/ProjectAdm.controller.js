sap.ui.define([
	"XFL/XFL/controller/BaseController",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/json/JSONModel"
], function (BaseController, MessageToast, MessageBox, Sorter, Filter, FilterOperator, FilterType, JSONModel) {
	jQuery.sap.require("XFL.XFL.lib.xlsx");
	"use strict";

	const batchGroupId = "projectGroup";

	return BaseController.extend("XFL.XFL.controller.ProjectAdm", {

		/**
		 *  Hook for initializing the controller
		 */
		onInit: function () {
			this.oItemTemplate = this.byId("columnListItem").clone();

			var oViewModel = new JSONModel({
				busy: false,
				hasUIChanges: false,
				usernameEmpty: true,
				order: 0
			});
			this.getView().setModel(oViewModel, "appView");

			const router = this.getOwnerComponent().getRouter();
			const route = router.getRoute("home");
			route.attachPatternMatched(this.onPatternMatched, this);
			route.attachBeforeMatched(this.reset, this);
		},

		/* =========================================================== */
		/*           begin: event handlers                             */
		/* =========================================================== */

		onPatternMatched: function (event) {
			BaseController.technicalerror = false;

			var oTable = this.byId("projectList");

			oTable.bindAggregation("items", {
				path: 'zxflModel>/zxlsfileupload_dummy',
				parameters: {
					$orderby: 'COMPANY_CODE asc',
					$$updateGroupId: batchGroupId
				},
				template: this.oItemTemplate,
				events: {
					dataRequested: () => this._setBusy(true),
					dataReceived: () => this._setBusy(false)
				}
			});
		},

		onValidate: function (e) {
			var fU = this.getView().byId("idfileUploader");
			var domRef = fU.getFocusDomRef();
			var file = domRef.files[0];
			var this_ = this;

			var reader = new FileReader();
			reader.onload = function (e) {
				var strCSV = e.target.result;

				var workbook = XLSX.read(strCSV, {
					type: 'binary'
				});

				var result_final = [];
				var result = [];
				workbook.SheetNames.forEach(function (sheetName) {
					console.log(sheetName);
					if (sheetName === "Sheet1") {
						var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
						if (csv.length) {
							result.push(csv);
						}
						result = result.join("[$@~!~@$]")
					}
				});

				var lengthfield = result.split("[$@~!~@$]")[0].split("[#@~!~@#]").length;
				console.log("lengthfield: " + lengthfield);

				var len = 0;
				if (lengthfield === 4) {
					for (var i = 1; i < result.split("[$@~!~@$]").length; i++) {
						if (result.split("[$@~!~@$]")[i].length > 0) {

							var rec = result.split("[$@~!~@$]")[i].split("[#@~!~@#]");
							if (rec.length > 0) {
								len = rec[0].trim().length + rec[1].trim().length + rec[2].trim().length + rec[3].trim().length;
								if (len > 0) {
									result_final.push({
										'SEQ_NO': i,
										'DATE': rec[0].trim(),
										'COUNTRY_CODE': rec[1].trim(),
										'COMPANY_CODE': rec[2].trim(),
										'AMOUNT': rec[3].trim()
									});
								}
							}
						}
					}

					if (result_final.length === 0) {
						fU.setValue("");
						MessageToast.show(this_._getText("LabelMsg1"));
					} else if (result_final.length >= 101) {
						fU.setValue("");
						MessageToast.show(this_._getText("LabelMsg2"));
					} else {
						var oList = this_.byId("projectList"),
							oBinding = oList.getBinding("items");

						for (var k = 0; k < result_final.length; k++) {
							oBinding.create({
								"SEQ_NO": result_final[k].SEQ_NO,
								"DATE": result_final[k].DATE,
								"COUNTRY_CODE": result_final[k].COUNTRY_CODE,
								"COMPANY_CODE": result_final[k].COMPANY_CODE,
								"AMOUNT": result_final[k].AMOUNT
							});
						}

						this_.onSave();
						fU.setValue("");
					}
				} else {
					MessageToast.show(this_._getText("LabelMsg3"));
				}
			};

			if (typeof file !== 'undefined') {
				reader.readAsBinaryString(file);
			} else {
				MessageToast.show(this_._getText("LabelMsg4"));
				return;
			}
		},


		/**
		 * Save changes to the source.
		 */
		onSave: function () {
			var oTable = this.byId("projectList"),
				aItems = oTable.getItems();
				
			var this_ = this;

			var fnSuccess = function () {
				this._setBusy(false);
				MessageToast.show(this._getText("changesSentMessage"));
				this._setUIChanges(false);
			}.bind(this);

			var fnError = function (oError) {
				this._setBusy(false);
				this._setUIChanges(false);
				MessageBox.error(oError.message);
			}.bind(this);

			this._setBusy(true); // Lock UI until submitBatch is resolved.
			var oModel = this.getOwnerComponent().getModel("zxflModel");

			oModel.submitBatch(batchGroupId).then(fnSuccess, fnError);
			BaseController.technicalerror = false; // If there were technical errors, a new save resets them.
		},

		submitBatch: function (sGroupId) {
			var this_ = this;

			function resetBusy() {
				this_._setBusy(false);
			}

			this._setBusy(true);
			var oModel = this.getOwnerComponent().getModel("zxflModel");
			return oModel.submitBatch(sGroupId).then(resetBusy, resetBusy);
		},

		/* =========================================================== */
		/*           end: event handlers                               */
		/* =========================================================== */

		/**
		 * Convenience method for retrieving a translatable text.
		 * @param {string} sTextId - the ID of the text to be retrieved.
		 * @param {Array} [aArgs] - optional array of texts for placeholders.
		 * @returns {string} the text belonging to the given ID.
		 */
		_getText: function (sTextId, aArgs) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);
		},

		/**
		 * Set hasUIChanges flag in View Model
		 * @param {boolean} [bHasUIChanges] - set or clear hasUIChanges
		 * if bHasUIChanges is not set, the hasPendingChanges-function of the OdataV4 model determines the result
		 */
		_setUIChanges: function (bHasUIChanges) {
			if (BaseController.technicalerror) {
				// If there is currently a technical error, then force 'true'.
				bHasUIChanges = true;
			} else if (bHasUIChanges === undefined) {
				bHasUIChanges = this.getView().getModel().hasPendingChanges();
			}
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/hasUIChanges", bHasUIChanges);
		},

		/**
		 * Set busy flag in View Model
		 * @param {boolean} bIsBusy - set or clear busy
		 */
		_setBusy: function (bIsBusy) {
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/busy", bIsBusy);
		}
	});
});