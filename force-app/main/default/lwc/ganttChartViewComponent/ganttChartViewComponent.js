import { LightningElement } from 'lwc';

import momentJS from "@salesforce/resourceUrl/MomentJs";
import { loadScript } from "lightning/platformResourceLoader";

export default class GanttChartViewComponent extends LightningElement {

    async connectedCallback() {
        console.log('momen is loading');
        await Promise.all([
            loadScript(this, momentJS)
        ]).then(() => {

        }).catch(e => {
            console.log(e)
        });
    }
}