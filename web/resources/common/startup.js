/*eslint no-console: 0, no-unused-vars: 0, no-use-before-define: 0, no-redeclare: 0, no-shadow:0*/
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

function localShellStartup(name) {

	sap.ui.getCore().attachInit(function () {
		var ComponentContainer = new sap.ui.core.ComponentContainer({
			height: "100%"
		});
		var username = getSessionInfo();
		// create a shell
		new sap.ui.unified.Shell({
			id: "myShell",
			//icon: "",
			headEndItems: new sap.ui.unified.ShellHeadItem({
				icon: "sap-icon://log",
				tooltip: "Logoff",
				press: function () {
					window.location.href = "";
				}
			}),
			user: new sap.ui.unified.ShellHeadUserItem({
				image: "sap-icon://person-placeholder",
				username: username
			}),
			content: ComponentContainer
		}).placeAt("content");

		var oComponent = sap.ui.component({
			id: "comp",
			name: name,
			manifestFirst: true,
			async: true
		}).then(function (oComponent) {
			ComponentContainer.setComponent(oComponent);
		});

	});
}