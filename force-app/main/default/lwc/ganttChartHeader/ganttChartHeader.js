import { LightningElement, wire, track } from 'lwc';
import { todatFormatedDate, getDateToShowInHeader } from 'c/ganttChartLibraryMethods';
// get the picklist values
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';


// call the apex method 
import filteredResource from '@salesforce/apex/ResourceCalendarController.filteredResource';
import getTheResourceBasedOnBot from "@salesforce/apex/ResourceCalendarController.getTheResourceBasedOnBot";

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { CurrentPageReference } from 'lightning/navigation';
// pub sub files
import { fireEvent } from 'c/pubsub';
import { registerListener, unregisterAllListeners } from 'c/pubsub';

export default class GanttChartHeader extends LightningElement {

    @wire(CurrentPageReference)
    pageRef;

    @wire(getObjectInfo, { objectApiName: 'Resource_Schedule__c' })
    resourceInfo;

    // get the picklist values of Location
    @track
    locationoptions;

    get location_option() {
        return this.locationoptions;
    }
    @wire(getPicklistValues, {
        recordTypeId: '$resourceInfo.data.defaultRecordTypeId',
        fieldApiName: 'Resource_Schedule__c.Location__c'
    })
    locationPickList({ data, error }) {
        if (data) {
            let listValue = [];
            listValue.push({
                label: 'All',
                value: 'All'
            });

            let fieldValue = data.values.map((currntItem) => {
                return {
                    label: currntItem.label,
                    value: currntItem.value
                }
            });
            this.locationoptions = listValue.concat(fieldValue);
        } else if (error) {
            console.log(error);
        }
    }


    // get the picklist values of Schedule Type
    @track
    scheduleoptions;
    get schedule_option() {
        return this.scheduleoptions;
    }
    @wire(getPicklistValues, {
        recordTypeId: '$resourceInfo.data.defaultRecordTypeId',
        fieldApiName: 'Resource_Schedule__c.Schedule_Type__c'
    })
    schedulePickList({ data, error }) {
        if (data) {
            this.scheduleoptions = data.values.map((currntItem) => {
                return {
                    label: currntItem.label,
                    value: currntItem.value
                }
            });
            this.scheduleoptions.push({
                label: 'All',
                value: 'All'
            })
        } else if (error) {
            console.log(error);
        }
    }

    @track
    todayDate;

    @track
    botButtonVisible = true;
    @track
    instructorButtonVisible = false;

    connectedCallback() {

        this.todayDate = getDateToShowInHeader(); //moment().format("dddd, MMMM Do YYYY");
        this.selected_Date = todatFormatedDate(); //moment().format('YYYY-MM-DD');
        this.getTheDataBasedonButtonVisibility();
        console.log('this is ', todatFormatedDate())

        registerListener("passthecurrentdate", this.currentDateHandler, this);
    }

    currentDateHandler(data) {
        this.selected_Date = data.currentdate;
    }

    getTheDataBasedonButtonVisibility() {
        if (this.botButtonVisible) {
            this.getTheFilteredDate(this.selected_Date, this.selected_location, this.selected_schedule_Type, 'instructor');
        } else if (this.instructorButtonVisible) {
            this.getTheFilteredDate(this.selected_Date, this.selected_location, this.selected_schedule_Type, 'boats');
        }
    }

    get today_SelectedDate() {
        return this.selected_Date;
    }
    renderedCallback() {}

    @track
    selected_Date;
    changeDateHandler(event) {
        console.log('selected', event.target.value);

        const selectd = event.target.value;
        if (selectd) {
            this.selected_Date = event.target.value;
            //this.getTheFilteredDate(this.selected_Date, this.selected_location, this.selected_schedule_Type);
            this.getTheDataBasedonButtonVisibility();

        } else {
            this.showNotification('Select Date', 'Date Should not be blank', 'error');
        }
    }



    @track
    botButtonVisible = true;
    @track
    instructorButtonVisible = false;

    botHandler(event) {
        this.instructorButtonVisible = !this.instructorButtonVisible;
        this.botButtonVisible = !this.botButtonVisible;
        const bot_selected = event.target.value;
        this.getTheDataBasedonButtonVisibility();

    }
    instructorHandler(event) {
        this.botButtonVisible = !this.botButtonVisible;
        this.instructorButtonVisible = !this.instructorButtonVisible;
        const instructor_Selected = event.target.value;

        const disable_ScheduleType = this.template.querySelector("[data-schedule='schedule']");
        disable_ScheduleType.disabled = false;
        //this.getTheFilteredDate(this.selected_Date, this.selected_location, this.selected_schedule_Type);
        this.getTheDataBasedonButtonVisibility();
    }

    locationhandleChange(event) {
        const location = event.target.value;
        this.selected_location = location
        this.getTheDataBasedonButtonVisibility();

    }

    scheduleTypehandleChange(event) {
        const schedule = event.target.value;
        this.selected_schedule_Type = schedule;
        //this.getTheFilteredDate(this.selected_Date, this.selected_location, this.selected_schedule_Type);
        this.getTheDataBasedonButtonVisibility();
    }


    @track
    gant_data;
    @track
    selected_location = "All";
    @track
    selected_schedule_Type = 'All';

    async getTheFilteredDate(selectedDate, selectedLocation, selectedScheduleType, assigneeType) {
            console.log(selectedDate, selectedLocation, selectedScheduleType);

            // Active the spinner
            fireEvent(this.pageRef, "spinner_true", true);

            await filteredResource({
                    'selectedDate': selectedDate == null ? undefined : selectedDate,
                    'location': selectedLocation,
                    'schedule_Type': selectedScheduleType,
                    'assigneeType': assigneeType
                }).then(result => {
                    console.log(result);
                    this.gant_data = result;
                    this.passTheChartData()
                })
                .catch(e => {

                });
        }
        /*
            getTheFilteredDataOnBoats(selectedDate, selectedLocation, selectedScheduleType) {

                getTheResourceBasedOnBot({
                    'selectedDate': selectedDate == null ? undefined : selectedDate,
                    'location': selectedLocation,
                    'schedule_Type': 'All Boats'
                }).then(result => {
                    this.gant_data = result;
                    this.passTheChartData()
                }).catch(er => {
                    console.log(er);
                })
            }
        */

    showNotification(_title, message, variant) {
        const evt = new ShowToastEvent({
            title: _title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }


    passTheChartData() {
        fireEvent(this.pageRef, "pass_gantt_data", this.gant_data);
        fireEvent(this.pageRef, "pass_header_cmp_detail", {
            'selected_Date': this.selected_Date,
            'selected_location': this.selected_location,
            'selected_schedule': this.selected_schedule_Type,
            'boatButtonVisible': this.botButtonVisible,
            'instructorButtonVisible': this.instructorButtonVisible
        });
    }


    newEventHandler(event) {
        const passdata = {
            enable: true,
            modelheader: 'Create'
        }
        fireEvent(this.pageRef, "enable_resource_creation", passdata);
    }


}