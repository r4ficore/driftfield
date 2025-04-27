
// Σ DriftField Audio Layer + Choir
(function Σ_DriftField_AudioLayer(){
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    const framePulses = [];

    function playSinglePulse(pulse) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        const frequency = 200 + (pulse.energy * 800);
        const volume = 0.1 + (pulse.energy * 0.3);

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gainNode.gain.value = volume;

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    }

    function playChoir(pulses) {
        pulses.forEach(pulse => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            const frequency = 150 + (pulse.energy * 1000);
            const volume = 0.05 + (pulse.energy * 0.2);

            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;
            gainNode.gain.value = volume;

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
        });
    }

    const playedPulses = new Set();

    function loop(){
        if (typeof eventLog !== 'undefined' && Array.isArray(eventLog)) {
            const currentFramePulses = [];

            eventLog.forEach(event => {
                if ((event.type === "PulseReceived" || event.type === "CascadePulse") && !playedPulses.has(event.timestamp)) {
                    currentFramePulses.push(event);
                    playedPulses.add(event.timestamp);
                }
            });

            if (currentFramePulses.length === 1) {
                playSinglePulse(currentFramePulses[0]);
            } else if (currentFramePulses.length > 1) {
                playChoir(currentFramePulses);
            }
        }
        requestAnimationFrame(loop);
    }

    document.addEventListener('click', () => {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    });

    loop();
})();
