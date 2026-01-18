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

// Add collapse buttons
const collapseState = new Map();
const COLLAPSED_SIZE = 5; // percentage
layout.on('stackCreated', (event) => {
    const stack = event.target;

    const stackElement = stack.element;
    if (!stackElement) return;

    const controlsContainer = stackElement.querySelector('.lm_header .lm_controls');
    if (!controlsContainer || controlsContainer.querySelector('.lm_collapse_button')) return;

    const btn = document.createElement('div');
    btn.className = 'lm_collapse_button';
    btn.innerHTML = '−';

    const stackId = stack.id || Math.random().toString(36).substr(2, 9);
    collapseState.set(stackId, {
        isCollapsed: false,
        originalSize: stack.size
    });

    btn.addEventListener('click', (e) => {
        e.stopPropagation();

        const state = collapseState.get(stackId);

        if (!state.isCollapsed) {
            // Collapse
            state.originalSize = stack.size;
            stack.size = COLLAPSED_SIZE;
            btn.innerHTML = '+';
            state.isCollapsed = true;
        } else {
            // Expand
            stack.size = state.originalSize;
            btn.innerHTML = '−';
            state.isCollapsed = false;
        }

        layout.updateSize();
    });

    controlsContainer.insertBefore(btn, controlsContainer.firstChild);
})

// Only load config in main window - popouts get config from localStorage automatically
// Check if this is a popout window
const isSubWindow = new URLSearchParams(window.location.search).has('gl-window');

if (!isSubWindow && !layout.isSubWindow) {
    layout.loadLayout(layoutConfig);
}

layout.resizeWithContainerAutomatically = true;