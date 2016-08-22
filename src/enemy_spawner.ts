
/// <reference path="typings/phaser.comments.d.ts"/>
import {Enemy, SpecialEnemy} from "./enemy.ts"

export class EnemySpawner
{
    protected game : Phaser.Game;
    constructor(game : Phaser.Game)
    {
        this.game = game;
    }

    public update() : void
    {

    }

}