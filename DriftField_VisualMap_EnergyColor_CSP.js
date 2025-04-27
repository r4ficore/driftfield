
// Σ DriftField Visual Map (Energy Color, CSP-Compatible)
(function Σ_DriftField_VisualMap(){
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const singularityPositions = {};
    const activePulses = [];

    function updatePositions(singularities){
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 100;
        const angleStep = (Math.PI * 2) / singularities.length;

        singularities.forEach((s, idx) => {
            const angle = idx * angleStep;
            singularityPositions[s.id] = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });
    }

    function energyToColor(energy){
        if (energy < 0.3) return `rgba(0,150,255,${energy})`;
        if (energy < 0.6) return `rgba(0,255,100,${energy})`;
        if (energy < 0.9) return `rgba(255,165,0,${energy})`;
        return `rgba(255,50,50,${energy})`;
    }

    function drawField(eventLog){
        ctx.fillStyle = '#0b0c10';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const aliveSingularities = [...new Set(
            eventLog
            .filter(e => e.type === "SingularityBirth")
            .map(e => e.id)
        )];

        updatePositions(aliveSingularities.map(id => ({id})));

        eventLog.forEach(event => {
            if (event.type === "PulseReceived" || event.type === "CascadePulse") {
                activePulses.push({
                    from: event.from,
                    to: event.to,
                    energy: event.energy || 0.5,
                    createdAt: Date.now()
                });
            }
        });

        const now = Date.now();
        for (let i = activePulses.length - 1; i >= 0; i--) {
            const pulse = activePulses[i];
            const age = now - pulse.createdAt;
            const maxAge = 2000;
            if (age > maxAge) {
                activePulses.splice(i, 1);
                continue;
            }
            const alpha = 1 - (age / maxAge);
            const fromPos = singularityPositions[pulse.from];
            const toPos = singularityPositions[pulse.to];
            if (fromPos && toPos) {
                ctx.strokeStyle = energyToColor(pulse.energy * alpha);
                ctx.lineWidth = 2 + pulse.energy * 4;
                ctx.beginPath();
                ctx.moveTo(fromPos.x, fromPos.y);
                ctx.lineTo(toPos.x, toPos.y);
                ctx.stroke();
            }
        }

        eventLog.forEach(event => {
            if (event.type === "HiddenBridgeRevealed") {
                const fromPos = singularityPositions[event.source];
                const toPos = singularityPositions[event.target];
                if (fromPos && toPos) {
                    ctx.strokeStyle = 'rgba(150, 150, 150, 0.2)';
                    ctx.setLineDash([5, 10]);
                    ctx.beginPath();
                    ctx.moveTo(fromPos.x, fromPos.y);
                    ctx.lineTo(toPos.x, toPos.y);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }
        });

        aliveSingularities.forEach(id => {
            const pos = singularityPositions[id];
            if (pos) {
                const pulse = Math.sin(Date.now() / 300 + id.length) * 2 + 6;
                ctx.fillStyle = '#66fcf1';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, pulse, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    function animationLoop(){
        if (typeof eventLog !== 'undefined' && Array.isArray(eventLog)) {
            drawField(eventLog);
        }
        window.requestAnimationFrame(animationLoop);
    }

    window.requestAnimationFrame(animationLoop);
})();
