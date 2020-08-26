
let howToPlay = document.getElementById("how-to-play-button");
let x = document.getElementById("x");


let screen = document.getElementById("how-to-play-screen");
function toggleScreen() {
    debugger;
if(screen.className == `hide-how-to-play`) {
    screen.className = `show-how-to-play`;
} else if(screen.className == `show-how-to-play`) {
    screen.className = `hide-how-to-play`;
}
}


x.onclick = toggleScreen;
howToPlay.onclick = toggleScreen;