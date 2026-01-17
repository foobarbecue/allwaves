import { GoldenLayout } from 'https://cdn.jsdelivr.net/npm/golden-layout@2.6.0/+esm';
import "./main.mjs";
import { timechangeEvtHdlr } from "./ui.mjs";

const layoutConfig = {
    settings: {
            showPopoutIcon: false
    },
    root: {
        type: 'row',
        content: [
            {
                type: 'component',
                title: 'Wave list',
                componentType: 'waveList',
                width: 20
            },
            {
                type: 'column',
                content: [
                    {
                        type: 'component',
                        title: 'Video Player',
                        componentType: 'waveVideo'
                    },
                    {
                        type: 'component',
                        title: 'Map',
                        componentType: 'waveMap'
                    },
                    {
                        type: 'component',
                        title: 'Plots',
                        componentType: 'wavePlot'
                    }
                ]
            }
        ]
    }
}

function handleBindComponent(container, itemConfig) {
    const componentType = itemConfig.componentType;
    const state = itemConfig.componentState || {};
    const componentHandlerMap = {
        "waveList": createWaveList,
        "waveMap": createWaveMap,
        "wavePlot": createWavePlot,
        "waveVideo": createWaveVideo
    }
    componentHandlerMap[componentType](container, state)
    return { component: undefined, virtual: false };
}

const createWaveList = (container, state) => {
    const waveListDiv = document.createElement('div');
    waveListDiv.id='wave-list';
    const ul = document.createElement('ul');
    waveListDiv.appendChild(ul);
    container.element.appendChild(waveListDiv);
    container.element.setAttribute('style','overflow: scroll')
}

const createWaveVideo = (container, state) => {
    const waveVideoTitlebarDiv = document.createElement('div');
    waveVideoTitlebarDiv.id="wave-video-titlebar"
    waveVideoTitlebarDiv.innerHTML = `
                        <div id="wave-video-title">
                        Playing video: no data
                    </div>
    `
    const waveVideoDiv = document.createElement('div');
    waveVideoDiv.id='wave-video';
    container.element.appendChild(waveVideoTitlebarDiv)
    container.element.appendChild(waveVideoDiv);
}

const createWaveMap = (container, state) => {
    const waveMapTitlebarDiv = document.createElement('div');
    waveMapTitlebarDiv.id="wave-map-titlebar"
    waveMapTitlebarDiv.innerHTML = `
                    <div id="wave-map-title">
                        Mapping: no data
                    </div>
                    <div>
                    <span>Time adjustment: <input id="time-adj" type="range" min="-100" max="100"/></span>
                        Video will be delayed <span id="time-adj-disp">0</span> seconds relative to map and plots.
                    </div>
    `
    const waveMapDiv = document.createElement('div');
    waveMapDiv.id='wave-map';
    container.element.appendChild(waveMapTitlebarDiv);
    container.element.appendChild(waveMapDiv);
    container.element.querySelector('#time-adj').oninput = (ev) => {
        container.element.querySelector('#time-adj-disp').innerText = ev.target.value;
        timechangeEvtHdlr(window.player.getCurrentTime());
    };
}

const createWavePlot = (container, state) => {
    const wavePlotTitlebarDiv = document.createElement('div')
    wavePlotTitlebarDiv.id = "wave-plot-titlebar"
    wavePlotTitlebarDiv.innerHTML = `
                        <div id="wave-plot-title">
                        Plotting: no data
                    </div>`
    const wavePlotDiv = document.createElement('div');
    wavePlotDiv.id='wave-plot';
    container.element.appendChild(wavePlotTitlebarDiv);
    container.element.appendChild(wavePlotDiv);
}

const container = document.getElementById('app-container');
const layout = new GoldenLayout(container, handleBindComponent, () => {});

// Check if this is a popout window
const isSubWindow = new URLSearchParams(window.location.search).has('gl-window');

// Only load config in main window - popouts get config from localStorage automatically
if (!isSubWindow && !layout.isSubWindow) {
    layout.loadLayout(layoutConfig);
}

layout.resizeWithContainerAutomatically = true;