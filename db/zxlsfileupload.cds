namespace zxlsfileupload;

@cds.persistence.exists
entity Dummy {
	key SEQ_NO : Integer not null;
	DATE : Date;
	COUNTRY_CODE : String(2);
	COMPANY_CODE : String(10);
	AMOUNT : Decimal(15,2);
};