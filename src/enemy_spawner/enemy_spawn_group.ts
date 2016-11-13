/// <reference path="../typings/phaser.comments.d.ts"/>
import * as Enemies from "../enemy"
import * as EnemyStates from "../states/enemy_state"
import { Player, PlayerState } from "../player"
import * as Collections from 'typescript-collections';

/**
 * Spawns a group of enemies. Inheritor classes should 
 * create the enemies in their group, define their appearance timing, etc.
 */
export abstract class EnemySpawnGroup {
  protected game : Phaser.Game;
  protected player : Player;
  protected enemies : Phaser.Group;
  protected enemyBullets : Phaser.Group;
  public constructor(
    game: Phaser.Game, 
    player: Player,
    enemies: Phaser.Group,
    enemyBullets: Phaser.Group)
    {
      this.game = game;
      this.player = player;
      this.enemies = enemies;
      this.enemyBullets = enemyBullets;
    }

  /** Spawns the group of enemies. */
  public abstract spawn() : void;
}

/**
 * Creates a row of three ships appearing from either the left side or the right 
 * side of the screen.
 */
export class ThreeShips extends EnemySpawnGroup{
  public static readonly MODE_START_LEFT : number = 1;
  public static readonly MODE_START_RIGHT : number = 2;
  public mode : number = ThreeShips.MODE_START_LEFT;
  
  public spawn() : void {
    var sign : number;
    if (this.mode == ThreeShips.MODE_START_LEFT)
      sign = 1;
    else if (this.mode == ThreeShips.MODE_START_RIGHT)
      sign = -1;
    else
      throw new Error("Invalid ThreeShips mode");

    var widthStep = this.game.world.width/6;
    var heightStep = this.game.world.height/12;

    var startX = this.game.world.width/2 + sign * widthStep/2;
    var maxDelay = 500 + 500 * 3;

    var enemySlots = this.enemies.length - this.enemies.countLiving();
    var maxSpawn : number = Math.min(3, enemySlots);

    for(var i : number = 0; i < maxSpawn; i++) {
      var enemy = this.enemies.getFirstExists(false) as Enemies.Enemy;
      if(enemy == null)
        break;

      var x = startX + sign * i * widthStep;
      var y = 0 - enemy.height * 2;
      
      var finalY = 2*heightStep + i * heightStep;
      var delay = 500 + 500 * i;

      //Setup the starting state
      var startingState = enemy.getState(Enemies.State.Starting) as EnemyStates.Starting;
      startingState.delay = delay;
      startingState.targetPos = new Phaser.Point(x, finalY);

      //Setup the leaving state
      //The enemies leave in reverse order
      var leavingState = enemy.getState(Enemies.State.Leaving) as EnemyStates.Leaving;
      leavingState.delay = 2*(maxDelay - delay);
      leavingState.targetPos = new Phaser.Point(x, this.game.world.height + enemy.height * 2);
      enemy.setTarget(this.player);
      enemy.start(new Phaser.Point(x,y));
    }
  }
}