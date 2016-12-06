
/// <reference path="../typings/phaser.comments.d.ts"/>
import * as Enemies from "../enemy"
import * as EnemyStates from "../states/enemy_state"
import { Player, PlayerState } from "../player"
import * as EnemySpawnGroups from './enemy_spawn_group'
import * as Collections from 'typescript-collections';

/**
 * The enemy spawner maintains a list of all the enemy spawns that will occur through the level
 * and spawns enemies accordingly through the level. Only one enemy spawner is active at any 
 * given time.
 */
export abstract class EnemySpawner {
  protected game: Phaser.Game;
  protected player: Player;
  protected nextEnemyAt: number;
  protected enemies: Phaser.Group;
  protected enemyBullets: Phaser.Group;
  protected spawnActions: Array<SpawnAction>; 
  protected startTime : number;

  public constructor(
    game: Phaser.Game, 
    player: Player,
    enemies: Phaser.Group,
    enemyBullets: Phaser.Group) {
      this.game = game;
      this.player = player;
      this.enemies = enemies;
      this.enemyBullets = enemyBullets;
      this.spawnActions = new Array<SpawnAction>();
      for (var i = 0; i < 5; i++) {
        this.enemies.add(new Enemies.Enemy(this.game, 0, 0, this.enemyBullets), true);
      }
    }

    protected addSpawnGroup(spawnAt : number, spawnGroup : EnemySpawnGroups.EnemySpawnGroup ) : void {
      this.spawnActions.push(new SpawnAction(spawnAt, spawnGroup));
    }

    /**
     * Initializes the list of spawn actions, that is, the list of spawn groups
     * and the time where they appear. This method will be called when starting
     * the spawner.
     */
    public abstract init() : void;

    /**
     * Start the enemy spawner 
     */
    public start() : void {
      this.init();
      this.spawnActions = this.spawnActions.sort((sa1, sa2) => sa1.getSpawnAt() - sa2.getSpawnAt());
      this.startTime = this.game.time.now;
      
    }

    public update() : void {
      if(this.spawnActions.length <= 0) {
        return;
      }
      var spawnAction = this.spawnActions[0];
      while(spawnAction.getSpawnAt() <= this.game.time.now)
      {
        var spawnGroup = spawnAction.getSpawnGroup();
        spawnGroup.spawn();
        this.spawnActions.shift();
        if(this.spawnActions.length <= 0)
          break;
        spawnAction = this.spawnActions[0];
      }
    }
}

export class TestEnemySpawner extends EnemySpawner {
  public init() : void {
    //TODO: Find a way to reduce the number of arguments.
    var threeShipsRight = new EnemySpawnGroups.ThreeShips(this.game, this.player, this.enemies, this.enemyBullets);
    var threeShipsLeft = new EnemySpawnGroups.ThreeShips(this.game, this.player, this.enemies, this.enemyBullets);
    this.addSpawnGroup(1500, threeShipsLeft);
  }
}

export class RandomEnemySpawner extends EnemySpawner {
  protected nextEnemyAt : number;

  public init() : void {
    this.nextEnemyAt = this.game.time.now + 2000;
  }

  public update() {
    super.update();
    var now = this.game.time.now;
    if(now > this.nextEnemyAt) {
        this.createEnemyGroup();
        this.nextEnemyAt = now + 5000;
    }
  }

  private createEnemyGroup() {
    var now = this.game.time.now;
    var whichEnemy = Math.random();
    var threeShips = new EnemySpawnGroups.ThreeShips(this.game, this.player, this.enemies, this.enemyBullets);
    if(whichEnemy <= 0.5) {
      threeShips.mode = EnemySpawnGroups.ThreeShips.MODE_START_RIGHT;
    }
    else {
      threeShips.mode = EnemySpawnGroups.ThreeShips.MODE_START_LEFT;
    }
    this.addSpawnGroup(now, threeShips);
  }
}

/**
 * A spawn action is a tuple containing the time at which a group of 
 * enemies should be spawn. 
 */
export class SpawnAction {
  private spawnAt : number;
  private spawnGroup : EnemySpawnGroups.EnemySpawnGroup;
  
  constructor(spawnAt : number, spawnGroup : EnemySpawnGroups.EnemySpawnGroup) {
    this.spawnAt = spawnAt;
    this.spawnGroup = spawnGroup;
  }

  public getSpawnAt() : number {
    return this.spawnAt;
  } 

  public getSpawnGroup() : EnemySpawnGroups.EnemySpawnGroup {
    return this.spawnGroup;
  }
}