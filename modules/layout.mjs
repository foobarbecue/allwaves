import { GoldenLayout } from 'https://cdn.jsdelivr.net/npm/golden-layout@2.6.0/+esm';
import "./main.mjs";
import { timechangeEvtHdlr } from "./ui.mjs";

const layoutConfig = {
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

const container = document.getElementById('app-container');
const layout = new GoldenLayout(container);

layout.registerComponentFactoryFunction('waveList',(container, state) => {
    const waveListDiv = document.createElement('div');
    waveListDiv.id='wave-list';
    const ul = document.createElement('ul');
    waveListDiv.appendChild(ul);
    container.element.appendChild(waveListDiv);
    container.element.setAttribute('style','overflow: scroll')
})

layout.registerComponentFactoryFunction('waveVideo',(container, state) => {
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
})

layout.registerComponentFactoryFunction('waveMap',(container, state) => {
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
    waveMapDiv.setAttribute('style','width: 100%; height: 100%')
    container.element.appendChild(waveMapTitlebarDiv);
    container.element.appendChild(waveMapDiv);
    container.element.querySelector('#time-adj').oninput = (ev) => {
        container.element.querySelector('#time-adj-disp').innerText = ev.target.value;
        timechangeEvtHdlr(window.player.getCurrentTime());
    };
})

layout.registerComponentFactoryFunction('wavePlot',(container, state) => {
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
})

layout.loadLayout(layoutConfig)

// Handle window resize
window.addEventListener('resize', () => {
    layout.setSize(container.offsetWidth, container.offsetHeight);
});