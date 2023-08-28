
# Missions

Une mission doit contenir les informations nécessaires au calcul de ses commissions :

Done | Title            | Libelle | Descr
-----|------------------|---------|---------
[ ]  | Num_Facture__c   | Numéro facture | Le numéro de facture auquel appartient la mission
[ ]  | Nom_Dossier__c   | Nom du dossier | Le nom du dossier waynium (optionnel)
[ ]  | Commission_Mission_done | La commission a été effectuée | La mission a déjà été commissionnée
[x]  | Voiture_TVA0__c  | Montant de prix Voiture à TVA 0 | La commission sur la voiture à TVA 0
[x]  | Service_TVA0__c  | Montant de prix Service à TVA 0 | La commission sur le service à TVA 0
[x]  | Frais_TVA0__c    | Montant de prix Frais à TVA 0 | La commission sur les frais à TVA 0
[x]  | Voiture_TVA10__c | Montant de prix Voiture à TVA 10% | La commission sur la voiture à TVA 10
[x]  | Service_TVA10__c | Montant de prix Service à TVA 10% | La commission sur le service à TVA 10
[x]  | Frais_TVA10__c   | Montant de prix Frais à TVA 10% | La commission sur les frais à TVA 10
[x]  | Voiture_TVA20__c | Montant de prix Voiture à TVA 20% | La commission sur la voiture à TVA 20
[x]  | Service_TVA20__c | Montant de prix Service à TVA 20% | La commission sur le service à TVA 20
[x]  | Frais_TVA20__c   | Montant de prix Frais à TVA 20% | La commission sur les frais à TVA 20


# Hotels

Un hotel doit pouvoir être configuré avec

Done | Title                            | Descr
-----|----------------------------------|---------
[ ]  | Commission_Hotel_Is_Parent__c           | Le compte est un hôtel "parent"
[ ]  | Commission_Hotel_Is_Commissionable__c   | Le compte est commissionné
[ ]  | Commission_Hotel_Validated_Until__c     | L'hôtel a validé la distribution jusque...
[ ]  | Commission_Hotel_Voiture_Percent__c     | Valeur en pourcentage de la com hotel sur le prix voiture
[ ]  | Commission_Hotel_Service_Percent__c     | idem
[ ]  | Commission_Hotel_Frais_Percent__c       | idem
[ ]  | Commission_Loge_Voiture_Percent__c  | idem
[ ]  | Commission_Loge_Service_Percent__c  | idem
[ ]  | Commission_Loge_Frais_Percent__c    | idem

# Concierge

Un concierge doit pouvoir être configuré avec

Done | Title                            | Descr
-----|----------------------------------|---------
[ ]  | Com_Concierge_Repartition__c     | Le pourcentage de la commission "loge" dédiée à ce concierge. La somme de ces champs pour un Hôtel doit arriver à 100%.
