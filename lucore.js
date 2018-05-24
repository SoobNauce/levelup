// Independent functions
function gID(id){// dumb wrapper for below
    return document.getElementById(id);
};

function clearElement(element){
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    };
};

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
    constructor(properties){// Constructor requires all of these to be defined
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
        this.Name = properties.Name;// Very short description
        // "A tile ($Name)."
        this.LongDesc = properties.LongDesc;// Flavor text
        this.WalkGroup = properties.WalkGroup;// used for calculating movement cost
        // also used as a surrogate for VisionGroup
        // TODO: override VisionGroup for things like solid glass
        this.Icon = properties.Icon;// one-character display
    }
}
var tileTypes = {
    Sand: new TileType({
        Name: "Sand",
        LongDesc: "Sand. Probably not good for glass, all things considered.",
        WalkGroup: "Grit",
        Icon: "."
    }),
    SandstoneWall: new TileType({
        Name: "SandstoneWall",
        LongDesc: "Sandstone wall. Almost nothing like sand except the color.",
        WalkGroup: "Opaque",
        Icon: "█"
    }),
    Door: new TileType({
        Name: "Door",
        LongDesc: "A doorway to another Zone.",
        WalkGroup: "Flat",
        Icon: "+"
    })
}

const statsNames = ["Strength", "Constitution", "Dexterity",
    "Intelligence", "Wisdom", "Charisma", "HP", "MP", "Speed"];

class CreatureRace{
    constructor(p){
        this.Name = p.Name;
        this.BaseXP = p.BaseXP;
        this.LongDesc = p.LongDesc;
        let pbs = p.BaseStats;

        this.BaseStats = {};
        for(let name of statsNames){
            this.BaseStats[name] = pbs[name];
        };

        this.Icon = p.Icon;
    }
    exportStats(){
        let result = {};
        for(let name of statsNames){
            result[name] = this.BaseStats[name];
        }
        return result;
    }
}

var creatureRaces = {
    Rat: new CreatureRace({
        Name: "Rat",
        LongDesc: "Small, furry, skittish.",
        BaseStats: {
            Strength: 4,
            Constitution: 3,
            Dexterity: 8,
            Intelligence: 3,
            Wisdom: 4,
            Charisma: 5,
            HP: 3,
            MP: 10,
            Speed: 15},
        Icon: "r",
        BaseXP: 1
    }),
    Human: new CreatureRace({
        Name: "Human",
        LongDesc: "The standard by which everyone else is judged.",
        BaseStats: {
            Strength: 10,
            Constitution: 10,
            Dexterity: 10,
            Intelligence: 10,
            Wisdom: 10,
            Charisma: 10,
            HP: 10,
            MP: 10,
            Speed: 10},
        Icon: "Y",
        BaseXP: 1
    })
}
class CreatureJob{
    constructor(properties){
        let p = properties;
        this.Name = p.Name;
        this.XPMulti = p.XPMulti;
        this.LongDesc = p.LongDesc;
        this.StatMulti = {};
        for(let name of statsNames){
            if(Object.keys(p.StatMulti).includes(name)){
                this.StatMulti[name] = p.StatMulti[name];
            }else{
                this.StatMulti[name] = 1;
            }
        }
    }
    exportMultis(){
        result = {}
        for(let name of statsNames){
            result[name] = this.StatMulti[name];
        }
        return result;
    }
}

