"use Strict";

//const { message } = require("statuses");


(function() {
    window.addEventListener("load", init);
    const socket = io();

    socket.on("newConnection", message => {
        console.log(message);
        CurrentPlayerID = message[1];
    });

    socket.on("addnewPlayer", playerName => {
        addnewPlayer(playerName);
    });

    socket.on("someOneWentonAdventure", (playerInfo)=> {
        goOnAdventure(playerInfo);
    })

    socket.on("btnEnable", () => {
        qs("#fightBtn").classList.remove("hidden");
        qs("#runBtn").classList.remove("hidden");
    })

    socket.on("everyonehideBattleFrame", () => {
        qs(".showSelectedMove").classList.add("hidden");
    })
    
    // let numOfPlayer = 0;
    // let selected = false;
    // let selectedIcon = false;
    // let treasure = ["one time use", "helm", "amor", "weapon", "shoe"];
    // let curse1 = "lose a level";
    // let curse2 = "lose a piece of equipment";
    // let curse3 = "lose your strongest equipment";
    // let curse4 = "lose 2 level";
    // let curses = [curse1, curse2, curse3, curse4];

    function init() {
        // let newPlayerBtn = qs("#newPlayer");
        // newPlayerBtn.addEventListener("click", createNewPlayer);
        let CurrentPlayerID;
        let inBattle = false;

        // joining a game
        const PlayerjoinGameBtn =  qs("#PlayerjoinGameBtn");
        PlayerjoinGameBtn.addEventListener("click", joinGame);

        // going on adventure
        const adventureCard = qs("#adventure");
        adventureCard.addEventListener("click", () => {
            inBattle = true;
            sendGoOnAdventureInfo();
        });

        //discard btn 
        qs("#discardBtn").addEventListener("click", discardBtn);

        //equip btn
        qs("#equipBtn").addEventListener("click", () => {
            equips(inBattle);
        });

        // use btn

        //fight button


        //run button
        qs("#runBtn").addEventListener("click", runClicked);
        
    }

    function equips(inBattle) {
        let cardWrapper = qs(".selectedCard");
        let nameOfCard = cardWrapper.firstChild.children[1].textContent;
        let nameOfCardArray = nameOfCard.split(" ");
        let addition = cardWrapper.firstChild.children[2].textContent;
        console.log(nameOfCard);
        console.log(addition);
        let currentEquip = qs("#"+nameOfCardArray[1])
        
        let currentEquipArray = currentEquip.textContent.split(" ");
        console.log(currentEquipArray[0]); //good
        console.log(nameOfCardArray[0]);
        if (currentEquipArray[0] == nameOfCardArray[0]) {
            console.log(currentEquipArray[2].slice(1)); // good
            console.log(addition.slice(1));
            let newBonus = parseInt(addition.slice(1)) + 
                parseInt(currentEquipArray[2].slice(1));
            currentEquip.textContent = nameOfCard + " +"+ newBonus

        } else {
            currentEquip.textContent = nameOfCard + " " + addition;
        }

        updateAttack();
        console.log("inbattle" + inBattle);
        if (inBattle) {
            //socket.emit("equipInbattle")
            sendGoOnAdventureInfo();
        }

        btnInvisiable();
        discardBtn();
    }

    function updateAttack() {
        let thePlayerIcon = qs("#thePlayerIcon").children;
        let attack = 0;
        for (let i = 0; i < 6; i++) {
            attack += parseInt(thePlayerIcon[i].textContent.split(" ")[2].slice(1));
        }
        qs("#attack").textContent = "attack = " + attack;
    }

    function discardBtn() {
        let cardWrapper = qs(".selectedCard");
        btnInvisiable();
        cardWrapper.remove();
    }

    function disableButton() {
        qs("#fightBtn").classList.add("hidden");
        qs("#runBtn").classList.add("hidden");
    }

    function runClicked() {
        inBattle = false;
        disableButton();
        socket.emit("hideBattleFrame");
    }

    function goOnAdventure(playerInfo) {
        inBattle = true;
        qs(".showSelectedMove").classList.remove("hidden");

        let otherPlayIcon = qs("#theOtherPlayerIcon");
        let i;
        for (i = 0; i< otherPlayIcon.children.length; i++) {
            otherPlayIcon.children[i].textContent = playerInfo[i];
        }
        qs("#otherPlayerName").textContent =playerInfo[i];
        qs("#otherAttack").textContent=playerInfo[i+1];
        let monsterCard = qs(".showSelectedMove .card");

        let monsterCardInfo = playerInfo[playerInfo.length-1];
        for (let j = 0; j < 3; j++) {
            monsterCard.children[j].textContent = monsterCardInfo[j];
        }
        

    }

    function sendGoOnAdventureInfo() {
        let thePlayerIcon = qs("#thePlayerIcon");
        let length = thePlayerIcon.children.length;
        let playerInfo = [];
        let i;
        for (i = 0; i < length; i++) {
            playerInfo[i] = thePlayerIcon.children[i].textContent;
        }
        playerInfo[i] = qs("#playerName").textContent;
        playerInfo[i+1] = qs("#attack").textContent;
  
        socket.emit("goOnAdventure", playerInfo);
    }

    

    function joinGame() {
        // switch from join game screen to play screen
        qs("main").classList.remove("hidden");
        qs(".joinGame").classList.add("hidden");

        // update current player name
        const name = document.getElementById("PlayerCreateName").value;
        qs("#playerName").textContent = name;

        // update other player that a new player join
        socket.emit("joinGame", name);

        // generate cards for current player
        socket.on("randomCard", cardArray => {
            getCardsToCurrentPlayerHand(cardArray);
        });
    }

    // upload random card to the currect player's hand
    function getCardsToCurrentPlayerHand(cardArray) {
        console.log(cardArray);
        let thePlayerhand = qs("#thePlayerhand");
        for (let i = 0; i < 7; i++) {
            let card = createCard();
            let cardInfo = card.firstChild.childNodes;
            if (i < 3) {
                cardInfo[0].textContent = "Equips";
                cardInfo[1].textContent = cardArray[i];
                cardInfo[2].textContent = "+1";
            } else if (i < 5) {
                cardInfo[0].textContent = "CurseOrBuff";
                cardInfo[1].textContent = cardArray[i];
            } else {
                cardInfo[0].textContent = "Monster";
                cardInfo[1].textContent = cardArray[i];
                let lv = Math.floor(Math.random() * 20);
                cardInfo[2].textContent = "lv. " + lv;
            } // special card ->
            thePlayerhand.prepend(card);
        }
    }

    // create a card
    function createCard() {
        let cardWrapper = document.createElement("div");
        cardWrapper.classList.add("cardWrapper");

        let card = document.createElement("div");
        card.classList.add("card");

        let typeOfCard = document.createElement("div");
        typeOfCard.classList.add("typeOfCard");

        let nameOfCard = document.createElement("div");
        nameOfCard.classList.add("nameOfCard");

        let description = document.createElement("div");
        description.classList.add("description");

        cardWrapper.appendChild(card);
        card.appendChild(typeOfCard);
        card.appendChild(nameOfCard);
        card.appendChild(description);
        cardWrapper.addEventListener("click", selectCard);
        return cardWrapper;
    }

    function btnInvisiable() {
        qs("btncontainer").classList.add("invisiable");
        qs("#equipBtn").classList.add("invisiable");
        qs("#useBtn").classList.add("invisiable");
    }

    function selectCard() {
        let selectedCard = qsa(".selectedCard");
        if (this.classList.contains("selectedCard")) {
            this.classList.remove("selectedCard");
            btnInvisiable()
            return;
        }

        if (selectedCard.length > 0){
            selectedCard[0].classList.remove("selectedCard");
            qs("#equipBtn").classList.add("invisiable");
            qs("#useBtn").classList.add("invisiable");
        }
        this.classList.add("selectedCard");
        qs("btncontainer").classList.remove("invisiable");
        let typeOfCard = this.firstChild.firstChild.textContent;
        if (typeOfCard == "Equips") {
            qs("#equipBtn").classList.remove("invisiable");
        } else {
            qs("#useBtn").classList.remove("invisiable");
        }
    }
    
    function addnewPlayer(playerName) {
        let otherPlayer = document.createElement("div");
        otherPlayer.classList.add("otherPlayer");
        let otherPlayerIcon = document.createElement("div");
        otherPlayerIcon.classList.add("otherPlayerIcon");
        otherPlayerIcon.textContent = 0;
        let name = document.createElement("h3");
        name.textContent = playerName;

        let newIconOnBoard = document.createElement("div");
        newIconOnBoard.classList.add("playerIconOnBoard");
        newIconOnBoard.textContent = playerName;
        qs(".iconContainer").appendChild(newIconOnBoard);
        otherPlayer.appendChild(otherPlayerIcon);
        otherPlayer.appendChild(name);
        qs("#playerIconContainer").appendChild(otherPlayer);
    }


   /* 
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
        playerName.textContent = "player " + numOfPlayer + ": " + name + " ";
        let att = document.createElement("text");
        att.textContent = "0";
        playerName.appendChild(att);

        let playerCards = document.createElement("div");

        playerCards.className = "cards";
        for (let i = 0; i < 2; i++) {
            //let card = createMonster();
            let card = doorCard();
            playerCards.appendChild(card);
        }
        for (let i = 0; i < 3; i++) {
            //let card = createTreasure();
            let card = treasureCard();
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

    function doorCard() {
        let num = getRandomInt(0, 18);
        let card = document.createElement("div");
        card.className = "card";
        let img = document.createElement("img");
        img.className = "thePic";
        img.src = "img/door/" + num + ".PNG";
        card.addEventListener("click", select);

        card.appendChild(img);
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
        desCription.textContent = curses[getRandomInt(0,4)];
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

    function treasureCard() {
        let num = getRandomInt(0,31);
        let card = document.createElement("div");
        card.className = "card";
        let img = document.createElement("img");
        img.className = "thePic";
        img.src = "img/treasure/" + num + ".PNG";
        card.addEventListener("click", select);

        card.appendChild(img);

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
        //let num = getRandomInt(1,10);
        let name = qs(".selectIcon").textContent;
        let player = qs("#" + name);
        let deck = player.children[1];
        let card = doorCard();
        deck.appendChild(card);
        // if (num < 4) {
        //     let curse = createCurse();
        //     deck.append(curse);
        // } else {
        //     console.log("monster");
        //     let monster = createMonster();
        //     deck.append(monster);
        // }
    }

    function getTreasure() {
        //let card = createTreasure();
        let card = treasureCard();
        let name = qs(".selectIcon").textContent;
        let player = qs("#" + name);
        let deck = player.children[1];
        deck.appendChild(card);
    }

    function equiping() {
        let card = qs(".selected");
        let current = card.parentNode.parentNode.children[0].children[0];
        let bonus = parseInt(card.children[3].textContent.substring(1));
        if (!qs(".selected").classList.contains("equip")) {
            
            card.classList.add("equip");
            current.textContent = bonus + parseInt(current.textContent);
            console.log(current);
        } else {
            qs(".selected").classList.remove("equip");
            current.textContent = parseInt(current.textContent) - bonus;
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
*/
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