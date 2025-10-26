import {setupUiEvtHdlrs} from "./ui.mjs";
import {drawGeodataForDay, seshGeodataCache, seshTimestampCache} from "./core.mjs";

let sessionDate;
let sessionTime;

let routeByUrl = ()=>{
    const params = new URLSearchParams(document.location.search);
    sessionDate = params.get('date').replaceAll('-', ' ');
    sessionTime = params.get('time');
    drawGeodataForDay(sessionDate, seshGeodataCache, seshTimestampCache);
}
setupUiEvtHdlrs();
routeByUrl();