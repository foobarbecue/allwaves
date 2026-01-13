import { GoldenLayout } from 'https://cdn.jsdelivr.net/npm/golden-layout@2.6.0/+esm';

const layoutConfig = {
    root: {
        type: 'row',
        content: [
            {
                type: 'component',
                title: 'Wave list',
                componentType: 'waveList',
                width: 10
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
    const div = document.createElement('div');
    container.element.appendChild(div);
})

layout.registerComponentFactoryFunction('waveVideo',(container, state) => {
    const div = document.createElement('div');
    container.element.appendChild(div);
})

layout.registerComponentFactoryFunction('waveMap',(container, state) => {
    const div = document.createElement('div');
    container.element.appendChild(div);
})

layout.registerComponentFactoryFunction('wavePlot',(container, state) => {
    const div = document.createElement('div');
    container.element.appendChild(div);
})

layout.loadLayout(layoutConfig)

// Handle window resize
window.addEventListener('resize', () => {
    layout.setSize(container.offsetWidth, container.offsetHeight);
});