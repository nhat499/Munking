
// update heroku
// git add .
// git commit -m "asdsa"
// git push heroku
// heroku open

const express = require('express');
const app = express();
const path = require("path")
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);


const PORT = process.env.PORT || 3000;

// set static folder
app.use(express.static(path.join(__dirname, "public")));


let equipsTypes = ["helm", "armor", "weapon", "belt", "medal"];
let equipsVariety = ["ninja", "samurai", "knight", "paladin", "pirate"];

let curseOrBuff = [1,3,5,10,15];

let monster = ["dragon", "golem", "giant", "slim", "ogre"];

// special card -- immplement later

let numOfPlayer = 0;

function rand(limit) {
    return Math.floor(Math.random() * limit) // 0 to (limit - 1)
}


let currentPlayerInGame = [];
// [[name, socket.id, lv], [...]]

function indexOfCurrentPlayer(playerID) {
    for (let i = 0; i < currentPlayerInGame.length; i++) {
        if (currentPlayerInGame[i][1] == playerID) {
            return i;
        }
    }
    return -1;
}

function remove(index) {
    let firstPart = currentPlayerInGame.slice(0, index);
    let secondPart = currentPlayerInGame.slice(index+1);
    currentPlayerInGame = firstPart.concat(secondPart);
}

// run when client connect
io.on("connection", socket => {
    numOfPlayer++;
    currentPlayerInGame.push(["blankName", socket.id, 0]);

    // socket.off("connection", () => {
    //         console.log("a user join after the game started");
    //     }
    // );

    // emit to single client
    // socket.emit()
    io.emit("updateNumberOfPlayer", numOfPlayer);
       
    // emit to everybody except the user
    //socket.broadcast.emit()

    // to everybody
    // io.emit()
// testing
    // to a specific client
    // io.to(socketid).emit('message', 'for your eyes only');

    // test to see if u can send array
    
    //run when client disconet
    socket.on("disconnect", () => {
        let indexOfPlayer = indexOfCurrentPlayer(socket.id);
        socket.broadcast.emit("removePlayer", currentPlayerInGame[indexOfPlayer]);
        numOfPlayer--;
        io.emit("updateNumberOfPlayer", numOfPlayer);
        remove(indexOfPlayer);
    });



    // listen for new player to join the game
    socket.on("joinGame", (player) => {
        console.log(player);
        currentPlayerInGame[indexOfCurrentPlayer(player[1])] = player;
        socket.broadcast.emit("addnewPlayer", player);
        // [[name, socket.id, lv], [...]]
        socket.emit("addPreviousPlayer", currentPlayerInGame); 
        
        // create random hand
        // 0,1,2 equips card
        // 3,4, curseAndBuff card
        // 5,6, monster card
        // 7 special card -> for later

        let playerHand = [];
        for (let i = 0; i < 7; i++) {
            let randomNumber = rand(5); // 0 to 4
            if (i < 3) {
                let equipsVarietNum = rand(5);
                playerHand[i] =  equipsVariety[equipsVarietNum] + 
                    " " + equipsTypes[randomNumber];
                    // same card for testing
                // playerHand[i] = equipsVariety[1] + " " +
                // equipsTypes[1];

            } else if (i < 5) {
                playerHand[i] = curseOrBuff[randomNumber];
            } else {
                playerHand[i] = monster[randomNumber];
            } // special card ->  
        }
        socket.emit("randomCard", playerHand);     
    });

    // listen for when player goes on an adventure
    socket.on("goOnAdventure", (playerInfo) => {
        let monsterLv = rand(20);
        let playerLv = currentPlayerInGame[indexOfCurrentPlayer(playerInfo[1])][2];
        if (playerLv >= 5) {
            monsterLv += 20;
        }
        if (playerLv >= 8) {
             monsterLv += 100;
        }
        let cardInfo = ["monster", monster[rand(5)], "lv. " + monsterLv];
        playerInfo[0][8] = cardInfo;
        io.emit("someOneWentonAdventure", playerInfo[0]);
    
            socket.emit("btnEnable", "unhidden fight button");
    });

    //listen for when a player is in battle
    socket.on("inBattle", () => {
        let inbattle = true;
        io.emit("updateBattleStatus", inbattle);
    });

    //listen for when a player leaves battle
    socket.on("leaveBattle", () => {
        let inbattle = false;
        io.emit("updateBattleStatus", inbattle);
    });    

    // listen for when player update equips on an adventure
    socket.on("equipInbattle", (playerInfo) => {
        io.emit("updatePlayerInfo", playerInfo);
    });

    //listen for when there are no battles
    socket.on("hideBattleFrame", () => {
        io.emit("everyonehideBattleFrame");
    })

    //listen for battle result
    socket.on("battleResult", (defeatePerson) => {
        io.emit("updateBattle", defeatePerson);
    });

        // listen for level changes
    socket.on("newLevel", (playerInfo) => {
        let playerIndex = indexOfCurrentPlayer(playerInfo[1]);
        currentPlayerInGame[playerIndex][2] += playerInfo[2];
        io.emit("updateNewLevel", playerInfo);
    });

    //listen for buffs
    socket.on("buffing", buffingInfo => {
        io.emit("buffup", buffingInfo);
    });

    //list for treasure request, create and send treasure
    socket.on("getTreasure", monsterLv => {
        let numberOfTreasure = (Math.ceil(parseInt(monsterLv) / 7) + 1);
            
        let allTreausreCard = [];
        for (let i = 0; i < numberOfTreasure; i++) {
            if (rand(2) == 1) { // get curse
                let curseCard = ["CurseOrBuff", curseOrBuff[rand(5)]];
                allTreausreCard[i] = curseCard;
            } else { // get equips
                let equipsCard = ["Equips", equipsVariety[rand(5)] + " " + 
                equipsTypes[rand(5)]];
                allTreausreCard[i] = equipsCard;
            }
        }
        io.emit("showBossDrop", allTreausreCard);
        socket.emit("getBossDrop", allTreausreCard);
    });

    // listen when a player want to send another player a card
    socket.on("sendCard", (giftInfo) => {
        //gift info = [socketid, typeofcard, nameofcard, description];
        //send to giftInfo[0];  
        io.to(giftInfo[0]).emit('getGift', giftInfo);
    });

});

server.listen(PORT, () => {
   console.log("sever running on " + PORT)
});
