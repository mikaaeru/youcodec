document.addEventListener('DOMContentLoaded', () => {
    const defaults = {
        preferred_codec: 'vp9', // Assumming vp9 is da best for older apple silicon macs
        enable_hdr: false,
        force_original: true
    };

    chrome.storage.local.get(defaults, (items) => {
        document.getElementById('preferred_codec').value = items.preferred_codec;
        document.getElementById('enable_hdr').checked = items.enable_hdr;
        document.getElementById('force_original').checked = items.force_original;
    });

    const saveSettings = () => {
        const settings = {
            preferred_codec: document.getElementById('preferred_codec').value,
            enable_hdr: document.getElementById('enable_hdr').checked,
            force_original: document.getElementById('force_original').checked
        };
        
        chrome.storage.local.set(settings, () => {
            const msg = document.getElementById('save-msg');
            msg.style.opacity = '1';
            setTimeout(() => msg.style.opacity = '0', 2000);
        });
    };

    document.getElementById('preferred_codec').addEventListener('change', saveSettings);
    document.getElementById('enable_hdr').addEventListener('change', saveSettings);
    document.getElementById('force_original').addEventListener('change', saveSettings);
});