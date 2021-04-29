import { LightningElement, track, wire } from 'lwc';

import { fireEvent } from "c/pubsub";
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub';

//call apex method
import filteredResource from '@salesforce/apex/ResourceCalendarController.filteredResource';

// call the library method 
import { todatFormatedDate, dynamicColor, GFG_Fun } from 'c/ganttChartLibraryMethods';
import user_TimeZone from '@salesforce/i18n/timeZone';


export default class GanttChart extends LightningElement {

    @wire(CurrentPageReference)
    pageRef;

    @track
    ganttChartColumnsHeader;

    @track
    gantChartData;

    @track
    loadingSpinner = true;

    @track
    loadingHelpText;


    connectedCallback() {

        this.ganttChartColumnsHeader = this.createChartHeader('Instructor');
        registerListener('spinner_true', this.spinerActive, this);
        registerListener("pass_gantt_data", this.dataHandler, this);
        registerListener("pass_header_cmp_detail", this.headerHandler, this);

        registerListener("enable_resource_creation", this.createResourceOpenOnNewEvent, this);

    }

    createResourceOpenOnNewEvent(data) {
        const d = data;
        this.modelHeader = d.modelheader; //'Create';
        this.isModalOpen = d.enable;
        this.recordCreation = d.enable;
        this.contactId = '';
    }

    /*
        loadingHelpTextMethod(event) {
            //his.loadingHelpText = true;
            console.log('karan 1:' + event.currentTarget.dataset.start);
            console.log('karan 2:' + event.currentTarget.dataset.end);
            this.loadingHelpText = 'Meeting time: ' + event.currentTarget.dataset.start + '-' + event.currentTarget.dataset.end;
        }*/
    createChartHeader(asigneeType) {
        /*let header = [];
        header.push(asigneeType);
        for (let hours = 0; hours < 24; hours++) {

            header.push(hours < 10 ? '0' + hours + ':00' : hours + ':00');
            header.push(hours < 10 ? '0' + hours + ':15' : hours + ':15');
            header.push(hours < 10 ? '0' + hours + ':30' : hours + ':30');
            header.push(hours < 10 ? '0' + hours + ':45' : hours + ':45');
        }*/
        //================= 12 hours Time===============
        let header;
        let x = 15; //minutes interval
        let times = []; // time array
        let tt = 0; // start time
        let ap = ['am', 'pm']; // AM-PM

        //loop to increment the time and push results in array
        for (let i = 0; tt < 24 * 60; i++) {
            let hh = Math.floor(tt / 60); // getting hours of day in 0-24 format
            let mm = (tt % 60); // getting minutes of the hour in 0-55 format
            times[i] = ("0" + (hh % 12)).slice(-2) + ':' + ("0" + mm).slice(-2) + " " + ap[Math.floor(hh / 12)]; // pushing data in array in [00:00 - 12:00 AM/PM format]
            tt = tt + x;
        }

        let asignee = asigneeType;
        times[0] = '12:00 am';
        times[1] = '12:15 am';
        times[2] = '12:30 am';
        times[3] = '12:45 am';

        header = [asignee, ...times];
        header[header.indexOf("00:00 pm")] = '12:00 pm';
        header[header.indexOf("00:15 pm")] = '12:15 pm';
        header[header.indexOf("00:30 pm")] = '12:30 pm';
        header[header.indexOf("00:45 pm")] = '12:45 pm';

        return header;
    }
    createChart() {
        const days = this.template.querySelectorAll(".chart-values li");
        const tasks = this.template.querySelectorAll(".chart-bars li");
        const daysArray = [...days];

        tasks.forEach(el => {
            /*
            console.log('startDay', moment(GFG_Fun(new Date("October 13, 2014 " + el.dataset.start)), 'hh:mm a').format('hh:mm a'));
            console.log('endDay', moment(GFG_Fun(new Date("October 13, 2014 " + el.dataset.end)), 'hh:mm a').format('hh:mm a'));
            */
            if (!el.dataset.start || !el.dataset.end) {
                return;
            }

            const startDay = moment(GFG_Fun(new Date("October 13, 2014 " + el.dataset.start)), 'hh:mm a').format('hh:mm a'); //el.dataset.start; //duration[0];
            const endDay = moment(GFG_Fun(new Date("October 13, 2014 " + el.dataset.end)), 'hh:mm a').format('hh:mm a'); //el.dataset.end; //duration[1];
            let left = 0,
                width = 0;

            left = daysArray.filter(day => day.textContent == startDay.toLowerCase())[0].offsetLeft;
            width = daysArray.filter(day => day.textContent == endDay.toLowerCase())[0].offsetLeft + daysArray.filter(day => day.textContent == endDay.toLowerCase())[0].offsetWidth - left;

            if (width < 0) {
                width = daysArray.filter(day => day.textContent == "11:45 PM".toLowerCase())[0].offsetLeft + daysArray.filter(day => day.textContent == "11:45 PM".toLowerCase())[0].offsetWidth - left;
                el.style.borderRadius = '0px';
            } else {
                el.style.borderRadius = '25px';
            }
            /*
                        if (startDay.endsWith("½")) {
                            const filteredArray = daysArray.filter(day => day.textContent == startDay.slice(0, -1));
                            left = filteredArray[0].offsetLeft + filteredArray[0].offsetWidth / 2;
                        } else {
                            const filteredArray = daysArray.filter(day => day.textContent == startDay);
                            left = filteredArray[0].offsetLeft;
                        }

                        if (endDay.endsWith("½")) {
                            const filteredArray = daysArray.filter(day => day.textContent == endDay.slice(0, -1));
                            width = filteredArray[0].offsetLeft + filteredArray[0].offsetWidth / 2 - left;
                        } else {
                            const filteredArray = daysArray.filter(day => day.textContent == endDay);
                            width = filteredArray[0].offsetLeft + filteredArray[0].offsetWidth - left;
                        }
            */
            // apply css


            el.style.left = `${left}px`;
            el.style.width = `${width}px`;


            el.style.backgroundColor = dynamicColor[Math.floor(Math.random() * 10)]; //el.dataset.color;
            el.style.opacity = 1;
            el.style.cursor = 'pointer';
        });

        //Inactive the spinner
        this.spinerInActive();
    }

