"use Strict";
(function() {
    window.addEventListener("load", init);
    let numOfPlayer = 0;
    function init() {
        let btnNewPlayer = qs("#newPlayerbtn");
        btnNewPlayer.addEventListener("click", buttionFuction)

    }

    function buttionFuction() {
        numOfPlayer++;
        let newPlayer = document.createElement("div");
        newPlayer.id = "player" + numOfPlayer;
        newPlayer.className = "thePlayer";
        let players = qs(".player");
        newPlayer.textContent = "player" + numOfPlayer;
        let player = document.createElement("text");
        player.textContent = "P" + numOfPlayer;
        let box1 = qs(".box");
        box1.appendChild(player);
        players.appendChild(newPlayer);
        for (let i = 0; i < 2; i++) {
            newPlayer.appendChild(createMonster());
        }
        for (let i = 0; i < 3; i++) {
            newPlayer.appendChild(createTreasure());
        }
        newPlayer.addEventListener("click", showInfo);
    }

    function createTreasure() {
        let treasure = document.createElement("div");
        treasure.className = "treasure";
        treasure.textContent = "bonus : " + getRandomInt(1,5);
        return treasure;
    }

    function createMonster() {
        let monster = document.createElement("div");
        monster.className = "monster";
        monster.textContent = "level : " + getRandomInt(1,15);
        return monster;
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    function showInfo() {
        let infoBox = qs("#info");
        let playerInfo = document.createElement("div");
        let playerName = document.createElement("h4");
        playerName.textContent = this.id + " level: ";
        
        playerInfo.appendChild(playerName);
        infoBox.appendChild(playerInfo);
    }

    function qs(select) {
        return document.querySelector(select);
    }

    function qsa(select) {
        return document.querySelectorAll(select);
    }
})();