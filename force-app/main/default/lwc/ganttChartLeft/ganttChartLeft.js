import { LightningElement, wire } from 'lwc';
import getContactList from "@salesforce/apex/ContactDetail.getContactList";

export default class GanttChartLeft extends LightningElement {

    @wire(getContactList)
    contactList;
    

}