    //active the spinner when data is comeing 
    spinerActive(data) {
        this.loadingSpinner = true;
    }
    spinerInActive() {
        this.loadingSpinner = false;
    }

    dataHandler(data) {
        console.log('data', data);
        this.gantChartData = data;
        //this.spinerInActive();
        setTimeout(() => {
            this.createChart();
        }, 1000)

    }

    setHeader() {}

    @track
    currentPlace = '00:00 am';
    @track
    counter = 0;

    leftHandler(event) {
        //move scrollbar left on same date
        /*if (this.currentPlace == '12:00 am') {
            const scroll = "[data-min='" + this.assignee_type + "']";
            const scroll_point = this.template.querySelector(scroll);
            scroll_point.scrollIntoView(false);

        } else if (this.counter >= 0) {
            const scroll_point = this.subtractMinutes(285);
            const scroll = "[data-min='" + scroll_point + "']";
            const scrollplace = this.template.querySelector(scroll);
            scrollplace.scrollIntoView(false);
            this.currentPlace = scroll_point;

            this.counter--;
        }*/

        // move to previous date logic
        this.selected_date = this.subtractDates(1);
        this.passCurrentDatetoHeader(this.selected_date);

        this.spinerActive();
        this.resourceUpdatehandler(null);
    }

    rightHandler(event) {
        //move scrollbar right on same date
        /*if (this.counter < 5) {
            const scroll_point = this.addMinutes(285);
            const scroll = "[data-min='" + scroll_point + "']";
            const scrollplace = this.template.querySelector(scroll);
            scrollplace.scrollIntoView(false);
            this.currentPlace = scroll_point;
            this.counter++;
        }*/

        // move to next date logic
        this.selected_date = this.addDates(1);
        this.passCurrentDatetoHeader(this.selected_date);

        this.spinerActive();
        this.resourceUpdatehandler(null);

    }

    passCurrentDatetoHeader(dt) {
        fireEvent(this.pageRef, "passthecurrentdate", {
            currentdate: dt
        })
    }

    addMinutes(mintes) {
        const addMinute = moment(this.currentPlace, 'hh:mm a').add('minutes', mintes).format('hh:mm a');
        return addMinute;
    }

