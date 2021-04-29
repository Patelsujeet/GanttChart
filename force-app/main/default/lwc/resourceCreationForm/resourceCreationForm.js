import { api, LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import user_TimeZone from '@salesforce/i18n/timeZone';


import getTheResourceAvailability from '@salesforce/apex/ResourceCalendarController.getRepeatingResourcesAvailability';
import getPRNResourcesAvailability from '@salesforce/apex/ResourceCalendarController.getPRNResourcesAvailability';


export default class ResourceCreationForm extends LightningElement {
    @api
    contactid;

    @api
    assigneeType;


    @api
    defaultSelectedDate;
    get defaultDate() {
        let d = this.defaultSelectedDate;
        return d + 'T16:00:00.000Z';
    }

    connectedCallback() {

    }

    renderedCallback() {
        this.contactid.startsWith('003') ? this.setContactId(this.contactid) : '';
    }

    closeModal(event) {
        this.dispatchEvent(new CustomEvent("closemodel"));
    }

    async handleSubmit(event) {
        event.preventDefault(); // stop the form from submitting
        const fields = event.detail.fields;
        //fields.Street = '32 Prince Street';
        const isValid = this.validation();
        if (isValid) {
            // To Active the Spinner

            this.dispatchEvent(new CustomEvent("active_spinner"));
            await this.template.querySelector('lightning-record-edit-form').submit(fields);
            this.dispatchEvent(new CustomEvent("updateresource"));
        } else {
            this.showToastMessage();
        }

    }
    handleSucess(event) {
        const updatedRecord = event.detail.id;
        console.log('onsuccess: ', updatedRecord);
    }

    get defaultSchduleTypeValue() {
        if (this.contactid.startsWith('003')) {
            return '';
        } else {
            return this.contactid;
        }
    }

    selectRowHandler(event) {
        console.log(JSON.stringify(event.detail))
        const cont = event.detail.selectedRow;
        this.setContactId(cont.Id);
        //this.contactid = cont.Id;

    }

    selectPRNRowHandler(event) {
        const cont = event.detail.selectedRow;
        this.setContactId(cont.Contact__c);
        //this.contactid = cont.Contact__c;

    }

    validation() {
        /*const cmp = this.template.querySelector(".startDateCmp");
        const selectedDate = new Date(cmp.value.split('T')[0]); //.toLocaleString('en-US', { dateStyle: 'short' }, { timeZone: user_TimeZone });
        const todayDate = new Date(); //.toLocaleString('en-US', { dateStyle: 'short' }, { timeZone: user_TimeZone });
        return selectedDate > todayDate;*/
        const todayDate = moment().format('MM/DD/YYYY');
        const selectedDate1 = moment(this.selected_date).format('MM/DD/YYYY');
        const cmp = this.template.querySelector(".startDateCmp");
        const endcmp = this.template.querySelector(".endDateCmp");
        const selectedDate = new Date(cmp.value.split('T')[0]);
        console.log('cmp:'+cmp.value);
        console.log('endcmp:'+endcmp.value);
        return (moment(selectedDate).isAfter(moment()) || (selectedDate1 == todayDate)) && endcmp.value > cmp.value ;
    }

    showToastMessage() {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Date Error',
            message: 'Please select future dates and times for scheduling.',
            variant: 'error',
        }))
    }

    @track
    availableRepeatingResource;
    @track
    availablePRNResource

    dateChangeHandler(event) {
        const startDate = event.target.value;
        const dateOnly = startDate.split('T')[0];
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

    setContactId(id) {
        this.template.querySelector('[data-contid]').value = id;
    }
}