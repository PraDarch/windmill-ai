let chart;

// ---------------- AI CALL ----------------
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
    let ctxChart = document.getElementById("chart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctxChart, {
        type: 'bar',
        data: {
            labels: ["Vortex", "Traditional"],
            datasets: [{
                label: "Power Output",
                data: [data.vortex_output, data.traditional_output]
            }]
        }
    });

    // Start simulation
    startSimulation(wind, terrain);
}


// ---------------- SIMULATION ----------------
function startSimulation(windSpeed, terrain) {

    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");

    let angle = 0;

    // 🌄 Background Image
    let bgImage = new Image();

    let imageMap = {
        "Urban": "/static/images/urban.jpg",
        "Coastal": "/static/images/coastal.jpg",
        "Rural": "/static/images/rural.jpg",
        "Hilly": "/static/images/hilly.jpg"
    };

    bgImage.src = imageMap[terrain];

    // 🌪️ Wind particles
    let particles = [];
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        });
    }

    function draw() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ✅ Draw background FIRST
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

        // 🌫️ Slight dark overlay (for better visibility)
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 🌪️ Wind particles
        ctx.fillStyle = "rgba(0,200,255,0.9)";
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();

            p.x += windSpeed * 0.5;

            if (p.x > canvas.width) {
                p.x = 0;
                p.y = Math.random() * canvas.height;
            }
        });

        // 🌬️ Traditional Windmill
        ctx.save();
        ctx.translate(200, 150);
        ctx.rotate(angle);

        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(70, 0);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 6;
            ctx.shadowColor = "cyan";
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.rotate(2 * Math.PI / 3);
        }
        ctx.restore();

        // 🌀 Vortex Windmill
        let v = Math.sin(angle * 3) * 15;

        ctx.beginPath();
        ctx.moveTo(600 + v, 80);
        ctx.quadraticCurveTo(600 - v, 150, 600 + v, 220);
        ctx.strokeStyle = "#ff4d4d";
        ctx.lineWidth = 8;
        ctx.shadowColor = "red";
        ctx.shadowBlur = 15;
        ctx.stroke();

        // 🔄 Speed control
        angle += windSpeed * 0.03;

        requestAnimationFrame(draw);
    }

    // Start animation ONLY after image loads
    bgImage.onload = () => {
        draw();
    };
}