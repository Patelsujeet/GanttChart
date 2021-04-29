import { api, LightningElement, track } from 'lwc';

import getTheResourceAvailability from '@salesforce/apex/ResourceCalendarController.getRepeatingResourcesAvailability';
import getPRNResourcesAvailability from '@salesforce/apex/ResourceCalendarController.getPRNResourcesAvailability';
import user_TimeZone from '@salesforce/i18n/timeZone';


export default class ResourceUpdationForm extends LightningElement {
    @api
    recordId;

    @api
    defaultSelectedDate;

    @track
    contactId;

    @track
    startDate;
    @track
    endDate;

    @track
    dynamicLookup = false;
    @track
    onlyUpdate = true;

    async handleSubmit(event) {
        event.preventDefault(); // stop the form from submitting
        const fields = event.detail.fields;
        if (this.dynamicLookup) {
            fields.Contact__c = this.contactid;
        }
        // To Active the Spinner
        this.dispatchEvent(new CustomEvent("active_spinner"));

        await this.template.querySelector('lightning-record-edit-form').submit(fields);
        this.dispatchEvent(new CustomEvent("updateresource"));
    }
    handleSucess(event) {
        const updatedRecord = event.detail.id;
        console.log('onsuccess: ', updatedRecord);
    }

    closeModal(event) {
        this.dispatchEvent(new CustomEvent("closemodel"));
    }

    selectRowHandler(event) {
        console.log(JSON.stringify(event.detail.selectedRow))
        const cont = event.detail.selectedRow;
        this.contactid = cont.Id;
        this.changetheLookupContact(cont.Id, cont.Name);
    }

    selectPRNRowHandler(event) {
        console.log(JSON.stringify(event.detail.selectedRow))
        const cont = event.detail.selectedRow;

        this.startDate = cont.Available_Start__c;
        this.endDate = cont.Available_End__c;
        this.contactid = cont.Contact__c;
        this.changetheLookupContact(cont.Contact__c, cont.Contact__r.Name);
    }


    changetheLookupContact(contactId, name) {
        this.onlyUpdate = false;
        this.dynamicLookup = true;
        const interval = setInterval(() => {
            let temp = this.template.querySelector('c-custom-lookup');
            if (temp) {
                temp.defaultselection(contactId, name);
                clearInterval(interval);
            }
        }, 100);
    }

    handleAccountSelection(event) {
        this.contactid = event.detail;
        console.log("the selected record id is" + event.detail);
    }


    @track
    availableRepeatingResource;
    @track
    availablePRNResource;

    dateChangeHandler(event) {
        const startDate = event.target.value;
        const dateOnly = startDate.split('T')[0];
        console.log('date', new Date(dateOnly).toLocaleString({ timeZone: user_TimeZone }))
        this.getTheResourceData(dateOnly);

        console.log(event.target.value);
    }

    getTheResourceData(selecteddate) {
        getTheResourceAvailability({
                selectedDate: selecteddate
            })
            .then(result => {
                this.availableRepeatingResource = result;
                console.log(result);
            })
            .catch(e => {
                console.log(e)
            })

        getPRNResourcesAvailability({
                selectedDate: selecteddate
            }).then(result => {
                let temp = result.map(currentItem => {
                    let d = {
                        resourceName: currentItem.Contact__r.Name
                    }
                    return {...currentItem, ...d };
                });
                this.availablePRNResource = temp;
                console.log(result);
            })
            .catch(e => {
                console.log(e)
            })
    }
}