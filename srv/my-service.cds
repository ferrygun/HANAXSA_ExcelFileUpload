//tables
using zxlsfileupload.Dummy as dummy from '../db/data-model';

service CatalogService {
  //** App ** //
  entity zxlsfileupload_dummy @(
	title: '{i18n>zxlsfileupload_dummyService}',
	Capabilities: {
		InsertRestrictions: {Insertable: true},
		UpdateRestrictions: {Updatable: true},
		DeleteRestrictions: {Deletable: true}
	}
  ) as projection on dummy;
 }