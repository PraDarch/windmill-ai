let chart;

async function runAI() {

    let wind = document.getElementById("wind").value;
    let terrain = document.getElementById("terrain").value;
    let budget = document.getElementById("budget").value;

    let res = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wind, terrain, budget })
    });

    let data = await res.json();

    document.getElementById("output").innerText =
        `Vortex: ${data.vortex_output} | Traditional: ${data.traditional_output}`;

    document.getElementById("result").innerText =
        `Best: ${data.recommendation}`;

    // Chart
    let ctx = document.getElementById("chart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Vortex", "Traditional"],
            datasets: [{
                label: "Power Output",
                data: [data.vortex_output, data.traditional_output]
            }]
        }
    });
    

    startSimulation(wind);
}

// Simulation
function startSimulation(windSpeed) {

    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");

    let angle = 0;

    // wind particles
    let particles = [];
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: Math.random() * 800,
            y: Math.random() * 300
        });
    }

    

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 🌪️ Wind particles
        ctx.fillStyle = "rgba(0,150,255,0.5)";
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();

            p.x += windSpeed * 0.5;
            if (p.x > canvas.width) p.x = 0;
        });

        // 🌬️ Traditional Windmill
        ctx.save();
        ctx.translate(200, 150);
        ctx.rotate(angle);

        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(70, 0);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.rotate(2 * Math.PI / 3);
        }
        ctx.restore();

        // 🌀 Vortex (curved vibration)
        let v = Math.sin(angle * 3) * 15;

        ctx.beginPath();
        ctx.moveTo(600 + v, 80);
        ctx.quadraticCurveTo(600 - v, 150, 600 + v, 220);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 6;
        ctx.stroke();

        // speed scaling
        angle += windSpeed * 0.03;

        requestAnimationFrame(draw);
    }

    draw();
}