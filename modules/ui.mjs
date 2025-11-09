const toggleMapCollapse = () => {
    document.getElementById("wave-map").classList.toggle("collapsed");
}

const toggleVideoCollapse = () => {
    document.getElementById("wave-video").classList.toggle("collapsed");
}

const toggleListCollapse = () => {
    document.getElementById("wave-list").classList.toggle("collapsed");
}

const togglePlotCollapse = () => {
    document.getElementById("wave-plot").classList.toggle("collapsed");
}

export function setupUiEvtHdlrs() {
    document.getElementById("wave-map-togglebutton").onclick = toggleMapCollapse;
    document.getElementById("wave-video-togglebutton").onclick = toggleVideoCollapse;
    document.getElementById("wave-list-togglebutton").onclick = toggleListCollapse;
    document.getElementById("wave-plot-togglebutton").onclick = togglePlotCollapse;
    document.getElementById("time-adj").oninput = (ev)=>{
        document.getElementById("time-adj-disp").innerText = ev.target.value;
    }

}