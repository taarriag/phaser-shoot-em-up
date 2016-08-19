/// <reference path="typings/phaser.comments.d.ts"/>
import {GameplayState} from "./gameplay_state.ts";

class ShooterGame extends Phaser.Game{
    game : Phaser.Game;


    constructor() {
        super(240, 320, Phaser.CANVAS, 'content');
        
        /*this.game = new Phaser.Game(240, 320, Phaser.CANVAS, 
            'content', {
                preload : this.preload,
                create: this.create, 
                update: this.update, 
                render: this.render,
                enemyPlayerBulletCollision : this.enemyPlayerBulletCollision,
                toggleDebug: this.toggleDebug});
        */
    }
}

window.onload = () => {
    //Tutorial to understand states: http://www.emanueleferonato.com/2014/08/28/phaser-tutorial-understanding-phaser-states/
    var game = new ShooterGame();
    game.state.add("gameplay", new GameplayState);
    game.state.start("gameplay");
}