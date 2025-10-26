import {makeMap} from "./wave_map.mjs";

const toggleMapCollapse = () => {
    document.getElementById("wave-map").classList.toggle("collapsed");
    document.getElementById("wave-video").classList.toggle("fullheight");
}

const toggleVideoCollapse = () => {
    document.getElementById("wave-video").classList.toggle("collapsed");
    document.getElementById("wave-map").classList.toggle("fullheight");
}

const toggleListCollapse = () => {
    document.getElementById("wave-list").classList.toggle("collapsed");
}

export function setupUiEvtHdlrs() {
    document.getElementById("wave-map-togglebutton").onclick = toggleMapCollapse;
    document.getElementById("wave-video-togglebutton").onclick = toggleVideoCollapse;
    document.getElementById("wave-list-togglebutton").onclick = toggleListCollapse;
    window.onYouTubeIframeAPIReady = ()=>{
        console.debug('setting up youtube iframe player')
        window.player = new YT.Player("wave-video", {
            playerVars: {
                playsinline: 1,
            },
        });
        window.waveMap = makeMap();
    }
}