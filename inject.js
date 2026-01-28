(function() {
    const settingsEl = document.getElementById('youcon-settings');
    if (!settingsEl) return;
    
    let config;
    try {
        config = JSON.parse(settingsEl.dataset.config);
    } catch (e) {
        console.error("[YouCon] Failed to parse settings", e);
        return;
    }

    console.log("[YouCon] Codecs configured:", config);

    const origIsTypeSupported = window.MediaSource.isTypeSupported;
    window.MediaSource.isTypeSupported = function(mimeType) {
        if (!mimeType) {
            return origIsTypeSupported.call(this, mimeType);
        }

        if (!config.enable_hdr) {
            if (mimeType.includes('vp09.02') || mimeType.includes('vp09.03')) {
                return false;
            }
            if (mimeType.includes('smpte2084')) { 
                return false;
            }
        }
        const codec = config.preferred_codec;

        if (codec === 'h264') {
            if (mimeType.includes('av01') || mimeType.includes('vp09') || mimeType.includes('vp8')) {
                return false;
            }
        } 
        else if (codec === 'vp8') {
            if (mimeType.includes('av01') || mimeType.includes('vp09')) {
                return false;
            }
        }
        else if (codec === 'vp9') {
            if (mimeType.includes('av01')) {
                return false;
            }
        }
        
        return origIsTypeSupported.call(this, mimeType);
    };
    if (config.force_original) {
        
        function getPlayer() {
            return document.getElementById('movie_player') || 
                   document.querySelector('.html5-video-player');
        }
        function enforceOriginalAudio() {
            const player = getPlayer();
            if (!player || !player.getAudioTrack || !player.setAudioTrack) return;
            const tracks = player.getAvailableAudioTracks();
            if (!tracks || tracks.length === 0) return;

            const currentTrackIndex = player.getAudioTrack();
            const originalTrack = tracks.find(t => t.name && t.name.toLowerCase().includes('original'));
            if (originalTrack) {
                const originalIndex = tracks.indexOf(originalTrack);
                if (currentTrackIndex !== originalIndex) {
                    console.log(`[YouCon] Forcing audio to: ${originalTrack.name}`);
                    player.setAudioTrack(originalIndex);
                }
            }
        }

        function startAudioObserver() {
            window.addEventListener('yt-navigate-finish', () => {
                setTimeout(enforceOriginalAudio, 500);
                setTimeout(enforceOriginalAudio, 2500);
            });
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                        setTimeout(enforceOriginalAudio, 1000);
                    }
                }
            });

            const videoTag = document.querySelector('video');
            if (videoTag) {
                observer.observe(videoTag, { attributes: true });
                videoTag.addEventListener('loadeddata', enforceOriginalAudio);
            } else {
                const bodyObserver = new MutationObserver(() => {
                    const v = document.querySelector('video');
                    if (v) {
                        observer.observe(v, { attributes: true });
                        v.addEventListener('loadeddata', enforceOriginalAudio);
                        bodyObserver.disconnect();
                    }
                });
                bodyObserver.observe(document.body, { childList: true, subtree: true });
            }
            setTimeout(enforceOriginalAudio, 1000);
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startAudioObserver);
        } else {
            startAudioObserver();
        }
    }
})();