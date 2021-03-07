import { LightningElement,track,wire } from 'lwc';
import { loadScript } from "lightning/platformResourceLoader";

import momentJS  from "@salesforce/resourceUrl/MomentJs";

import { fireEvent } from "c/pubsub";
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub';



export default class GanttChart extends LightningElement {

    @wire(CurrentPageReference) 
    pageRef;

    @track
    ganttChartColumnsHeader;


    async connectedCallback(){
        Promise.all([
            await loadScript(this, momentJS)
          ]).then(() => {
           
          });

        registerListener("passtheganttchartdetail", this.setGanttChart, this);
       
    }
    setGanttChart(data){
        
        let header=data.columns_header
        switch(header){
            case "Week":
                console.log('weeks');
                break;
            
            case "Month":
                this.setHeader("Month");
                break;

        }
        //this.ganttChartColumns=data.columns_number;

        /*
        let col=[];
        for(let i=0; i <=data.columns_header_number ; i++ ){
           col.push("1");
        }*/
       // this.ganttChartColumnsHeader=col


   
    }

    setHeader(value){
        if(value == "Month"){
           
            this.ganttChartColumnsHeader=moment.monthsShort();
            this.createChart(value);  
        }
      
    }

    createChart(e) {
        console.log('demo')
        const days = this.template.querySelectorAll(".chart-values li");
        const tasks = this.template.querySelectorAll(".chart-bars li");
        const daysArray = [...days];
      
        tasks.forEach(el => {
          const duration = el.dataset.duration.split("-");
          const startDay = duration[0];
          const endDay = duration[1];
          let left = 0,
            width = 0;
      
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
      
          // apply css
          el.style.left = `${left}px`;
          el.style.width = `${width}px`;
       
          if (e == "Month") {
            el.style.backgroundColor = el.dataset.color;
            el.style.opacity = 1;
          }
        });
      }
}