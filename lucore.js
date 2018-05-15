// Independent functions
function gID(id){// dumb wrapper for below
    return document.getElementById(id);
}

// Independent variables

function addOffsets(...offsets){// used to translate directions into relative coordinates
    let total = {x: 0, y: 0}
    for(offsObj of offsets){
        total.x += offsObj.x;
        total.y += offsObj.y;
    }
    return total;
}

const offsets = {// useful for compounding
    N: {x: 0, y: -1},
    S: {x: 0, y: 1},
    E: {x: 1, y: 0},
    W: {x: -1, y: 0},
    "": {x: 0, y: 0}
}

function decodeOffset(offsStr){
    return addOffsets(...offsStr);// spread syntax
    // shouldn't be used for movement
    // works for 4-neighbor and 8-neighbor.
}

function eightNeighbors(){// diagonals are a cost of 1
    var o2n = [
        "NW", "N", "NE", "W", "E", "SW", "S", "SE"// "ah, yes, the eight genders"
    ]
    let result = {};
    for(o of o2n){
        result[o] = decode_offset(o);
    };
    return result;
}

function fourNeighbors(){// diagonals are just N + W/etc
    var o2n = ["N", "S", "E", "W"]
    let result = {};
    for(o of o2n){
        result[o] = decode_offset(o);
    };
    return result;
}

// custom data structures

class SharesList{// used for weighting choices efficiently
    constructor(baseShares){
        this.shares = {}
        for(let sName in baseShares){
            this.shares[sName] = baseShares[sName];
        }
    }
    addShare(sName, sWeight){
        if(Object.keys(this.shares).includes(sName)){
            throw new Error("Tried to update share that already exists (use updateShare instead)");
        }else{
            this.shares[sName] = sWeight;
            return sWeight;
        }
        return null;
    }
    updateShare(sName, sWeight){
        if(Object.text(this.shares).includes(sName)){
            this.shares[sName] = sWeight;
            return sWeight;
        }else{
            throw new Error("Tried to update nonexistent share (use addShare instead)");
        }
        return null;
    }

    calcTotal(){
        let total = 0;
        for(let sName in this.shares){
            total += this.shares[sName];
        }
        return total;
    }
    getOne(){
        let allNames = Object.keys(this.shares);
        let total = this.calcTotal();
        let current = 0;
        let rC = Math.random();
        let rA = Math.floor(rC * total);
        for(let name of allNames){
            current += this.shares[name];
            if(rA <= current){
                return name;
            }
        }
        return Name;
    }
    export(){
        let result = {};
        for(let sName in this.shares){
            result[sName] = this.shares[sName];
        }
        return result;
    }
}

class GenType{
    constructor(properties){
        this.Name = properties.Name;
        this.Height = properties.Height;
        this.Width = properties.Width;
        this.Ground = properties.Ground;
        this.Wall = properties.Wall;
        this.nZones = properties.nZones;
    }
}
var genTypes = {
    Arena: new GenType({
        Height: 24,
        Width: 80,
        Ground: "Sand",
        Wall: "SandstoneWall",
        nZones: 1
    })
};

class TileType{
    constructor(properties){
        this.name = properties.name;
        this.walkable = properties.walkable;
    }
}
var tileTypes = {
    Sand: new TileType({
        name: "Sand",
        shortDesc: "Sand",
        longDesc: "Sand. Probably not good for glass, all things considered.",
        walkGroup: "Grit"
    }),
    SandstoneWall: new TileType({
        name: "SandstoneWall",
        shortDesc: "Sandstone Wall",
        longDesc: "Sandstone wall. Almost nothing like sand except the color.",
        walkGroup: "Opaque"
    })
}


// world, stratum, zone, tile

class World{
    constructor(){
        this.strata = [];
    }
    addStratum(genType){
        let ns = new Stratum(this, genType);
        this.strata.push(ns);
    }
}

class Stratum{
    constructor(pWorld, genType){
        this.world = pWorld;
        this.gen = genType;
        this.zones = [];
        this.firstGen();
    }

    firstGen(){
        let nZones = genTypes[this.gen].nZones;
        for(let i = 0; i < nZones; i += 1){
            this.addZone();
        }
    }

    addZone(){
        let z = new Zone(this, this.gen);
        if(this.zones.length == 0){
            z.linkPrev(null);
        }else{
            let last = this.zones.slice(-1)[0];
            z.linkPrev(last);
            last.linkNext(z);
            z.prime();
        }
    }
}

class Zone{
    constructor(pStrat, genType){
        this.stratum = pStrat;
        this.gen = genType;
        this.genGrid();
    }
    genGrid(){
        let gT = genTypes[this.gen];
        this.grid = [];
        let genWidth = gT.Width;
        let genHeight = gT.Height;
        let wallType = gT.Wall;
        let groundType = gT.Ground;

        for(let i = 0; i < genHeight; i += 1){
            let currentRow = []
            for(let j = 0; j < genWidth; j += 1){
                let currentTile;
                if(i == 0 || i == genHeight - 1 || j == 0 || j == genWidth - 1){// create walls
                    currentTile = new Tile(this, wallType);
                }else{// create ground
                    currentTile = new Tile(this.groundType);
                }
                currentRow.push(currentTile);
            }
            this.grid.push(currentRow);
        }
    }

    getFromCoords(x, y){// ALWAYS cartesian
        return this.grid[x][y];
    }

}

class Tile{
    constructor(pZone, tileType){
        this.zone = pZone;
        this.tt = tileType;
        this.newGen();
    }
    newGen(){

    }
}

// npc, player


// UI code



// testing code

function sharesListTests(){
    gID("input").innerHTML += "<button id='testb'>Run test</button>";

    gID("output").innerHTML += "<h2>X Results:</h2><span id='xresults'></span>";
    gID("xresults").innerHTML = "<table id=xrtab></table>";
    function xrtUpdate(r){
        let tableBuilder = ["<tr><th>Name</th><th>Count</th></tr>"]
        for(let key in r){
            tableBuilder.push(
                `<tr><td>${key}</td><td>${r[key]}</td>`
            )
        }
        gID("xrtab").innerHTML = tableBuilder.join("");
    }

    var x = new SharesList(
        {a: 10, b: 20}
    );
    x.addShare("c", 10);
    console.log(x.export());
    console.log(x.calcTotal());

    let results = {
        a: 0,
        b: 0,
        c: 0,
        total: 0
    };
    xrtUpdate(results);

    gID("testb").onclick = function(){

        for(let i = 0; i < 100000; i += 1){
            results.total += 1;
            results[x.getOne()] += 1;
        }
        xrtUpdate(results);
    }
}

function simpleWorldTest(){
    var w = new World();
    var s = w.addStratum("Arena");
    var z = s.addZone();
    console.log(z.getFromCoords(0,0));

    gID("input").innerHTML = "<button id=dZButton>Describe zone</button>";
    gID("dZButton").onclick = function(){
        let described = z.describe("Tile");
        gID("output").innerHTML = `<pre>${described}`;
    }
}

simpleWorldTest();