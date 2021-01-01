"use Strict";
(function() {
    window.addEventListener("load", init);
    let numOfPlayer = 0;
    let selected = false;
    let selectedIcon = false;
    let treasure = ["one time use", "helm", "amor", "weapon", "shoe"];
    let curse1 = "lose a level";
    let curse2 = "lose a piece of equipment";
    let curse3 = "lose your strongest equipment"
    let curses = [curse1, curse2, curse3];

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

        nameTag.addEventListener("click", selectIcon);
        playerName.textContent = "player " + numOfPlayer + ": " + name;
        let playerCards = document.createElement("div");

        playerCards.className = "cards";
        for (let i = 0; i < 2; i++) {
            let card = createMonster();
            playerCards.appendChild(card);

        }

        for (let i = 0; i < 3; i++) {
            let card = createTreasure();
            playerCards.appendChild(card);
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
        img.src = "img/monster.PNG";
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
        card.addEventListener("click", select);

        card.append(name);
        card.append(img);
        card.append(description);
        card.append(level);
        card.append(treasure);
        return card;
    }

    function createCurse() {
        let card = document.createElement("div");
        card.className = "card";
        let name = document.createElement("h4");
        name.textContent = "curse-name";
        let img = document.createElement("img");
        img.src = "img/curse.PNG";
        img.className = "cardPic";
        let desCription = document.createElement("text");
        desCription.textContent = curses[getRandomInt(0,3)];
        card.addEventListener("click", select);

        card.append(name);
        card.append(img);
        card.append(desCription);
        return card;

    }

    function createTreasure() {
        let card = document.createElement("div");
        card.className = "card";
        let name = document.createElement("h4");
        name.textContent = "treasure-name";
        let img = document.createElement("img");
        img.className = "cardPic";
        img.src = "img/treasure.PNG";
        let description = document.createElement("text");
        description.textContent = "something something something something";
        let bonusAmount = getRandomInt(2, 5);
        let bonus = document.createElement("h5");
        bonus.textContent = "+" + bonusAmount;
        let type = document.createElement("h5");
        type.textContent = treasure[getRandomInt(0, 5)];
        card.addEventListener("click", select);

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
            let cards = this.parentNode;
            use.addEventListener("click", getRidOff);
            cards.append(use);

            let equip = document.createElement("button");
            equip.id = "equip";
            equip.textContent = "equip";
            equip.addEventListener("click", equiping);
            cards.appendChild(equip);

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
            qs("#equip").remove();
        }
    }

    function selectIcon() {
        if (selectedIcon == false) {
            this.classList.add("selectIcon");
            selectedIcon = true;
            let doorBtn = document.createElement("button");
            doorBtn.textContent = "KickDown door";
            doorBtn.className = "drawsBtn";
            doorBtn.addEventListener("click", getMonsterOrCurse);

            let treasureBtn = document.createElement("button");
            treasureBtn.className = "drawsBtn";
            treasureBtn.textContent = "get Treasure";
            treasureBtn.addEventListener("click", getTreasure);

            let doorAndTreasure = qs("#draws");

            doorAndTreasure.append(doorBtn);
            doorAndTreasure.appendChild(treasureBtn);

            let lvUpBtn = document.createElement("button");
            lvUpBtn.textContent = "lv up";
            lvUpBtn.className = "drawsBtn";
            lvUpBtn.addEventListener("click", levelUp);

            let lvDownBtn = document.createElement("button");
            lvDownBtn.textContent = "lv down";
            lvDownBtn.className = "drawsBtn";
            lvDownBtn.addEventListener("click", levelDown);

            doorAndTreasure.append(lvUpBtn);
            doorAndTreasure.append(lvDownBtn);

        } else if (this.classList.contains("selectIcon")) {
            this.classList.remove("selectIcon");
            let button = qsa(".drawsBtn");
            for (let i = 0; i < button.length; i ++) {
                button[i].remove();
            }
            selectedIcon = false;
        }
        
    }

    function levelUp() {
        let player = qs(".selectIcon");
        let nextLv = parseInt(player.parentNode.id);
        let nextBox = player.parentNode.parentNode.children[nextLv];
        nextBox.append(player);
    }

    function levelDown() {
        let player = qs(".selectIcon");
        let previousLv = parseInt(player.parentNode.id) - 2;
        let previousBox = player.parentNode.parentNode.children[previousLv];
        previousBox.append(player);
    }

    function getMonsterOrCurse(){
        let num = getRandomInt(1,10);
        let name = qs(".selectIcon").textContent;
        let player = qs("#" + name);
        let deck = player.children[1];
        if (num < 3) {
            let curse = createCurse();
            deck.append(curse);
        } else {
            console.log("monster");
            let monster = createMonster();
            deck.append(monster);
        }
    }

    function getTreasure() {
        let card = createTreasure();
        let name = qs(".selectIcon").textContent;
        let player = qs("#" + name);
        let deck = player.children[1];
        deck.appendChild(card);
    }



    function equiping() {
        if (!qs(".selected").classList.contains("equip")) {
            qs(".selected").classList.add("equip");
        } else {
            qs(".selected").classList.remove("equip");
        }
        
    }

    function trading() {
        let name = qs("#tradeTo").value;
        let person = qs("#" + name);
        let deck = person.children[1];
        deck.append(qs(".selected"));
        console.log(deck);
    }

    function getRidOff() {
        qs(".selected").remove();
        qs("#tradeTo").remove();
        qs("#trade").remove();
        qs("#equip").remove();
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