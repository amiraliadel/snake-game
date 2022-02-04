window.animate = (function () {
    return window.requestAnimationFrame || 
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame || 
           function (callback) {
            setTimeout(callback, 1000 / 60);
           }
})();
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const score = document.getElementById('score');
canvas.width = 400;
canvas.height = 400;