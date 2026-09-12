window.onload = function() {
    const MAX_TILT = (35 * Math.PI) / 180;
    const TILT_FACTOR = 0.08;
    var mouseDown = false;

    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');

    var frameCount = 0;
    var desiredFPS = 60;

    var pilot = {
        width: 30,
        height: 30,
        fillColor: '#1C542D',
        strokeColor: "#A03472",
        eyeColor: "#8673A1",
        mouthColor: "#641C34",
        mouthOpen: false
    };

    var rocket = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 80,
        height: 36,
        fillColor: "#8B8C7A",
        strokeColor: "#1C1C1C",
        exhaust: "#E25822",
        exhaustCore: "#FCE883",
        speedX: 6,
        speedY: 4,
        currentVy: 0,
        rotation: 0
    };

    window.addEventListener("mousedown", function (event) {
        mouseDown = true;
    });

    window.addEventListener("mouseup", function (event) {
        mouseDown = false;
    });

    requestAnimationFrame(mainLoop);

    function mainLoop() {
        processInput();
        update();
        draw();

        setTimeout(function() {
            requestAnimationFrame(mainLoop);
        }, 1000 / desiredFPS);
    }

    function processInput() {
        if (mouseDown) {
            rocket.currentVy = -rocket.speedY;
            pilot.mouthOpen = true;
        }
        else {
            rocket.currentVy = rocket.speedY;
            pilot.mouthOpen = false;
        }
    }

    function updateRocket() {
        rocket.x += rocket.speedX;

        // store previous y to check if clamped
        let prevY = rocket.y;
        rocket.y += rocket.currentVy;

        // clamping x
        if (rocket.x + rocket.width / 2 > canvas.width) {
            rocket.speedX = -Math.abs(rocket.speedX);
            rocket.x = canvas.width - rocket.width / 2;
        }
        if (rocket.x - rocket.width / 2 < 0) {
            rocket.speedX = Math.abs(rocket.speedX);
            rocket.x = rocket.width / 2;
        }

        // clamping y
        if (rocket.y > canvas.height - 30) {
            rocket.y = canvas.height - 30;
        }
        if (rocket.y < 30) {
            rocket.y = 30;
        }

        // calculate tilt angle (0 if y did not change)
        let targetTilt = 0;
        let actualVy = rocket.y - prevY;

        if (actualVy !== 0) {
            targetTilt = actualVy * TILT_FACTOR;
            targetTilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, targetTilt));
        }

        // smooth rotation
        rocket.rotation += (targetTilt - rocket.rotation) * 0.2;
    }

    function update() {
        frameCount++;
        updateRocket();
    }

    function drawPilot() {
        ctx.save();
        ctx.translate(-pilot.width / 2, -pilot.height / 2 - 4);

        // draw body
        ctx.beginPath();
        ctx.fillStyle = pilot.fillColor;
        ctx.strokeStyle = pilot.strokeColor;
        ctx.lineWidth = 2;
        ctx.rect(0, 0, pilot.width, pilot.height);
        ctx.fill();
        ctx.stroke();

        // blink every 10 frames
        if (frameCount % 10 < 2) {
            // draw left eye
            ctx.beginPath();
            ctx.fillStyle = pilot.eyeColor;
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.rect(4, 9, 7, 2);
            ctx.fill();
            ctx.stroke();

            // draw right eye
            ctx.beginPath();
            ctx.rect(19, 9, 7, 2);
            ctx.fill();
            ctx.stroke();
        }
        else {
            // draw left eye
            ctx.beginPath();
            ctx.fillStyle = pilot.eyeColor;
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.rect(4, 7, 7, 6);
            ctx.fill();
            ctx.stroke();

            // draw right eye
            ctx.beginPath();
            ctx.rect(19, 7, 7, 6);
            ctx.fill();
            ctx.stroke();
        }

        // draw mouth
        ctx.beginPath();
        ctx.fillStyle = pilot.mouthColor;
        ctx.strokeStyle = pilot.mouthColor;
        if (pilot.mouthOpen) {
            ctx.rect(8, 18, 14, 7);
            ctx.fill();
        }
        else {
            ctx.lineWidth = 2;
            ctx.arc(15, 17, 7, 0.2 * Math.PI, 0.8 * Math.PI, false); // smiley face
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawFire() {
        if (!mouseDown) return;

        ctx.save();
        ctx.translate(-rocket.width / 2, 0);

        // flicker scale
        const flickerX = 0.85 + Math.random() * 0.35;
        const flickerY = 0.8 + Math.random() * 0.4;
        ctx.scale(flickerX, flickerY);

        // outer flame
        ctx.beginPath();
        ctx.fillStyle = rocket.exhaust;
        ctx.moveTo(0, -10);
        ctx.lineTo(-32, 0);
        ctx.lineTo(0, 10);
        ctx.closePath();
        ctx.fill();

        // inner flame
        ctx.beginPath();
        ctx.fillStyle = rocket.exhaustCore;
        ctx.moveTo(0, -5);
        ctx.lineTo(-18, 0);
        ctx.lineTo(0, 5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    function drawRocket() {
        ctx.save();
        ctx.translate(rocket.x, rocket.y);

        // face direction
        if (rocket.speedX < 0) {
            ctx.scale(-1, 1);
        }

        ctx.rotate(rocket.rotation);

        // draw body
        const hw = rocket.width / 2;
        const hh = rocket.height / 2;

        ctx.beginPath();
        ctx.fillStyle = rocket.fillColor;
        ctx.strokeStyle = rocket.strokeColor;
        ctx.lineWidth = 2;
        ctx.moveTo(-hw, -hh);
        ctx.lineTo(hw * 0.4, -hh);
        ctx.lineTo(hw, 0);
        ctx.lineTo(hw * 0.4, hh);
        ctx.lineTo(-hw, hh);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // draw cockpit window
        ctx.beginPath();
        ctx.fillStyle = "#AEE2FF";
        ctx.arc(0, 0, 18, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // draw thruster nozzle
        ctx.fillStyle = "#333333";
        ctx.fillRect(-hw - 4, -hh + 8, 5, rocket.height - 16);

        // draw children
        drawFire();
        drawPilot();

        ctx.restore();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawRocket();
    }
}