var creatureJobs = {
    Freelancer: new CreatureJob({
        Name: "Freelancer",
        LongDesc: "No job. Nothing interesting.",
        StatMulti: {},
        XPMulti: 1
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
    newPlayer(playerName){
        let p = new Player();

        return p;
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

// creatures

class Creature{
    constructor(race, job="Freelancer"){
        this.level = 0;
        this.xp = 0;

        this.race = race;
        let baseRace = creatureRaces[race];
        this.name = baseRace.randomName();

        this.job = job;
        let baseJob = creatureJobs[job];
        let jMultis = baseJob.exportMultis();
        this.title = baseJob.randomTitle(0);

        this.stats = baseRace.exportStats();
        for(let name of statsNames){
            this.stats[name] *= 10;// everyone gets 10x stats for free
            this.stats[name] *= jMultis[name];// stats are then scaled based on job
        }
        this.levelUp();
    }
    levelUp(){
        let baseRace = creatureRaces[this.race];
        let baseJob = creatureJobs[this.job];
        
        for(let name of statsNames){
        }
    }
}

class Player extends Creature{
    constructor(name, race="Human", job="Freelancer"){
        super(race, job);
        this.name = name;
    }
}

// explicit globals invocation
var globals = {};

// UI code

function buildUI(){
    // Populate input panel
    let el = {
        input: gID("input"),
        output: gID("output")
    }

    clearUI();

    let h_notme = document.createElement("h2");
    h_notme.appendChild( document.createTextNode("Not me") );
    let h_me = document.createElement("h2");
    h_me.appendChild( document.createTextNode("Me") );

    el.output.appendChild(h_notme);
    el.o_notme = document.createElement("span");
    el.o_notme.setAttribute("id", "o_notme");
    el.output.appendChild(el.o_notme);

    el.output.appendChild(h_me);
    el.o_me = document.createElement("span");
    el.o_me.setAttribute("id", "o_me");
    el.output.appendChild(el.o_me);
    
    el.pC = document.createElement("div");
    el.pC.setAttribute("id", "playerCommands");
    el.input.appendChild(el.pC);
    
    el.look = document.createElement("button");
    el.look.setAttribute("id", "look");
    el.look.appendChild( document.createTextNode("Look") );
    el.pC.appendChild(el.look);

    el.map = document.createElement("button");
    el.map.setAttribute("id", "map");
    el.map.appendChild( document.createTextNode("Map") );
    el.pC.appendChild(el.map);

    // now it's time for the directional buttons
    // this is going to hurt
    el.dtab = document.createElement("table");
    el.dtab.setAttribute("id", "dtab");
    el.dtab.classList.add("allLinesTable");
    el.pC.appendChild(el.dtab);

    const jj = ["W", "", "E"];// columns aka td elements
    const ii = ["N", "", "S"];// rows aka tr elements
    for(let i = 1; i <= 3; i += 1){
        let cr = document.createElement("tr");
        el.dtab.appendChild(cr);

        for(let j = 1; j <= 3; j += 1){
            let cc = document.createElement("td");
            let bName = jj[j-1]+ ii[i-1];
            if(bName == ""){
                bName = "Me";
            }
            cc.setAttribute("id", "nav_" + bName);
            
            ccb = document.createElement("button");
            ccb.setAttribute("id", "nav_b_" + bName);
            cc.appendChild(ccb);

            ccb.appendChild( document.createTextNode(bName) );
            cr.appendChild(cc);
        }
    }
}

function clearUI(){
    clearElement(gID("input"));
    clearElement(gID("output"));
}

function zoneLookMode(){
    let descPre = gID("descPre");
    if(descPre === null){// Create a new descPre
        descPre = document.createElement("pre");
        descPre.setAttribute("id", "descPre");
        clearElement(gID("o_notme"));
        gID("o_notme").appendChild(descPre);// maybe not the best handling for this?
    }// else there already is one and we don't need to care what else is nearby

    clearElement(descPre)
    descPre.appendChild( document.createTextNode("No map to show") );
}
function mapMode(){
    let zmCurrent = gID("zmCurrent");
    if(zmCurrent === null){
        zmCurrent = document.createElement("span");
        zmCurrent.setAttribute("id", "zmCurrent");
        zmCurrent.classList.add("zmContainer");
        clearElement(gID("o_notme"));
        gID("o_notme").appendChild(zmCurrent);
    }

    clearElement(zmCurrent);
}

buildUI();