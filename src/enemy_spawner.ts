
/// <reference path="typings/phaser.comments.d.ts"/>
import {Enemy, SpecialEnemy} from "./enemy.ts"
import { Player, PlayerState } from "./player.ts"


export class EnemySpawner
{
    protected game : Phaser.Game;
    protected player : Player;
    protected nextEnemyAt : number;
    protected enemies : Phaser.Group;
    protected enemyBullets : Phaser.Group;

    //These variables control the boundaries at which the next enemy could be generated.
    protected xStart : number; 
    protected xEnd : number;
    protected yStart : number;
    protected yEnd : number;
    protected minDelay : number;
    protected maxDelay : number;

    constructor(game : Phaser.Game, player : Player, 
                enemies : Phaser.Group, 
                enemyBullets : Phaser.Group)
    {
        this.game = game;
        this.player = player;
        this.enemies = enemies;
        this.enemyBullets = enemyBullets;
        this.minDelay = 250;
        this.maxDelay = 500;
    }

    //Spawn the enemy and its bullets
    public start() : void {
        for(var i = 0; i < 5; i++)
        {
            this.enemies.add(new SpecialEnemy(this.game, 0, 0, this.enemyBullets), true);
        }

        //Note that x will be a moving window, y will stay the same.
        this.xStart = 32;
        this.xEnd = 0.5 * this.game.world.centerX;
        this.yStart = 16;
        this.yEnd = 0.6 * this.game.world.centerY;

        this.nextEnemyAt = this.game.time.now + (1000 * Math.random()); 
    }

    public update() : void
    {
        //Only generate enemies if the enemy is alive.
        if(this.game.time.now > this.nextEnemyAt && 
           this.player.alive && 
           this.player.state == PlayerState.Playing)
        {
            var enemy = this.enemies.getFirstExists(false) as Enemy;
            if(enemy)
            {
                //var x = 2*enemy.width + Math.random() * (this.game.world.width - 2*enemy.width);
                
                //Find a partition without any enemies
                //TODO: Randomize the direction search so that they arent always 
                //created at the start.
                var partitionFound = false;
                this.xStart = 16;
                this.xEnd = 0.25 * (this.game.world.width - 32);
                while(this.xEnd <= (this.game.world.width - 16))
                {
                    var enemyFound = false;
                    //Iterate over the enemies, check that no enemy is using this space
                    for(var aux of this.enemies.children)
                    {
                        //If an alive enemy is using this space, 
                        var auxEnemy = aux as Enemy;
                        if(auxEnemy.exists && 
                            this.xStart <= auxEnemy.x &&
                            auxEnemy.x <= this.xEnd)
                        {
                            enemyFound = true;
                            break;
                        }
                    }
                    if(enemyFound)
                    {
                        this.xStart += 0.25 * (this.game.world.width - 32);
                        this.xEnd += 0.25 * (this.game.world.width - 32);
                        //this.xStart = Math.min(this.xStart, this.game.world.width - 32);
                        //this.xEnd = Math.min(this.xEnd, this.game.world.width);
                    }
                    else 
                    {
                        partitionFound = true;
                        break;
                    }
                }

                //If we werent able to find a free partition, do not create the enemy.
                if(!partitionFound)
                {
                    this.nextEnemyAt = this.game.time.now + (500 + 500 * Math.random());
                    return;
                }

                //Create the enemy at a random position inside the partition.
                var x = this.xStart + Math.random() * (this.xEnd - this.xStart);
                var y = 0 - enemy.height * 2;
                var finalY = this.yStart + Math.random() * (this.yEnd - this.yStart);

                //Update the start and end positions of the next enemy generation
                this.xStart += 0.5 * this.game.world.centerX;
                this.xEnd += 0.5 * this.game.world.centerX;
                if(this.xStart >= this.game.world.width - 32)
                {
                    this.xStart = 32;
                    this.xEnd = 0.5 * this.game.world.centerX;
                }

                var delay = this.minDelay + Math.random() * (this.maxDelay - this.minDelay);
                enemy.setDelay(delay);
                enemy.setFinalPos(new Phaser.Point(x, finalY));
                enemy.setTarget(this.player);
                enemy.start(x, y);
                this.nextEnemyAt = this.game.time.now + (500 + 500 * Math.random());
            }
        }
    }

}