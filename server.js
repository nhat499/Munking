
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

function rand(limit) {
    return Math.floor(Math.random() * limit) // 0 to (limit - 1)
}





// run when client connect
io.on("connection", socket => {


    // emit to single client
    socket.emit("newConnection", ["welcome to munking: " + socket.id]);

    // emit to everybody except the user
    //socket.broadcast.emit()

    // to everybody
    // io.emit()

    // to a specific client
    //socket.id and use io.sockets.socket(savedSocketId).emit(...)

    // test to see if u can send array
    

    //run when client disconet
    socket.on("disconnect", () => {
        io.emit("message", "a user have left");
    });

    // listen for new player to join the game
    socket.on("joinGame", (player) => {
        // update other player that new player has join
        io.emit("addnewPlayer", player);
        
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

        // listen for when player goes on an adventure
        
        socket.on("goOnAdventure", (playerInfo) => {
            let cardInfo = ["monster", monster[rand(5)], rand(20)];
            playerInfo[8] = cardInfo;
            io.emit("someOneWentonAdventure", playerInfo);

            socket.emit("btnEnable", "unhidden fight button");
        });

        //listen for when there are no battles
        socket.on("hideBattleFrame", () => {
            io.emit("everyonehideBattleFrame");
        })

    });
})

server.listen(PORT, () => {
   console.log("sever running on " + PORT)
});
