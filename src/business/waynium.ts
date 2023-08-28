

/*
Id	Type de véhicule
9	P BERLINE FRANÇAISE
1	E CLASSE E
71	EQE EQE
6	S CLASSE S
29	VI VITO
5	V CLASSE V
68	EQV EQV
26	RR RANGE ROVER
3	MA MAYBACH 560
11	MA6 MAYBACH 650
24	BE BENTLEY BENTAYGA
31	CU CULLINAN
67	GLS M GLS MAYBACH
37	RP PHANTOM
17	TS TESLA S
35	BM BMW S7
70	I7 I7 BMW
65	MI MINIBUS 9/15 PAX
10	SP SPRINTER
66	AUT AUTOCAR  16/30 PAX
25	BU BUS
30	CB CAMION BAGAGE
16	MO MOTO
32	SU SUV
34	VA VAN
33	SE SEDAN
27	TP TPMR
20	BGM BERLINE G. MOYENNE
19	BGH BERLINE G. HAUTE
18	BB BERLINE BLINDEE
28	VGB MINI VAN G. BASSE
23	VGM MINI VAN G. MOYENNE
22	VGH MINI VAN G. HAUTE
40	AU AUTRES
42	VC VEHICULE CHAFF
21	SV SANS VEHICULE
 */

const _WAYNIUM_vehiculetype_id_to_string = {
    "9": "P BERLINE FRANÇAISE",
    "1": "E CLASSE E",
    "71": "EQE EQE",
    "6": "S CLASSE S",
    "29": "VI VITO",
    "5": "V CLASSE V",
    "68": "EQV EQV",
    "26": "RR RANGE ROVER",
    "3": "MA MAYBACH 560",
    "11": "MA6 MAYBACH 650",
    "24": "BE BENTLEY BENTAYGA",
    "31": "CU CULLINAN",
    "67": "GLS M GLS MAYBACH",
    "37": "RP PHANTOM",
    "17": "TS TESLA S",
    "35": "BM BMW S7",
    "70": "I7 I7 BMW",
    "65": "MI MINIBUS 9/15 PAX",
    "10": "SP SPRINTER",
    "66": "AUT AUTOCAR  16/30 PAX",
    "25": "BU BUS",
    "30": "CB CAMION BAGAGE",
    "16": "MO MOTO",
    "32": "SU SUV",
    "34": "VA VAN",
    "33": "SE SEDAN",
    "27": "TP TPMR",
    "20": "BGM BERLINE G. MOYENNE",
    "19": "BGH BERLINE G. HAUTE",
    "18": "BB BERLINE BLINDEE",
    "28": "VGB MINI VAN G. BASSE",
    "23": "VGM MINI VAN G. MOYENNE",
    "22": "VGH MINI VAN G. HAUTE",
    "40": "AU AUTRES",
    "42": "VC VEHICULE CHAFF",
    "21": "SV SANS VEHICULE",
}
export const WAYNIUM_vehiculetype_id_to_string = (id: string): string => {
    if (id in _WAYNIUM_vehiculetype_id_to_string) {
        // @ts-ignore
        return _WAYNIUM_vehiculetype_id_to_string[id];
    }

    return "UNKNOWN";
}

// TYPES DE SERVICE
/*
Id	Type de service
1	Transfert Aéroport
16	Transfert Aéroport Avec Accueil
7	Transfert Ville Paris
9	Transfert Gare
17	Transfert Gare Bout De Quai
5	Transfert Gare Avec 1 Accueil
18	Transfert Gare Avec 2 Accueils
19	Transfert Grand Paris
3	Transferts Successifs
4	Transport Hors Paris
22	Mise à disposition
11	Province Transfert
55	Province Mise à disposition
20	Étranger Transfert
56	Étranger Mise à disposition
12	Accueil
51	Accueil NF
44	Transport 3h
45	Transport 4h
46	Transport 6h
47	Transport 8h
48	Transport 10h
49	Transport 12h
50	Transport 14h
13	Courtoisie/Permanence
52	Guide
21	Autres
53	Frais Chauffeurs
54	Transferts Successifs Événements
 */

const _WAYNIUM_servicetype_id_to_string = {
    "1": "Transfert Aéroport",
    "16": "Transfert Aéroport Avec Accueil",
    "7": "Transfert Ville Paris",
    "9": "Transfert Gare",
    "17": "Transfert Gare Bout De Quai",
    "5": "Transfert Gare Avec 1 Accueil",
    "18": "Transfert Gare Avec 2 Accueils",
    "19": "Transfert Grand Paris",
    "3": "Transferts Successifs",
    "4": "Transport Hors Paris",
    "22": "Mise à disposition",
    "11": "Province Transfert",
    "55": "Province Mise à disposition",
    "20": "Étranger Transfert",
    "56": "Étranger Mise à disposition",
    "12": "Accueil",
    "51": "Accueil NF",
    "44": "Transport 3h",
    "45": "Transport 4h",
    "46": "Transport 6h",
    "47": "Transport 8h",
    "48": "Transport 10h",
    "49": "Transport 12h",
    "50": "Transport 14h",
    "13": "Courtoisie/Permanence",
    "52": "Guide",
    "21": "Autres",
    "53": "Frais Chauffeurs",
    "54": "Transferts Successifs Événements",
}

export const WAYNIUM_servicetype_id_to_string = (id: string): string => {
    if (id in _WAYNIUM_servicetype_id_to_string) {
        // @ts-ignore
        return _WAYNIUM_servicetype_id_to_string[id];
    }

    return "UNKNOWN";
}
