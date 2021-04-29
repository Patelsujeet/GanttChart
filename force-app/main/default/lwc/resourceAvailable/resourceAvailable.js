import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getTheResourceAvailability from '@salesforce/apex/ResourceCalendarController.getRepeatingResourcesAvailability';
import getPRNResourcesAvailability from '@salesforce/apex/ResourceCalendarController.getPRNResourcesAvailability';

import user_TimeZone from '@salesforce/i18n/timeZone';

const columnsRR = [
    { label: 'Name', fieldName: 'Name' }
];

export default class ResourceAvailable extends LightningElement {
    @api
    defaultDate;

    @api
    availableRepeatingResource;
    @api
    availablePRNResource;

    @track
    columnsRR = columnsRR;

    @track
    columnsPRN = [
        { label: 'Name', fieldName: 'resourceName' },
        {
            label: 'Available Start',
            fieldName: 'Available_Start__c',
            type: 'date',
            typeAttributes: {
                timeZone: user_TimeZone,
                year: "numeric",
                month: "long",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            }
        },
        {
            label: 'Available End',
            fieldName: 'Available_End__c',
            type: 'date',
            typeAttributes: {
                timeZone: user_TimeZone,
                year: "numeric",
                month: "long",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            }
        },
    ];


    @track
    user_time_zone = user_TimeZone;

    @wire(getTheResourceAvailability, { selectedDate: '$defaultDate' })
    getAvailableRepeatingResource({ data, error }) {
        if (data) {
            this.availableRepeatingResource = data;
            console.log(this.availableResource)
        } else if (error) {
            console.log(error);
        }
    }

    @wire(getPRNResourcesAvailability, { selectedDate: '$defaultDate' })
    getPRNAvailableResource({ data, error }) {
        if (data) {
            let temp = data.map(currentItem => {
                let d = {
                    resourceName: currentItem.Contact__r.Name
                }
                return {...currentItem, ...d };
            });
            this.availablePRNResource = temp;
            console.log(temp);
            console.log(data);
        } else if (error) {

        }
    }


    @track
    hideRRCheckbox = false;
    @track
    hidePRNCheckbox = false;

    handleRowActionRR(event) {
        let selectedRows = event.detail.selectedRows;
        if (selectedRows.length != 0) {
            this.hidePRNCheckbox = true;

            if (selectedRows.length > 1) {
                if ((this.availableRepeatingResource.length != selectedRows.length) || selectedRows.length == 2) {
                    var el = this.template.querySelectorAll('lightning-datatable')[0];

                    selectedRows = el.selectedRows = el.selectedRows.slice(1);


                    console.log(selectedRows);
                    //this.showNotification();
                    const findingArray = this.availableRepeatingResource;
                    const searchingRow = selectedRows[0];
                    const temp = findingArray.find((currentItem) => {
                        return currentItem.Id == searchingRow;
                    });
                    this.dispatchEvent(new CustomEvent("selectrow", {
                        detail: {
                            selectedRow: temp
                        }
                    }));

                    event.preventDefault();
                    return;
                }
            } else {
                const selectedRow = event.detail.selectedRows;
                this.dispatchEvent(new CustomEvent("selectrow", {
                    detail: {
                        selectedRow: selectedRow[0]
                    }
                }));
            }
        } else {
            this.hidePRNCheckbox = false;
            this.hideRRCheckbox = false;
        }
    }

    handleRowActionPRN(event) {
        let selectedRows = event.detail.selectedRows;
        if (selectedRows.length != 0) {
            this.hideRRCheckbox = true;

            if (selectedRows.length > 1) {
                if ((this.availablePRNResource.length != selectedRows.length) || selectedRows.length == 2) {
                    var elt = this.template.querySelectorAll('lightning-datatable')[1];

                    selectedRows = elt.selectedRows = elt.selectedRows.slice(1);

                    console.log(selectedRows);
                    //this.showNotification();
                    const findingArray = this.availablePRNResource;
                    const searchingRow = selectedRows[0];
                    const temp = findingArray.find((currentItem) => {
                        return currentItem.Id == searchingRow;
                    });
                    this.dispatchEvent(new CustomEvent("selectprnresource", {
                        detail: {
                            selectedRow: temp
                        }
                    }));

                    event.preventDefault();
                    return;
                }
            } else {
                const selectedRow = event.detail.selectedRows;
                console.log(selectedRow)
                this.dispatchEvent(new CustomEvent("selectprnresource", {
                    detail: {
                        selectedRow: selectedRow[0]
                    }
                }));
            }
        } else {

            this.hidePRNCheckbox = false;
            this.hideRRCheckbox = false;
        }
    }


    showNotification() {
        const event = new ShowToastEvent({
            title: 'Error',
            message: 'Only one row can be selected',
            variant: 'warning',
            mode: 'pester'
        });
        this.dispatchEvent(event);
    }

}