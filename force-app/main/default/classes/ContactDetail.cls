public class ContactDetail {
	
    @AuraEnabled(cacheable=true)
    public Static List<Contact> getContactList(){
        return [select id,Picutre__c ,FirstName,LastName,ImageId__c,Name,Title from Contact where ImageID__c!=''];
    }
}