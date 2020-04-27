/*eslint no-console: 0, no-unused-vars: 0, no-use-before-define: 0, no-redeclare: 0, no-shadow:0*/
/*eslint-env es6 */
sap.ui.require(["sap/ui/core/Core", "sap/ui/core/Component"], (oCore, Component) => {

	function onLoadSession(myJSON) {
		try {
			var result = JSON.parse(myJSON);
			if (Object.keys(result.userContext).length > 0) {
				if (result.userContext.userInfo.familyName !== "") {
					return result.userContext.userInfo.givenName + " " + result.userContext.userInfo.familyName;
				} else {
					return result.userContext.userInfo.logonName;
				}
			}
		} catch (e) {
			return "";
		}
		return "";
	}

	function getSessionInfo() {
		var aUrl = "/node/getSessionInfo";

		return onLoadSession(
			jQuery.ajax({
				url: aUrl,
				method: "GET",
				dataType: "json",
				async: false
			}).responseText);
	}

	Component.create({
		id: "comp",
		name: "root",
		manifestFirst: true,
		async: true
	}).then((oComp) => {
		sap.ui.require(["sap/ui/core/ComponentContainer"], (ComponentContainer) => {
			let oCont = new ComponentContainer({
				component: oComp,
				height: "100%"
			});

			let oSubMenuList = new sap.ui.unified.MenuItem({
				text: "version: " + oComp.getManifestEntry("/sap.app/applicationVersion").version
			});

			let oSubMenu = new sap.ui.unified.Menu({
				items: [
					oSubMenuList
				]
			});

			let username = getSessionInfo();
			oCore.loadLibrary("sap.ui.unified", {
				async: true
			}).then(() => {
				let oShell = new sap.ui.unified.Shell({
					id: "myShell",
					//icon: "",
					headEndItems: new sap.ui.unified.ShellHeadItem({
						icon: "sap-icon://log",
						tooltip: "Logoff",
						press: () => {
							window.location.href = "";
						}
					}),
					user: new sap.ui.unified.ShellHeadUserItem({
						image: "sap-icon://person-placeholder",
						username: username,
						press: function (oEvent) {
                			let oDock = sap.ui.core.Popup.Dock;
                			oSubMenu.open(false,  oEvent.getSource(), oDock.BeginTop, oDock.BeginBottom,  oEvent.getSource());
						}
					}),
					content: oCont
				}).placeAt("content");
			});
		});
	});
});