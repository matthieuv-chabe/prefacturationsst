import {Salesforce, SFAddress_t} from "@/core/salesforce";
import SQLQueryBuilder from "@/core/SqlQueryBuilder/SQLQueryBuilder";

type SFJobInformation = {
	Id: string;
	Start_Date_Time__c: string;
	End_Date_Time__c: string;
	ServiceType_ERP_ID__c: string;
	Purchase_Price__c: number;
	Calculated_Incl_VAT_Price__c: number; // Selling price
	Purchase_Invoice_Number__c: string;
	Pick_Up_Location__c: string;
	Drop_Off_Location__c: string;
	Partner_ERP_ID__c: string;
	OrderedVehicleType_ERP_ID__c: string;
	Status_ERP_ID__c: string;
	Client_Salesforce_Code__c: string;
	COM_ID__c: string;
	Chauffeur_ERP_ID__c: string;
	Transmitted_To_Partner__c: string;
	Sage_Number__c: string;
}

type SFChauffeur = {
	Id: string;
	CHU_NOM__c: string;
	CHU_PRENOM__c: string;
}

class CSalesforceChabe {

	public async getMissionsBetweenDates(
		dateBegin: Date,
		dateEnd: Date,
		partnerId: string = "0",
	): Promise<{count: number, jobs: SFJobInformation[]}>
	{
		const query = `SELECT Id, Start_Date_Time__c, End_Date_Time__c, ServiceType_ERP_ID__c, Purchase_Price__c, Calculated_Incl_VAT_Price__c, Purchase_Invoice_Number__c, Pick_Up_Location__c, Drop_Off_Location__c, Partner_ERP_ID__c, OrderedVehicleType_ERP_ID__c, Status_ERP_ID__c, Client_Salesforce_Code__c, COM_ID__c, Chauffeur_ERP_ID__c, Transmitted_To_Partner__c, Sage_Number__c FROM Job__c WHERE Start_Date_Time__c >= ${dateBegin.toISOString()} AND End_Date_Time__c <= ${dateEnd.toISOString()} AND Partner_ERP_ID__c = '${partnerId}'`;
		const qresult = await Salesforce.soql(query);
		return { count: qresult.totalSize, jobs: qresult.records as unknown as SFJobInformation[]};
	}

