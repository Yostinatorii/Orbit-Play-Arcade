// Globals
let currentUser = null;
let allGames = [];
let topGames = ["neonclicker.surge.sh"];
const neonClickerURL = "https://neonclicker.surge.sh";

// Page navigation
function navigateTo(page) {
    document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active"));
    document.getElementById(page).classList.add("active");
    if(page === "library") loadLibrary();
    if(page === "home") loadTopGames();
}

// User greeting
function updateUserUI() {
    const greeting = document.getElementById("user-greeting");
    const authLink = document.getElementById("auth-link");
    if(currentUser){
        greeting.style.display = "inline";
        greeting.textContent = `Hello, ${currentUser}`;
        authLink.textContent = "Logout";
        authLink.onclick = logoutUser;
    } else {
        greeting.style.display = "none";
        authLink.textContent = "Sign In";
        authLink.onclick = () => navigateTo("login");
    }
}

// Login/Signup
async function loginUser(){
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    if(!username || !password) return alert("Please enter username and password");

    const res = await fetch("/auth", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({username,password})
    });
    const data = await res.json();
    if(data.success){
        currentUser = username;
        updateUserUI();
        navigateTo("home");
    } else {
        alert(data.message);
    }
}

// Logout
function logoutUser(){
    currentUser = null;
    updateUserUI();
    navigateTo("home");
}

// Load top games
function loadTopGames(){
    const ul = document.getElementById("top-games");
    ul.innerHTML = "";
    topGames.slice(0,5).forEach(game=>{
        const li = document.createElement("li");
        li.textContent = game;
        li.onclick = () => playGame(game);
        ul.appendChild(li);
    });
}

// Load library
async function loadLibrary(){
    const grid = document.getElementById("game-grid");
    grid.innerHTML = "";
    const res = await fetch("/games");
    allGames = await res.json();
    allGames.forEach(game=>{
        const card = document.createElement("div");
        card.className = "game-card";
        const info = document.createElement("div");
        info.className = "game-info";
        const title = document.createElement("h3");
        title.textContent = game;
        info.appendChild(title);
        card.appendChild(info);
        card.onclick = () => {
            if(game === "neonclicker.surge.sh" || currentUser) playGame(game);
            else alert("Please sign in to play this game.");
        };
        grid.appendChild(card);
    });
}

// Search filter
function filterGames(){
    const val = document.getElementById("search-bar").value.toLowerCase();
    document.querySelectorAll(".game-card").forEach(card=>{
        const name = card.querySelector("h3").textContent.toLowerCase();
        card.style.display = name.includes(val) ? "block" : "none";
    });
}

// Play game in iframe
function playGame(game){
    navigateTo("game-player");
    const frame = document.getElementById("game-frame");
    document.getElementById("game-title").textContent = game;
    frame.src = game.startsWith("http") ? game : `/uploads/${game}`;
}

// Exit game
function exitGame(){
    const frame = document.getElementById("game-frame");
    frame.src = "";
    navigateTo("home");
}

// Fullscreen
function toggleFullscreen(){
    const iframe = document.getElementById("game-frame");
    if(iframe.requestFullscreen) iframe.requestFullscreen();
    else if(iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
}

// Dev upload
async function uploadFiles(){
    const files = document.getElementById("dev-upload").files;
    if(!files.length) return alert("Select files/folders first.");
    const formData = new FormData();
    for(let f of files){
        formData.append("gameFiles", f);
    }
    const res = await fetch("/upload", {method:"POST", body: formData});
    const data = await res.json();
    if(data.success) alert("Upload successful!");
    loadLibrary();
}
