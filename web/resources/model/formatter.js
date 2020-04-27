sap.ui.define([
	], function () {
		"use strict";
		
		return {

			DateFormat: function (date) {
				jQuery.sap.require("sap.ui.core.format.DateFormat");
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "MMM d, y"
				});
				
				var sdate = "";
				if(typeof date !== "undefined") {
					var dateTemp = new Date(date);
					//dateTemp.setHours(24);
					var datex = dateTemp.getDate();
					var yearx = dateTemp.getFullYear();
					var monthx = dateTemp.getMonth() + 1;

					sdate = new Date(yearx + "/" + monthx + "/" + datex);
					sdate = dateFormat.format(sdate);
				}
				return sdate;
			}
		};
	}
);