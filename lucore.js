// Independent functions
function gID(id){// dumb wrapper for below
    return document.getElementById(id);
}

// Independent variables/constants

// Utility and/or data structure functions
var boxMuCarry = null;
function boxMuller(){
    if(boxMuCarry === null){
        let u1,u2, r, th;
        u1 = Math.random();
        u2 = Math.random();
        r = Math.sqrt(-2 * Math.log2(u1));
        th = 2 * Math.PI * u2;
        boxMuCarry = r * Math.sin(th);
        return r * Math.cos(th);
    }else{
        let bmresult = boxMuCarry;
        boxMuCarry = null;
        return bmresult;
    }
}

function rNormal(mu, sigma){
    return (sigma * boxMuller()) + mu;
}

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

function fourNeighbors(){// diagonals are just "N, then W"/etc
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
            this.shares[sName] = baseShares[sName];// copy from base object if given
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

    calcTotal(){// works for numbers, works for floats, probably doesn't work for strings.
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
        let rC = Math.random();// [0,1)
        let rA = Math.floor(rC * total);// [0, total - 1)
        for(let name of allNames){
            current += this.shares[name];// e.x. for a 1-element object, current now equals total
            if(rA <= current){
                return name;
            }
        }
        return Name;
    }
    export(){// useful for debugging, makes a copy of the object for some reason
        let result = {};
        for(let sName in this.shares){
            result[sName] = this.shares[sName];
        }
        return result;
    }
}

class GenType{// Stratum > Zone generation type
    constructor(properties){
        this.Name = properties.Name;// Simple description of Stratum/Zone type
        this.Article = properties.Article;// A/An
        this.LongDesc = properties.LongDesc;// Flavor text
        this.Height = properties.Height;// How many rows (y-coordinates) in a full Zone
        this.Width = properties.Width;// How many columns (x-coordinates) in a full Zone
        this.Ground = properties.Ground;// Ground type
        // TODO: Make Height/Width/Ground/Wall/etc be a SharesList
        this.Wall = properties.Wall;// Wall type
        this.NZones = properties.NZones;// Number of zones
    }
}
var genTypes = {
    Arena: new GenType({
        Name: "Arena",
        Article: "An",
        LongDesc: "A squarish pit with remarkably bad tactical movement options.",
        Height: 40,
        Width: 40,
        Ground: "Sand",
        Wall: "SandstoneWall",
        NZones: 1
    })
};

class TileType{
    constructor(properties){
        this.Name = properties.name;
        this.ShortDesc = properties.ShortDesc;
        this.LongDesc = properties.LongDesc;
        this.WalkGroup = properties.WalkGroup;
        this.Icon = properties.Icon;
    }
}
var tileTypes = {
    Sand: new TileType({
        Name: "Sand",
        ShortDesc: "Sand.",
        LongDesc: "Sand. Probably not good for glass, all things considered.",
        WalkGroup: "Grit",
        Icon: "."
    }),
    SandstoneWall: new TileType({
        Name: "SandstoneWall",
        ShortDesc: "Sandstone Wall.",
        LongDesc: "Sandstone wall. Almost nothing like sand except the color.",
        WalkGroup: "Opaque",
        Icon: "█"
    }),
    Door: new TileType({
        Name: "Door",
        ShortDesc: "Door.",
        LongDesc: "A doorway to another Zone.",
        WalkGroup: "Flat",
        Icon: "+"
    })
}

var descNumbers = {// the highest level to summarize
    "World": 1,// summarize worlds
    "Stratum": 2,// summarize strata
    "Zone": 3,// summarize zones
    "Player": 4,// summarize players
    "Creature": 5,// show full player stats, summarize creatures
    "Item": 6,// show full creatures, summarize each item
    "All": Infinity// show everything possible
}
// note that tiles are always summarized, but their contents can be inferred from the map
// also you can just have a tile describe itself anyway
// (tile description levels should be player/creature/item/all)


// world, stratum, zone, tile

class World{
    constructor(){
        this.strata = [];
    }
    addStratum(genType){
        let ns = new Stratum(this, genType);
        this.strata.push(ns);
        return ns;
    }
}

class Stratum{
    constructor(pWorld, genType){
        this.world = pWorld;
        this.gen = genType;
        this.zones = [];
        this.genSelf();
    }

    genSelf(){
        this.zones = [];
        let nZones = genTypes[this.gen].NZones;
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
        }
        this.zones.push(z);
    }

    getEntrance(){
        return this.zones[0];
    }
}

class Zone{
    constructor(pStrat, genType){
        this.stratum = pStrat;
        this.gen = genType;
        this.gT = genTypes[genType];
        this.genGrid();
    }
    genGrid(){
        this.grid = [];
        let genWidth = this.gT.Width;
        let genHeight = this.gT.Height;
        let wallType = this.gT.Wall;
        let groundType = this.gT.Ground;

        for(let i = 0; i < genHeight; i += 1){
            let currentRow = []
            for(let j = 0; j < genWidth; j += 1){
                let currentTile;
                if(i == 0 || i == genHeight - 1 || j == 0 || j == genWidth - 1){// create walls
                    currentTile = new Tile(this, wallType);
                }else{// create ground
                    currentTile = new Tile(this, groundType);
                }
                currentRow.push(currentTile);
            }
            this.grid.push(currentRow);
        }
    }