	public async getMissionsBetweenDatesWhereX(
		dateBegin: Date,
		dateEnd: Date,
		limit: number = 100,
		offset: number = 0,
		folder_id: string = "0",
		vehicle_types: string[] = [],
		service_types: string[] = [],
		clients: string[] = [],
		partners: string[] = [],
		status: string[] = [],
		only_sent_to_supplier: boolean = false,
		only_done_prefacturation: boolean = false,
		chauffeur_names: string[] = []
	): Promise<{count: number, jobs: SFJobInformation[]}> {

		const sqlb = new SQLQueryBuilder();

		sqlb.setColumnType("Id", "string");
		sqlb.setColumnType("Start_Date_Time__c", "date");
		sqlb.setColumnType("End_Date_Time__c", "date");
		sqlb.setColumnType("Purchase_Price__c", "number");
		sqlb.setColumnType("Calculated_Incl_VAT_Price__c", "number");
		sqlb.setColumnType("Purchase_Invoice_Number__c", "string");
		sqlb.setColumnType("Pick_Up_Location__c", "string");
		sqlb.setColumnType("Drop_Off_Location__c", "string");
		sqlb.setColumnType("Partner_ERP_ID__c", "string");
		sqlb.setColumnType("OrderedVehicleType_ERP_ID__c", "string");
		sqlb.setColumnType("Status_ERP_ID__c", "string");
		sqlb.setColumnType("Client_Salesforce_Code__c", "string");
		sqlb.setColumnType("COM_ID__c", "string");
		sqlb.setColumnType("Chauffeur_ERP_ID__c", "string");
		sqlb.setColumnType("ServiceType_ERP_ID__c", "string");
		sqlb.setColumnType("Client_Salesforce_Code__c", "string");
		sqlb.setColumnType("Transmitted_To_Partner__c", "string");
		sqlb.setColumnType("Sage_Number__c", "string");

		sqlb.addFilter("Start_Date_Time__c", ">=", dateBegin.toISOString());
		sqlb.addFilter("End_Date_Time__c", "<=", dateEnd.toISOString());
		sqlb.addFilter("Partner_ERP_ID__c", "<>", "0");
		sqlb.addFilter("Partner_ERP_ID__c", "<>", "1");
		sqlb.addFilter("Partner_ERP_ID__c", "<>", "null");
		// sqlb.addInCondition("Status_ERP_ID__c", ["22"]); // Facture générée

		// if (folder_id != "0") 			{ sqlb.addFilter("COM_ID__c", "=", folder_id); }
		// if (vehicle_types.length > 0) 	{ sqlb.addInCondition("OrderedVehiculeType_ERP_ID__c", vehicle_types) }
		// if (service_types.length > 0) 	{ sqlb.addInCondition("ServiceType_ERP_ID__c", service_types) }
		// if (clients.length > 0) 		{ sqlb.addInCondition("Client_Salesforce_Code__c", clients) }
		// if (partners.length > 0) 		{ sqlb.addInCondition("Partner_ERP_ID__c", partners) }
		// if (status.length > 0) 			{ sqlb.addInCondition("Status_ERP_ID__c", status) }

		// if (chauffeur_names.length > 0) {
		// 	sqlb.addInCondition("Chauffeur_ERP_ID__c", chauffeur_names);
		// }
		//
		// if (only_sent_to_supplier) 		{
		// 	// Sent to supplier could be either sent or ignored. Only empty is not sent.
		// 	console.log("Only sent to supplier")
		// 	sqlb.addFilter("Transmitted_To_Partner__c", "<>", "");
		//
		// 	// Dont show if the mission is already in a bill
		// 	sqlb.addFilter("Purchase_Invoice_Number__c", "=", "");
		// }
		//
		// if(only_done_prefacturation) {
		// 	sqlb.addFilter("Purchase_Invoice_Number__c", "<>", "");
		// }

		const countreq = sqlb.select_once(["COUNT(Id)"]).buildQuery("Job__c");
		const count = (await Salesforce.soql(countreq)).records[0].expr0;

		console.log({countreq, count})
		sqlb.limit(100)
		const query= sqlb.select(["Id", "Start_Date_Time__c", "End_Date_Time__c", "ServiceType_ERP_ID__c", "Purchase_Price__c", "Calculated_Incl_VAT_Price__c",
			"Purchase_Invoice_Number__c", "Pick_Up_Location__c", "Drop_Off_Location__c", "Partner_ERP_ID__c",
			"OrderedVehicleType_ERP_ID__c", "Status_ERP_ID__c", "COM_ID__c", "Client_Salesforce_Code__c", "Transmitted_To_Partner__c",
			"Chauffeur_ERP_ID__c", "Sage_Number__c"]).limit(limit).offset(offset).buildQuery("Job__c");
		const qresult = await Salesforce.soql(query);

		console.log({query, qresult})

		// Reset the query builder
		sqlb.offset(0);
		sqlb.limit(0);

		console.log({query})
		return { count, jobs: qresult.records as unknown as SFJobInformation[]};
	}

	public async getPartnerNames(ids: string[]) : Promise<{id:string, name:string}[]> {
		const query = `SELECT PAR_ID__c, Name FROM Partenaire__c WHERE PAR_ID__c IN ('${ids.join("','")}')`;
		console.log({query})
		const qresult = await Salesforce.soql(query);
		return qresult.records.map(e => ({id: e.PAR_ID__c, name: e.Name}));
	}

	public async getChauffeurNames(ids: string[]) : Promise<{id:string, name:string}[]> {
		const query = `SELECT CHU_ID__c, CHU_NOM__c, CHU_PRENOM__c FROM Chauffeur__c WHERE CHU_ID__c IN ('${ids.join("','")}')`;
		console.log({query})
		const qresult = await Salesforce.soql(query);
		return qresult.records.map(e => ({id: e.CHU_ID__c, name: e.CHU_PRENOM__c + " " + e.CHU_NOM__c}));
	}

	public async get_all_missions_for_contractor(contractorId: string, from: Date, to: Date) : Promise<SFJobInformation[]> {
		const query = `SELECT Id FROM Job__c WHERE Partner_ERP_ID__c = '${contractorId}' AND Start_Date_Time__c >= ${from.toISOString()} AND End_Date_Time__c <= ${to.toISOString()}`;
		const qresult = await Salesforce.soql(query);
		return qresult.records as unknown as SFJobInformation[];
	}

}

export const SalesforceChabe = new CSalesforceChabe();
