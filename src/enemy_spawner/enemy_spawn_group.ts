/// <reference path="../typings/phaser.comments.d.ts"/>
import * as Enemies from "../enemy"
import * as Weapons from "../weapon";
import * as EnemyStates from "../states/enemy_state"
import { Player, PlayerState } from "../player"
import * as Collections from 'typescript-collections';

/**
 * Spawns a group of enemies. Inheritor classes should 
 * create the enemies in their spawn methods, defining their appearance, timing,
 * behaviors, etc.
 * The spawn group also keeps a registry of the enemies spawned within, so that
 * they can be cleaned after it finished
 */
export abstract class EnemySpawnGroup {
  protected game : Phaser.Game;
  protected player : Player;
  protected enemies : Phaser.Group;
  protected enemyBullets : Phaser.Group;
  private groupEnemies : Collections.LinkedList<Enemies.Enemy>;
  
  public constructor(
    game: Phaser.Game, 
    player: Player,
    enemies: Phaser.Group,
    enemyBullets: Phaser.Group){
      this.game = game;
      this.player = player;
      this.enemies = enemies;
      this.enemyBullets = enemyBullets;
      this.groupEnemies = new Collections.LinkedList<Enemies.Enemy>(); 
  }

  public isFinished() : boolean {
    var finished = true;
    this.groupEnemies.forEach(enemy => {
      if(enemy.alive) {
        finished = false;
        return;
      }
    });
    return finished;
  }

  public clear() : void {
    this.groupEnemies.clear();
  }

  /**
   * Starts an enemy and adds it to the list of enemies in the group. 
   * Always use this method instead of starting the enemy so that
   * it gets added the list containing this group enemies.
   */
  public startEnemy(enemy : Enemies.Enemy, pos : Phaser.Point) : void {
    this.groupEnemies.add(enemy);
    enemy.start(pos);
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
      startingState.nextState = Enemies.State.Attacking;

      //Setup the leaving state
      //The enemies leave in reverse order
      var leavingState = enemy.getState(Enemies.State.Leaving) as EnemyStates.Leaving;
      leavingState.delay = 2*(maxDelay - delay);
      leavingState.targetPos = new Phaser.Point(x, this.game.world.height + enemy.height * 2);
      
      //Setup the attacking state by passing a simple bullet weapo
      var attackingState = enemy.getState(Enemies.State.Attacking) as EnemyStates.Attacking;
      var singleBullet = new Weapons.SingleBullet(this.game, this.enemyBullets, "bullets", 7);
      singleBullet.bulletSpeed = 200;
      singleBullet.bulletSize = new Phaser.Rectangle(106 - 3*32, 42 - 32, 12, 12);
      attackingState.weapon = singleBullet;
      attackingState.nextState = Enemies.State.Leaving;
      
      // Set enemy properties
      enemy.rotation = Math.PI * 0.5;
      enemy.setTarget(this.player);
      this.startEnemy(enemy, new Phaser.Point(x,y));
    }
  }
}