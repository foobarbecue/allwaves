export class WaveVideoPanel {
    constructor() {
        this._element = document.createElement('div');
    }
    get element() {
        return this._element;
    }
    init(params) {
        window.onYouTubeIframeAPIReady = () => {
            window.player = new YT.Player(this._element, {
                playerVars: {
                    playsinline: 1,
                },
            });
        };
    }
}