    subtractMinutes(mintes) {
        const subtract = moment(this.currentPlace, 'hh:mm a').subtract('minutes', mintes).format('hh:mm a');
        return subtract;
    }


    addDates(numberOfDay) {
        const newDate = moment(this.selected_date, "YYYY-MM-DD").add('days', numberOfDay).format("YYYY-MM-DD");
        return newDate;
    }

    subtractDates(numberOfDay) {
        const newDate = moment(this.selected_date, "YYYY-MM-DD").subtract('days', numberOfDay).format("YYYY-MM-DD");
        return newDate;
    }

    @track
    resource_id;

    @track
    recordUpdation = false;
    @track
    recordCreation = false;
    @track
    modelHeader;

    resourceModifcationHandler(event) {
        console.log('this is click on list');
        const resId = event.currentTarget.dataset.id;
        this.modelHeader = 'Update';
        this.isModalOpen = true;
        this.recordUpdation = true;
        this.resource_id = resId;
        console.log(resId)
    }

    @track
    contactId;

    @track
    assignee_type;
    createAssigneeHandler(event) {

        const isValid = this.validation();
        if (isValid) {
            const contact_id = event.currentTarget.dataset.contid;
            this.contactId = contact_id;

            this.modelHeader = 'Create';
            this.isModalOpen = true;
            this.recordCreation = true;
        }
    }


    // model pop
    @track isModalOpen = false;
    openModal() {
        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = true;
    }
    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen = false;
        this.recordCreation = false;
        this.recordUpdation = false;
    }

    @track
    selected_date;
    @track
    selected_location;
    @track
    selected_schedule;

    @track
    boatButton;
    @track
    instructorButton;

    headerHandler(data) {
        console.log(data);
        this.selected_date = data.selected_Date;
        this.selected_location = data.selected_location;
        this.selected_schedule = data.selected_schedule;
        this.boatButton = data.boatButtonVisible;
        this.instructorButton = data.instructorButtonVisible;
        this.asigneeTypeHandler();

    }

    async resourceUpdatehandler(event) {

        if (!this.boatButton) {
            // this.getTheFilteredDate(this.selected_Date, this.selected_location, );
            await filteredResource({
                    'selectedDate': this.selected_date == null ? undefined : this.selected_date,
                    'location': this.selected_location,
                    'schedule_Type': this.selected_schedule,
                    'assigneeType': 'boats'
                }).then(result => {
                    console.log('karan boat: ' + result);
                    console.log(result);
                    //this.gantChartData = result;
                    this.dataHandler(result);
                    //this.spinerInActive();
                })
                .catch(e => {

                });
        } else if (!this.instructorButton) {
            //this.getTheFilteredDate(this.selected_Date, this.selected_location, this.selected_schedule_Type);
            await filteredResource({
                    'selectedDate': this.selected_date == null ? undefined : this.selected_date,
                    'location': this.selected_location,
                    'schedule_Type': this.selected_schedule,
                    'assigneeType': 'instructor'
                }).then(result => {
                    console.log('karan: ' + result);
                    //this.gantChartData = result;
                    this.dataHandler(result);
                    // this.spinerInActive();
                })
                .catch(e => {

                });
        }


        this.closeModal();
    }

    asigneeTypeHandler() {
        if (!this.boatButton) {
            this.ganttChartColumnsHeader = this.createChartHeader('Boats');
            this.assignee_type = 'Boats';
        } else if (!this.instructorButton) {
            this.ganttChartColumnsHeader = this.createChartHeader('Instructor');
            this.assignee_type = 'Instructor';
        }
    }

    validation() {
        //const selectedDate = new Date(this.selected_date); //.toLocaleString('en-US', { dateStyle: 'short' }, { timeZone: user_TimeZone });
        //const todayDate = new Date(); //.toLocaleString('en-US', { dateStyle: 'short' }, { timeZone: user_TimeZone });
        const todayDate = moment().format('MM/DD/YYYY');
        const selectedDate = moment(this.selected_date).format('MM/DD/YYYY');

        console.log('todayDate:' + todayDate);
        console.log('selectedDate:' + selectedDate);

        return moment(this.selected_date).isAfter(moment()) || (selectedDate == todayDate);
    }


}