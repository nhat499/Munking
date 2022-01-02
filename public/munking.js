"use Strict";

//const { message } = require("statuses");


(function() {
    window.addEventListener("load", init);
    const socket = io();


    socket.on("newConnection", numOfPlayer => {
        updateNumberOfPlayer(numOfPlayer);
    });

    socket.on("removePlayer", id => {
        removePlayer(id);
    })

    socket.on("addnewPlayer", playerName => {
        addnewPlayer(playerName);
    });

    socket.on("addPreviousPlayer", currentPlayer => {
        addPreviousPlayer(currentPlayer);
    });

    socket.on("someOneWentonAdventure", (playerInfo)=> {
        goOnAdventure(playerInfo);
    })

    socket.on("btnEnable", () => {
        qs("#fightBtn").classList.remove("hidden");
        // for testing purposes
        //qs("#runBtn").classList.remove("hidden");
    })

    socket.on("everyonehideBattleFrame", () => {
        qs(".battleFrame").classList.add("hidden");
        qs("#deckTreasure").classList.remove("invisiable");
    })

    socket.on("updateBattle", (defeatePerson) => {
        updateBattle(defeatePerson);
    });

    socket.on("updateNewLevel", (playerInfo) => {
        updateNewLevel(playerInfo);
    });

    socket.on("updatePlayerInfo", (playerInfo) => {
        updatePlayerInfoWOBuff(playerInfo);
    })

    // buffinginfo [whoSendBuff, howMuch]
    socket.on("buffup", buffingInfo => {
        displayBuff(buffingInfo);
    });

    // show boss drop to everyone
    socket.on("showBossDrop", allTreasureCard => {
        showBossDrop(allTreasureCard);
    });

    // getbossDrop
    socket.on("getBossDrop", allTreasureCard => {
        getBossDrop(allTreasureCard);
    });
    
    // get gift from another player
    socket.on("getGift", (giftInfo) => {
        getGift(giftInfo);
    });

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
        let inBattle = false;
        let imInbattle = false;

        const PlayerjoinGameBtn =  qs("#PlayerjoinGameBtn");
        PlayerjoinGameBtn.addEventListener("click", () => {
            joinGame();
        });

        // going on adventure
        const adventureCard = qs("#adventure");
        adventureCard.addEventListener("click", () => {
            //inBattle = true;
            imInbattle = true;

            socket.emit("inBattle");

            sendGoOnAdventureInfo();
        });

        // update battle status if anyone is in battle
        socket.on("updateBattleStatus", (battleStatus) => {
            inBattle = battleStatus;
        });

        //discard btn 
        qs("#discardBtn").addEventListener("click", discardBtn);

        //equip btn
        qs("#equipBtn").addEventListener("click", () => {
            equips(imInbattle);
        });

        // use btn
        qs("#useBtn").addEventListener("click", useBtnPressed);
    
        //buffBtn
        qs("#buffBtn").addEventListener("click", () =>  {
            if (!inBattle) {
                notInBattle();
            } else {
                let buffAmout = battleBuff(inBattle);
                sendBuff(buffAmout);
            }
        });

        //debuffBtn
        qs("#debuffBtn").addEventListener("click", () =>  {
            if (!inBattle) {
                notInBattle();
            } else {
                let buffAmout = battleBuff(inBattle) * -1;
                sendBuff(buffAmout);
            }
        });

        //fight button
        qs("#fightBtn").addEventListener("click", () => {
            fight();
            imInbattle = false;
        });

        //run button
        qs("#runBtn").addEventListener("click", () => {
            runClicked();
            imInbattle = false;
        });
        
        // closebtn for loot frame
        qs("closeBtn").addEventListener("click", () => {
            qs(".lootFrame").classList.add("hidden");
            qs("#lootContainer").innerHTML = "";
        });

        // sendto... btn
        qs("#sendToBtn").addEventListener("click", () => {
            qs("sendToContainer").classList.remove("hidden");
        });

        //
        qs("#sendBtn").addEventListener("click", sendCardToServer);

        // cancel send btn
        qs("#cancelSendBtn").addEventListener("click", cancel);
    }

    function addPreviousPlayer(currentPlayer) {
        for (let i = 0; i < currentPlayer.length; i++) {
            addnewPlayer(currentPlayer[i]);
        }
    }

    function removePlayer(id) {
        let player = qs("#"+id).parentElement;
        let playerName = player.children[1].textContent;
        player.remove();
        let allPlayer = qsa(".playerIconOnBoard");
        for (let i = 0; i < allPlayer.length; i++) {
            if (allPlayer[i].textContent = playerName) {
                allPlayer[i].remove();
                return;
            }
        }
    }

    function updateNumberOfPlayer(numOFPlayer) {
        qs("#PlayerjoinGameBtn").classList.remove("hidden");
        qs(".WaitForHost").classList.remove("hidden");
        let currentPlayer = qs("#currentPlayer");
        currentPlayer.textContent = "Number Of Player Connected: " + numOFPlayer;
    }

    function getGift(giftInfo) {
        alert("you got a gift");
        let newCard = createCard();
        let cardInfo = newCard.children[0].children;
        for (let i = 0; i < cardInfo.length; i++) {
            cardInfo[i].textContent = giftInfo[i+1];
        }
        if (cardInfo[0].textContent == "CurseOrBuff") {
            newCard.children[0].classList.add("CurseOrBuff");
        }
        qs("#thePlayerhand").appendChild(newCard);
    }

    function sendCardToServer() {
        let card = qs(".selectedCard");
        let cardInfo = card.children[0].children;
        let perToSendTo = qs(".selectedIcon").firstChild.id;
        let giftInfo = [perToSendTo,cardInfo[0].textContent,
        cardInfo[1].textContent, cardInfo[2].textContent];
        socket.emit("sendCard", giftInfo);
        btnInvisiable();
        card.remove();
        qs("sendtocontainer").classList.add("hidden");
    }

    function showBossDrop(allTreasureCard) {
        let loopConatiner = qs("#lootContainer");
        let loopFrame = qs(".lootFrame");
        let allCard = createTreasureCard(allTreasureCard);
        for (let i = 0; i< allTreasureCard.length; i++) {
            loopConatiner.appendChild(allCard[i]);
        }
        setTimeout(() => {
            loopFrame.classList.remove("hidden");
        }, 1500);
    }

    function getBossDrop(allTreasureCard) {
        let allCard = createTreasureCard(allTreasureCard);
        let playerHand = qs("#thePlayerhand");
        for (let i = 0; i< allTreasureCard.length; i++) {
            playerHand.appendChild(allCard[i]);
        }
    }

    function createTreasureCard(allTreasureCard) {
        let allCard = [allTreasureCard.length];
        for (let i = 0; i < allTreasureCard.length; i++) {
            let newCard = createCard();
            let cardinfo = newCard.children[0];
            if (allTreasureCard[i][0] == "CurseOrBuff") {
                cardinfo.children[0].textContent = "CurseOrBuff";
                cardinfo.children[1].textContent = allTreasureCard[i][1];
                newCard.children[0].classList.add("CurseOrBuff");
            } else if (allTreasureCard[i][0] == "Equips") {
                cardinfo.children[0].textContent = "Equips";
                cardinfo.children[1].textContent = allTreasureCard[i][1];
                cardinfo.children[2].textContent = "+3";
            }
            allCard[i] = newCard;
        }
        return allCard;
    }

    function displayBuff(buffinginfo) {
        let theOtherPlayBuff = qs("#theOtherPlayerIcon > #battleBuff");
        let newBuff = parseInt(theOtherPlayBuff.textContent.slice(4)) + buffinginfo[1];
        if (newBuff < 0) {
            theOtherPlayBuff.textContent = "buff " + newBuff;
        } else {
            theOtherPlayBuff.textContent = "buff +" + newBuff;
        }
        // show who send the buff/debuff
        updateOtherPlayerAttack();
    }

    function updateOtherPlayerAttack() {
        let theOtherPlayerIcon = qs("#theOtherPlayerIcon").children;
        let attack = 0;
        for (let i = 0; i < 5; i++) {
            attack += parseInt(theOtherPlayerIcon[i].textContent.split(" ")[2]);
    
        }
        attack += parseInt(theOtherPlayerIcon[5].textContent.split(" ")[1]);
        qs("#otherAttack").textContent = "attack = " + attack;
    }

    function useBtnPressed() {
        let useFrame = qs("useFrame");
        useFrame.classList.remove("hidden");
        qs("#cancelBtn").addEventListener("click", ()=> {
            useFrame.classList.add("hidden");
        });
    }

    function sendBuff(buffAmout) {
        let playerName = qs("#playerName").textContent;
        qs("useframe").classList.add("hidden");
        qs(".selectedCard").remove();
        btnInvisiable();
        socket.emit("buffing", [playerName, buffAmout]);
    }



    function battleBuff() {
        let selectBuff = qs(".selectedCard").firstChild.children[1];
        return parseInt(selectBuff.textContent);
    }

    function notInBattle() {
        let useFrameMessage = qs("useFrameMessage");
        useFrameMessage.classList.remove("hidden");
        setTimeout(() => {
        useFrameMessage.classList.add("hidden");
        }, 1500)
    }

    function fight() {
        let attack = qs("#otherAttack").textContent.split(" ")[2];
        let monsterAttack = qs(".battleFrame .description").textContent.slice(3);
        let monsterName =  qs(".battleFrame .nameOfCard").textContent;
        let playerName = qs(".battleFrame #otherPlayerName").textContent;
        if (parseInt(attack) > parseInt(monsterAttack)) {
            sendbattle(monsterName);
            sendLevel(playerName, 1); // level up one
            socket.emit("getTreasure", monsterAttack);
        } else {
            sendbattle(playerName);
            sendLevel(playerName, -1);
        }
        disableButton(); ///////
        socket.emit("leaveBattle");
    }

    function sendbattle(defeatePerson) {
        socket.emit("battleResult", defeatePerson);
    }

    function sendLevel(playerName, levelAdded) {
        socket.emit("newLevel", [playerName, socket.id, levelAdded]);
    }

    function updateBattle(defeatePerson) {
        qs(".battleFrame").classList.add("hidden");
        let battleResult = qs(".battleResult");
        battleResult.classList.remove("hidden");
        battleResult.textContent = defeatePerson + " has been defeated";
        setTimeout(() => {
            battleResult.classList.add("hidden");
            qs("#deckTreasure").classList.remove("invisiable");
            
        }, 1500)
    }
    
    function updateNewLevel(playerInfo) {
        let allPlayerIcon = qsa(".playerIconOnBoard");
        let i = 0;
        while (playerInfo[0] != allPlayerIcon[i].textContent) {
            i++;
        }
        let currentLv = allPlayerIcon[i].parentElement.parentElement.
            children[0].textContent.slice(3);
        let newLevel = playerInfo[2] + parseInt(currentLv);
        if (newLevel >= 0) {
            let newLvBox = document.getElementById(newLevel).children[1];
            newLvBox.appendChild(allPlayerIcon[i]);
        }

    }

    function equips(imInBattle) {
        let cardWrapper = qs(".selectedCard");
        let nameOfCard = cardWrapper.firstChild.children[1].textContent;
        let nameOfCardArray = nameOfCard.split(" ");
        let addition = cardWrapper.firstChild.children[2].textContent;
        let currentEquip = qs("#"+nameOfCardArray[1])
        let currentEquipArray = currentEquip.textContent.split(" ");
        if (currentEquipArray[0] == nameOfCardArray[0]) {
            let newBonus = parseInt(addition.slice(1)) + 
                parseInt(currentEquipArray[2].slice(1));
            currentEquip.textContent = nameOfCard + " +"+ newBonus

        } else {
            currentEquip.textContent = nameOfCard + " " + addition;
        }
        updateAttack();
        if (imInBattle) {
            socket.emit("equipInbattle", getPlayerInfo()); /////////////////////////
        }

        btnInvisiable();
        discardBtn();
    }

    function updateAttack() {
        let thePlayerIcon = qs("#thePlayerIcon").children;
        let attack = 0;
        for (let i = 0; i < 5; i++) {
            attack += parseInt(thePlayerIcon[i].textContent.split(" ")[2]);
            
        }
        attack += parseInt(thePlayerIcon[5].textContent.split(" ")[1]);
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
        socket.emit("leaveBattle");
        disableButton();
        socket.emit("hideBattleFrame");
    }

    function goOnAdventure(playerInfo) {
        socket.emit("inBattle");
        qs(".battleFrame").classList.remove("hidden");
        qs("#deckTreasure").classList.add("invisiable");

        updatePlayerInfo(playerInfo);
        let monsterCard = qs(".battleFrame .card");

        let monsterCardInfo = playerInfo[playerInfo.length-1];
        for (let j = 0; j < 3; j++) {
            monsterCard.children[j].textContent = monsterCardInfo[j];
        }
        

    }

    function updatePlayerInfo(playerInfo) {
        let otherPlayIcon = qs("#theOtherPlayerIcon");
        let i;
        for (i = 0; i< otherPlayIcon.children.length; i++) {
            otherPlayIcon.children[i].textContent = playerInfo[i];
        }
        qs("#otherPlayerName").textContent =playerInfo[i]; 
        qs("#otherAttack").textContent=playerInfo[i+1]; 
    }

    function updatePlayerInfoWOBuff(playerInfo) {
        let otherPlayIcon = qs("#theOtherPlayerIcon");
        let i;
        for (i = 0; i< otherPlayIcon.children.length -1; i++) {
            otherPlayIcon.children[i].textContent = playerInfo[i];
        }
        qs("#otherPlayerName").textContent =playerInfo[i+1]; 
        updateOtherPlayerAttack();
    }

    function sendGoOnAdventureInfo() {
        let playerInfo = getPlayerInfo();           
        socket.emit("goOnAdventure", [playerInfo, socket.id]);
    }

    function getPlayerInfo() {                        
        let thePlayerIcon = qs("#thePlayerIcon");
        let length = thePlayerIcon.children.length;
        let playerInfo = [];
        let i;
        for (i = 0; i < length; i++) {
            playerInfo[i] = thePlayerIcon.children[i].textContent;
        }
        playerInfo[i] = qs("#playerName").textContent;
        playerInfo[i+1] = qs("#attack").textContent;

        return playerInfo;
    }

    function joinGame() {

        // switch from join game screen to play screen
        qs("main").classList.remove("hidden");
        qs(".joinGame").classList.add("hidden");

        // update current player name
        const name = document.getElementById("PlayerCreateName").value;
        qs("#playerName").textContent = name;

        // update other player that a new player join
        socket.emit("joinGame", [name, socket.id, 0]);

        // generate cards for current player
        socket.on("randomCard", cardArray => {
            getCardsToCurrentPlayerHand(cardArray);
        });
    }

    // upload random card to the currect player's hand
    function getCardsToCurrentPlayerHand(cardArray) {
        let thePlayerhand = qs("#thePlayerhand");
        for (let i = 0; i < 5; i++) {
            let card = createCard();
            let cardInfo = card.firstChild.childNodes;
            if (i < 3) {
                cardInfo[0].textContent = "Equips";
                cardInfo[1].textContent = cardArray[i];
                cardInfo[2].textContent = "+3";
            } else if (i < 5) {
                cardInfo[0].textContent = "CurseOrBuff";
                cardInfo[1].textContent = cardArray[i];
                card.children[0].classList.add("CurseOrBuff");
            } else {
                // cardInfo[0].textContent = "Monster";
                // cardInfo[1].textContent = cardArray[i];
                // let lv = Math.floor(Math.random() * 20);
                // cardInfo[2].textContent = "lv. " + lv;
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
        otherPlayerIcon.id = playerName[1];
        otherPlayerIcon.textContent = 0;
        let name = document.createElement("h3");
        name.textContent = playerName[0];

        let newIconOnBoard = document.createElement("div");
        newIconOnBoard.classList.add("playerIconOnBoard");
        newIconOnBoard.textContent = playerName[0];
        let iconcontainer = document.getElementById(playerName[2]).children[1];
        iconcontainer.appendChild(newIconOnBoard);
        otherPlayer.appendChild(otherPlayerIcon);
        otherPlayer.appendChild(name);

        let otherplayerClone = otherPlayer.cloneNode(true);
        otherplayerClone.addEventListener("click", selectIcon);
        qs("sendTo").appendChild(otherplayerClone);
        qs("#playerIconContainer").appendChild(otherPlayer);
    }

    function selectIcon() {
        let allSelectedIcon = qsa(".selectedIcon");
        let sendBtn = qs("#sendBtn");
        if (this.classList.contains("selectedIcon")) {
            this.classList.remove("selectedIcon");
            sendBtn.classList.add("invisiable");
        } else {
            for (let i = 0; i < allSelectedIcon.length; i++) {
                allSelectedIcon[0].classList.remove("selectedIcon");
            }
            this.classList.add("selectedIcon");
            sendBtn.classList.remove("invisiable");
        }
    }

    function cancel() {
        qs("#sendBtn").classList.add("invisiable");
        qs(".selectedIcon").classList.remove("selectedIcon");
        qs("sendtocontainer").classList.add("hidden");
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