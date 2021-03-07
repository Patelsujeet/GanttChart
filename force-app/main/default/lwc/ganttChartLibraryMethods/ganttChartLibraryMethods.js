export function getColumns(types,monthWithYear){
    let numberofcolumns;
    switch(eval(types)){
        case 1: // 1 for days return hour
            numberofcolumns =  24;
            break;
        case 2: // 2 for week return days
            numberofcolumns = 7;
            break;
        
        case 3: // 3 for moths return days and data should be in '2020-02' // feb and 2020
            numberofcolumns =  12//moment(monthWithYear, "YYYY-MM").daysInMonth();
            break;
    }
    return numberofcolumns;
}