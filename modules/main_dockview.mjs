import { createDockview } from 'dockview-core';
import { WaveVideoPanel } from "./wave_video_panel.mjs";
import {makeMap} from "./wave_map.mjs";
import {setupTimechangeEvtHdlr} from "./ui.mjs";

class WaveListPanel {
    constructor() {
        this._element = document.createElement('div');
    }
    get element() {
        return this._element;
    }
    init(params) {
        this._element.textContent = "Wave List";
    }
}


class SessionMapPanel {
    constructor() {
        this._element = document.createElement('div');
    }
    get element() {
        return this._element;
    }
    init(params) {
        this._element.textContent = "Session Map";
    }
}

class SessionSpeedPlot {
    constructor() {
        this._element = document.createElement('div');
    }
    get element() {
        return this._element;
    }
    init(params) {
        this._element.textContent = "Session Speed Plot";
    }
}


const dockview = createDockview(document.getElementById('dockview-container'), {
    className: 'dockview-theme-abyss',
    createComponent: (options) => {
        switch (options.name){
            case 'wave_list':
                return new WaveListPanel();
            case 'wave_video':
                return new WaveVideoPanel();
            case 'session_map':
                return new SessionMapPanel();
        }
    }
});

// Add three panels
dockview.addPanel({
    id: 'Wave List',
    component: 'wave_list',
    params: { textContent: 'wave list' }
});

dockview.addPanel({
    id: 'Wave Video',
    component: 'wave_video',
    position: { referencePanel: 'Wave List', direction: 'right' },
    params: { content: 'Top right panel' }
});

dockview.addPanel({
    id: 'Session Map',
    component: 'session_map',
    position: { referencePanel: 'Wave Video', direction: 'below' },
    params: { content: 'Bottom right panel' }
});

setTimeout(()=>{
    dockview.getPanel('Wave List').group.api.setSize({width:2300, height: dockview.getPanel('Wave List').group.api.height})
}, 1)


window.dockview = dockview;