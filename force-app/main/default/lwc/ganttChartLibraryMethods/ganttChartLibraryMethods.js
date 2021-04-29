// get today date in YYYY-MM-DD format
export function todatFormatedDate() {
    let d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

export function getDateToShowInHeader() {
    let d = new Date();
    return d.toDateString();
}

export const dynamicColor = {
    '0': '#04e1cb',
    '1': '#1589ee',
    '2': '#ff9e2c',
    '3': '#feb8ab',
    '4': '#4bca81',
    '5': '#c9c7c5',
    '6': '#fff03f',
    '7': '#d4504c',
    '8': '#fdb6c5',
    '9': '#d892fe'
}

export function GFG_Fun(date) {

    // Getting minutes
    var mins = date.getMinutes();

    // Getting hours
    var hrs = date.getHours();
    var m = (Math.round(mins / 15) * 15) % 60;

    // Converting '09:0' to '09:00'
    m = m < 10 ? '0' + m : m;
    var h = mins > 52 ? (hrs === 23 ? 0 : ++hrs) : hrs;

    // Converting '9:00' to '09:00'
    h = h < 10 ? '0' + h : h;
    console.log(h + ":" + m);
    return h + ":" + m;
}