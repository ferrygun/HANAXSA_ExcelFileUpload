/*eslint no-console: 0, no-unused-vars: 0, no-undef:0, no-process-exit:0, new-cap:0*/
/*eslint-env node, es6 */

"use strict";

const uuid = require("uuid/v4");
const cds = require("@sap/cds");

module.exports = function (entities) {
	const {
		catalog
	} = entities;

	const adm = "ODATASERVICEADMIN";

	this.before("CREATE", "zxlsfileupload_dummy", async(User) => {
		console.log("** Create zxlsfileupload_dummy **");
		const {
			data
		} = User;
		console.log(data);

		const dbClass = require(global.__base + "utils/dbPromises");
		var client = await dbClass.createConnection();
		let db = new dbClass(client);

		const statement = await db.preparePromisified(
			`SELECT \"zxlsfileuploadSeqId\".NEXTVAL AS SEQ_NO
							 FROM DUMMY`);
		const dataResults = await db.statementExecPromisified(statement, []);
		console.log(dataResults[0].SEQ_NO);

		data.SEQ_NO = dataResults[0].SEQ_NO;

		return data;
	});
};