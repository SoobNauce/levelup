function addOffsets(...offsets){
    let total = {x: 0, y: 0}
    for(offsObj of offsets){
        total.x += offsObj.x;
        total.y += offsObj.y;
    }
    return total;
}

const offsets = {
    N: {x: 0, y: -1},
    S: {x: 0, y: 1},
    E: {x: 1, y: 0},
    W: {x: -1, y: 0},
    "": {x: 0, y: 0}
}

function decodeOffset(offsStr){
    return addOffsets(
        ...offsStr
    );
}

function eightNeighbors(){
    var o2n = [
        "NW", "N", "NE", "W", "E", "SW", "S", "SE"
    ]
    let result = {};
    for(o of o2n){
        result[o] = decode_offset(o);
    };
    return result;
}

// world, stratum, zone, tile

class World{
    constructor(){
        this.strata = [];
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
        
    }
}

class Zone{
    constructor(pStrat){
        this.stratum = pStrat;

        
    }


}

class Tile{
    constructor(pZone){
        this.zone = pZone;
    }
}
// npc, player

// testing code
var w = new World();
var s = w.addStratum("Arena");
var z = s.entryZone();