"use Strict";
(function() {
    window.addEventListener("load", init);
    let numOfPlayer = 0;
    let selected = false;
    let treasure = ["one time use", "helm", "amor", "weapon", "shoe"];
    function init() {
        let newPlayerBtn = qs("#newPlayer");
        newPlayerBtn.addEventListener("click", createNewPlayer);
    }

    function createNewPlayer() {
        numOfPlayer++;
        let players = qs("#players");
        let name = qs("#name").value;
        let lvBox = qsa(".box")[0];
        

        let thePlayer = document.createElement("div");
        thePlayer.id = name;
        let playerName = document.createElement("h3");
        let nameTag = document.createElement("text");
        nameTag.textContent = name;
        playerName.textContent = "player " + numOfPlayer + ": " + name;
        let playerCards = document.createElement("div");

        playerCards.className = "cards";
        for (let i = 0; i < 2; i++) {
            let card = createMonster();
            playerCards.appendChild(card);
            card.addEventListener("click", select);
        }

        for (let i = 0; i < 3; i++) {
            let card = createTreasure();
            playerCards.appendChild(card);
            card.addEventListener("click", select);
        }


        lvBox.appendChild(nameTag);
        thePlayer.appendChild(playerName);
        thePlayer.appendChild(playerCards);
        playerCards.classList.add("hidden");

        let reveal = document.createElement("button");
        reveal.addEventListener("click", revealftn);
        reveal.textContent = "reveal";
        let hide = document.createElement("button");
        hide.textContent = "hide";
        hide.addEventListener("click", hideftn);
        thePlayer.append(reveal);
        thePlayer.append(hide);
        players.appendChild(thePlayer);
        
    }

    function createMonster() {
        let card = document.createElement("div");
        card.className = "card";
        let name = document.createElement("h4");
        name.textContent = "monster-name";
        let img = document.createElement("img");
        img.className = "cardPic";
        img.src = "img/monster.png";
        let description = document.createElement("text");
        description.textContent = "something something something something";
        let numlv = getRandomInt(1, 15);
        let level = document.createElement("h5");
        level.textContent = "level: " + numlv;
        
        let treasure = document.createElement("h5");
        let numTreasure = 3;
        if ( numlv < 5) {
            numTreasure =  1;
        } else if (numlv >= 5 && numlv <= 10) {
            numTreasure = 2;
        }
        treasure.textContent = numTreasure + " treasure";

        card.append(name);
        card.append(img);
        card.append(description);
        card.append(level);
        card.append(treasure);
        return card;
    }

    function createTreasure() {
        let card = document.createElement("div");
        card.className = "card";
        let name = document.createElement("h4");
        name.textContent = "treasure-name";
        let img = document.createElement("img");
        img.className = "cardPic";
        img.src = "img/treasure.png";
        let description = document.createElement("text");
        description.textContent = "something something something something";
        let bonusAmount = getRandomInt(2, 5);
        let bonus = document.createElement("h5");
        bonus.textContent = "+" + bonusAmount;
        let type = document.createElement("h5");
        type.textContent = treasure[getRandomInt(0, 5)];


        card.append(name);
        card.append(img);
        card.append(description);
        card.append(bonus);
        card.append(type);
        return card;
    }

    function select() {
        if (selected == false) {
            this.classList.add("selected");
            selected = true;
            let use = document.createElement("button");
            use.id = "usebtn";
            use.textContent = "use";
            let cards = qs(".cards");
            use.addEventListener("click", getRidOff);
            cards.append(use);
            let trade = document.createElement("button");
            trade.id = "trade";
            trade.textContent = "trade";
            trade.addEventListener("click", trading);
            cards.append(trade);
            let tradeTo = document.createElement("input");
            tradeTo.id = "tradeTo";
            cards.appendChild(tradeTo);

        } else if (this.classList.contains("selected")) {
            this.classList.remove("selected");
            selected = false;
            qs("#usebtn").remove();
            qs("#tradeTo").remove();
            qs("#trade").remove();
        }
    }

    function trading() {
        let name = qs("#tradeTo");
        let person = qs("#" + name.value);
        console.log(person);
    }

    function getRidOff() {
        qs(".selected").remove();
        this.remove();
        selected = false;
    }

    function revealftn() {
        this.previousSibling.classList.remove("hidden");
    }

    function hideftn() {
        this.previousSibling.previousSibling.classList.add("hidden");
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    function qs(select) {
        return document.querySelector(select);
    }

    function qsa(select) {
        return document.querySelectorAll(select);
    }
})();