
import { GRID, SCREEN_HEIGHT, SCREEN_WIDTH, STYLE_DEFAULT } from "../SnakeHole.js";

const defaultMap = new Map([

    ["text", []],
    ["images", []],
    ["panels", []]

]);

var tutStyle = {
    "fontSize":'24px',
}

const nineGrid = 36;

var midpointY = 360/2 - 12  * 1;
var hOffSet = 570;

/**
 * Remember `.this` always references the Tutorial Scene.
 * This is because the function is `.bound` to the tutorial scene.
 */

export var TUTORIAL_PANELS = new Map([
    ["move", function (panelNumber) {
        var _map = structuredClone(defaultMap);

        var tutText = this.add.dom(
            (SCREEN_WIDTH/2 + hOffSet * panelNumber) - GRID * 2.5, 
            GRID * 19, 'div',  
            Object.assign({}, STYLE_DEFAULT, tutStyle), 
                'Press arrow keys to move.'
        ).setOrigin(0.5,0).setScale(.5).setAlpha(0);

        // return all items 
        // maybe even a map of items.

        var tutWASD = this.add.sprite((SCREEN_WIDTH/2 + hOffSet * panelNumber) + GRID * 6.5,
            SCREEN_HEIGHT/2 + GRID  * 4.25
        ).setDepth(105).setOrigin(0.5,0.5);
        tutWASD.play('tutAll');

        var tutSnake = this.add.sprite((SCREEN_WIDTH/2 + hOffSet * panelNumber),
            SCREEN_HEIGHT/2 - GRID * 1,
           'tutSnakeWASD'
        ).setDepth(103).setOrigin(0.5,0.5).setScale(1);


        let panel1 = this.add.nineslice((SCREEN_WIDTH/2 + hOffSet * panelNumber), SCREEN_HEIGHT/2, 'uiPanelL', 'Glass', 0, 0, 36,36,36,36);
        panel1.setDepth(10);
        panel1.setScale(0);

        _map.get("text").push(tutText);
        _map.get("images").push(tutWASD, tutSnake);
        _map.get("panels").push(panel1);
        _map.set("growPanelTo", {w:240, h:160});

        return _map
    }],
    ["atoms", function (panelNumber) {
        var _map = structuredClone(defaultMap);


        const panel2 = this.add.nineslice((SCREEN_WIDTH/2 + hOffSet * panelNumber), SCREEN_HEIGHT/2, 'uiPanelL', 'Glass', 0, 0, 36,36,36,36);
        panel2.setDepth(80);
        panel2.setScale(0);
        
        var tutText = this.add.dom((SCREEN_WIDTH/2 + hOffSet * panelNumber), GRID * 19, 'div',  Object.assign({}, STYLE_DEFAULT, 
            {
                "fontSize":'24px',
                //width: '50px'
            }), 
            'Collect atoms to grow longer.',
        ).setOrigin(0.5,0).setScale(.5).setAlpha(0);

        var tutMove = this.add.sprite((SCREEN_WIDTH/2 + hOffSet * panelNumber),
        SCREEN_HEIGHT/2 - GRID  * .5,).setDepth(103).setOrigin(0.5,0.5);
        tutMove.play('tutMove');
        
        /*var tutAtomSmall = this.add.sprite((SCREEN_WIDTH/2 + hOffSet * panelNumber) - GRID * 3,
        SCREEN_HEIGHT/2 + GRID  * .5).setDepth(103).setOrigin(0.5,0.5);
        tutAtomSmall.play('atom04idle');
        
        var tutAtomMedium = this.add.sprite((SCREEN_WIDTH/2 + hOffSet * panelNumber) - GRID * 1,
            SCREEN_HEIGHT/2 + GRID  * .5).setDepth(103).setOrigin(0.5,0.5);
        tutAtomMedium.play('atom03idle');
        
        var tutAtomLarge = this.add.sprite((SCREEN_WIDTH/2 + hOffSet * panelNumber) + GRID * 1,
            SCREEN_HEIGHT/2 + GRID  * .5).setDepth(103).setOrigin(0.5,0.5);
        tutAtomLarge.play('atom02idle');
        
        var tutAtomCharged = this.add.sprite((SCREEN_WIDTH/2 + hOffSet * panelNumber) + GRID * 3,
            SCREEN_HEIGHT/2 + GRID  * .5).setDepth(103).setOrigin(0.5,0.5);
        tutAtomCharged.play('atom01idle');
        
        var tutAtomElectrons = this.add.sprite((SCREEN_WIDTH/2 + hOffSet * panelNumber) + GRID * 3,
            SCREEN_HEIGHT/2 + GRID  * .5).setDepth(103).setOrigin(0.5,0.5);
        tutAtomElectrons.play('electronIdle');*/

        _map.get("text").push(tutText);
        _map.get("images").push(tutMove);//tutAtomSmall, tutAtomMedium, tutAtomLarge, tutAtomCharged, tutAtomElectrons);
        _map.get("panels").push(panel2);
        _map.set("growPanelTo", {w:240, h:160});

        return _map

    }],
    ["walls", function (panelNumber) {
        var _map = structuredClone(defaultMap);


        const _panel = this.add.nineslice((SCREEN_WIDTH/2 + hOffSet * panelNumber), SCREEN_HEIGHT/2, 'uiPanelL', 'Glass', 0, 0, nineGrid, nineGrid, nineGrid, nineGrid);
        _panel.setDepth(80);
        _panel.setScale(0);

        
        var tutText = this.add.dom((SCREEN_WIDTH/2 + hOffSet * panelNumber), GRID * 13.5, 'div',  Object.assign({}, STYLE_DEFAULT, 
            {
                "fontSize":'24px',
                width: '200px'
            }),  
            'Collide with walls (or body) and lose lives.',
        ).setOrigin(0.5,0).setScale(.5).setAlpha(0);
        

        _map.get("text").push(tutText);
        _map.get("images").push(tutMove);
        _map.get("panels").push(_panel);
        _map.set("growPanelTo", {w:200, h:120});

        return _map

    }],
    ["screenwrap", function (panelNumber) {
        var _map = structuredClone(defaultMap);


        const _panel = this.add.nineslice((SCREEN_WIDTH/2 + hOffSet * panelNumber), SCREEN_HEIGHT/2, 'uiPanelL', 'Glass', 0, 0, nineGrid, nineGrid, nineGrid, nineGrid);
        _panel.setDepth(80);
        _panel.setScale(0);

        
        var tutText = this.add.dom((SCREEN_WIDTH/2 + hOffSet * panelNumber), GRID * 12.5, 'div',  Object.assign({}, STYLE_DEFAULT, 
            {
                "fontSize":'24px',
                width: '200px'
            }),  
            'Screen wrap in all 4 directions to access areas blocked by walls.',
        ).setOrigin(0.5,0).setScale(.5).setAlpha(0);
        

        _map.get("text").push(tutText);
        _map.get("images").push();
        _map.get("panels").push(_panel);
        _map.set("growPanelTo", {w:200, h:120});

        return _map

    }],
    ["coins", function (panelNumber) {
        var _map = structuredClone(defaultMap);


        const _panel = this.add.nineslice((SCREEN_WIDTH/2 + hOffSet * panelNumber), SCREEN_HEIGHT/2, 'uiPanelL', 'Glass', 0, 0, nineGrid, nineGrid, nineGrid, nineGrid);
        _panel.setDepth(80);
        _panel.setScale(0);

        
        var tutText = this.add.dom((SCREEN_WIDTH/2 + hOffSet * panelNumber), GRID * 12.5, 'div',  Object.assign({}, STYLE_DEFAULT, 
            {
                "fontSize":'24px',
                width: '200px'
            }),  
            'Collect coins to gain lives',
        ).setOrigin(0.5,0).setScale(.5).setAlpha(0);
        

        _map.get("text").push(tutText);
        _map.get("images").push();
        _map.get("panels").push(_panel);
        _map.set("growPanelTo", {w:200, h:120});

        return _map

    }],
    ["blackholes", function (panelNumber) {
        var _map = structuredClone(defaultMap);


        const _panel = this.add.nineslice((SCREEN_WIDTH/2 + hOffSet * panelNumber), SCREEN_HEIGHT/2, 'uiPanelL', 'Glass', 0, 0, nineGrid, nineGrid, nineGrid, nineGrid);
        _panel.setDepth(80);
        _panel.setScale(0);

        
        var tutText = this.add.dom((SCREEN_WIDTH/2 + hOffSet * panelNumber), GRID * 12.5, 'div',  Object.assign({}, STYLE_DEFAULT, 
            {
                "fontSize":'24px',
                width: '200px'
            }),  
            'Enter the center of a black hole to progress to the next stage.',
        ).setOrigin(0.5,0).setScale(.5).setAlpha(0);
        

        _map.get("text").push(tutText);
        _map.get("images").push();
        _map.get("panels").push(_panel);
        _map.set("growPanelTo", {w:200, h:120});

        return _map

    }],
    ["portals", function (panelNumber) {
        var _map = structuredClone(defaultMap);

        const panel3 = this.add.nineslice((SCREEN_WIDTH/2 + hOffSet * panelNumber), SCREEN_HEIGHT/2, 'uiPanelL', 'Glass', 240, 160, 36,36,36,36);
        panel3.setDepth(80);
        panel3.setScale(0);
        
        var tutText = this.add.dom((SCREEN_WIDTH/2 + hOffSet * panelNumber), GRID * 19, 'div',  Object.assign({}, STYLE_DEFAULT, tutStyle), 
            'Use portals to bend spacetime.',
        ).setOrigin(0.5,0).setScale(.5).setAlpha(0);

        var tutPortal1 = this.add.sprite((SCREEN_WIDTH/2 + hOffSet * panelNumber) - GRID * 2,
        SCREEN_HEIGHT/2 - GRID  * 1).setDepth(103).setOrigin(0.5,0.5);
        tutPortal1.play('portalIdle');

        var tutPortal2 = this.add.sprite((SCREEN_WIDTH/2 + hOffSet * panelNumber) + GRID * 2,
            SCREEN_HEIGHT/2 + GRID  * 1).setDepth(103).setOrigin(0.5,0.5);
        tutPortal2.play('portalIdle');

        var tutSnake2 = this.add.sprite((SCREEN_WIDTH/2 + hOffSet * panelNumber) - GRID * 1.5,
        SCREEN_HEIGHT/2 - GRID  * 1,'tutSnakePortal2').setDepth(103).setOrigin(1,0.5).setScale(1);
        var tutSnake3 = this.add.sprite((SCREEN_WIDTH/2 + hOffSet * panelNumber) + GRID * 1.5,
        SCREEN_HEIGHT/2 + GRID  * 1,'tutSnakePortal1').setDepth(103).setOrigin(0,0.5).setScale(1);

        _map.get("text").push(tutText);
        _map.get("images").push(tutPortal1, tutPortal2, tutSnake2, tutSnake3);
        _map.get("panels").push(panel3);
        _map.set("growPanelTo", {w:240, h:160});

        return _map

    }],
    ["boost", function (panelNumber) {
        var _map = structuredClone(defaultMap);

        const panel4 = this.add.nineslice((SCREEN_WIDTH/2 + hOffSet * panelNumber), SCREEN_HEIGHT/2, 'uiPanelL', 'Glass', 240, 160, 36,36,36,36);
        panel4.setDepth(80);
        panel4.setScale(0);

        var tutText = this.add.dom((SCREEN_WIDTH/2 + hOffSet * panelNumber) + GRID * 3.5, GRID * 19, 'div',  Object.assign({}, STYLE_DEFAULT, tutStyle), 
                'Hold space to sprint.',
        ).setOrigin(0.5,0).setScale(.5).setAlpha(0);

        var tutSPACE = this.add.sprite((SCREEN_WIDTH/2 + hOffSet * panelNumber) - GRID * 5.25,
        GRID  * 19.25).setDepth(103).setOrigin(0.5,0.5);
        tutSPACE.play('tutSpace');

        var tutSnake4 = this.add.sprite((SCREEN_WIDTH/2 + hOffSet * panelNumber),
        SCREEN_HEIGHT/2 - GRID * 1,'tutSnakeSPACE').setDepth(103).setOrigin(0.5,0.5).setScale(1);

        _map.get("text").push(tutText);
        _map.get("images").push(tutSPACE,tutSnake4);
        _map.get("panels").push(panel4);
        _map.set("growPanelTo", {w:240, h:160});

        return _map

    }],
]);