chrome.storage.local.get({
    preferred_codec: 'vp9', // assume vp9 is best because I use macbook air M1
    enable_hdr: false,
    force_original: true
}, (config) => {

    const settingsElement = document.createElement('meta');
    settingsElement.id = 'youcon-settings';
    settingsElement.dataset.config = JSON.stringify(config);
    (document.head || document.documentElement).appendChild(settingsElement);

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = function() {
        this.remove(); 
        settingsElement.remove();
    };
    (document.head || document.documentElement).appendChild(script);
});