    linkPrev(other){
        // TODO: make it work for anything other than null
        if(other === null){
            return;
        }
    }

    getFromCoords(x, y){// ALWAYS cartesian
        return this.grid[y][x];// which is why we need to flip the coordinates
    }

    getWidth(){
        if(this.grid.length == 0){
            return 0;
        }else{
            return this.grid[0].length;
        }
    }
    getHeight(){
        return this.grid.length;
    }
    describe(descLevel){
        const ZONE_DESCL = descNumbers["Zone"];
        let descNum = descNumbers[descLevel];
        let resultList = [];

        resultList.push(`${this.gT.Article} ${this.gT.Name} zone, `,
            `${this.getWidth()} by ${this.getHeight()}`)

        if(descNum <= ZONE_DESCL){// i.e. summarize the zone
            resultList.push(".")
            return resultList.join("");
        }else{//TODO
        }
    }

    showGrid(){
        let result = [];
        for(let row of this.grid){
            for(let cell of row){
                result.push(cell.getIcon());
            }
            result.push("\n")
        }
        return result.join("");
    }

}

class Tile{
    constructor(pZone, tileType){
        this.zone = pZone;
        this.tt = tileType;
        this.items = [];
        this.creatures = [];
    }

    tileType(){
        return tileTypes[this.tt];
    }

    getIcon(){
        return this.tileType().Icon;
    }
}

// npc, player


// UI code



// testing code

var globals = {}

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

function uniformTest(){
    var trials = [];
    function calcMu(ts){
        let current = 0;
        let count = ts.length;
        for(let t of ts){
            current += t;
        }
        return current / count;
    }
    function calcSigma(ts){
        let mu = calcMu(ts);
        let denom = ts.length - 1;
        let total = 0;
        for(let t of ts){
            total += Math.abs(mu - t);
        }
        return total/denom;
    }

    var targetMean = 0;
    var targetStdev = 1;

    function runTrial(){
        let iM = gID("iMean").value;
        let iS = gID("iStdev").value;
        if(iM != targetMean || iS != targetStdev){
            trials = [];
            targetMean = iM;
            targetStdev = iS;
        }
        return trials.push(rNormal(targetMean, targetStdev));
    }
    gID("output").innerHTML = "<div id='trialDiv'></div><table id='muSigma'></table>"
    gID("trialDiv").className = "floatList";

    gID("muSigma").innerHTML = ["<tr><th id='totalRuns'>Total</th><th>Target</th><th>Sample</th></tr>",
        "<tr><td>Mean</td><td id='tMean'></td><td id='sMean'></td></tr>",
        "<tr><td>Standard deviation</td><td id='tSigma'></td><td id='sSigma'></td></tr>"].join("")
    gID("muSigma").className = "allLinesTable";

    function updateOutput(){
        let trialBuilder = [];
        for(let t of trials){
            trialBuilder.push(t.toString());
        }
        gID("trialDiv").innerHTML = trialBuilder.join("<br />");

        gID("totalRuns").innerHTML = `Total: ${trials.length}`;

        gID("tMean").innerHTML = targetMean.toString();
        gID("tSigma").innerHTML = targetStdev.toString();
        
        gID("sMean").innerHTML = calcMu(trials).toString();
        gID("sSigma").innerHTML = calcSigma(trials).toString();
    }

    gID("input").innerHTML = ["<p><button id=rTButton>Run more tests</button></p>",
        "<p>Note: changing mean or standard deviation will erase existing trial data</p>",
        "<p>Mean: <input type='number' value=0 id='iMean'></input></p>",
        "<p>Standard deviation: <input type='number' value=1 id='iStdev'></input></p>"].join("");
    
    gID("rTButton").onclick = function(){
        for(let i = 0; i < 1000; i += 1){
            runTrial();
        }
        updateOutput();
    }

    gID("rTButton").onclick();
}

function simpleWorldTest(){
    var w = globals.w = new World();
    var s = globals.s = w.addStratum("Arena");
    var z = globals.z = s.getEntrance();
    console.log(z);

    gID("input").innerHTML = "<button id=dZButton>Describe zone</button>";
    gID("input").innerHTML += "<button id=gridButton>Show grid of zone</button>";

    gID("dZButton").onclick = function(){
        let described = z.describe("Zone");
        gID("output").innerHTML = `<pre>${described}`;
    }
    gID("gridButton").onclick = function(){
        let grid = z.showGrid();
        gID("output").innerHTML = `<div class="zmContainer"><pre class="zoneMap">${grid}</pre></div>`;
    }

    gID("gridButton").onclick();
}

// actual main hook
simpleWorldTest();