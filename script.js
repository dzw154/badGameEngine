window.onload = function() {

    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');

    context.fillStyle="yellow"
    context.beginPath();
    context.rect(50,50,100,100);
    context.fill();

    context.fillStyle="red"
    context.beginPath();
    context.rect(55, 55, 10, 10);
    context.fill();

    context.fillStyle="blue"
    context.beginPath();
    context.rect(130, 55, 10, 10);
    context.fill();

    context.strokeStyle="purple"
    context.beginPath();
    context.moveTo(75, 110);
    context.quadraticCurveTo(20, 150, 130, 100);
    context.stroke();
}