import { LightningElement ,wire,track } from 'lwc';
import { getColumns } from 'c/ganttChartLibraryMethods';

import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/pubsub';

export default class GanttChartHeader extends LightningElement {

    @wire(CurrentPageReference) 
    pageRef;

    
    @track
    todayDate;
    connectedCallback(){
       
        
    }

    dayFilterhandler(event){
        const buttonLabel= event.target.label;
        let result= moment("2020-02", "YYYY-MM").daysInMonth();
      
        console.log("No of days in 2020-02 is:", result)  
      //  console.log(getColumns(buttonLabel,"2020-02"));
        
        fireEvent(this.pageRef,"passtheganttchartdetail",{
            'columns_header':buttonLabel
        })
    }
    renderedCallback(){
        const c=setInterval(()=>{
            if(moment()){
                this.todayDate=moment().format("dddd, MMMM Do YYYY");
                clearInterval(c);
            }
        },100);
       // console.log(moment().format("dddd, MMMM Do YYYY"));
    }
}