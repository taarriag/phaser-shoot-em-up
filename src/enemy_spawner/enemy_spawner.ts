
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
      while(spawnAction.getSpawnAt() * spawnAction.getSpawnAt() > this.game.time.now)
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
    //this.addSpawnGroup(6000, threeShipsRight);
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

export class OldEnemySpawner {
  protected game: Phaser.Game;
  protected player: Player;
  protected nextEnemyAt: number;
  protected enemies: Phaser.Group;
  protected enemyBullets: Phaser.Group;

  //These variables control the boundaries at which the next enemy could be generated.
  protected xStart: number;
  protected xEnd: number;
  protected yStart: number;
  protected yEnd: number;
  protected minDelay: number;
  protected maxDelay: number;
  protected partIndex: number;


  constructor(game: Phaser.Game, player: Player,
    enemies: Phaser.Group,
    enemyBullets: Phaser.Group) {
    this.game = game;
    this.player = player;
    this.enemies = enemies;
    this.enemyBullets = enemyBullets;
    this.minDelay = 250;
    this.maxDelay = 500;
    this.partIndex = -1;
  }

  //Spawn the enemy and its bullets
  public start(): void {
   

    //Note that x will be a moving window, y will stay the same.
    this.xStart = 32;
    this.xEnd = 0.5 * this.game.world.centerX;
    this.yStart = 16;
    this.yEnd = 0.6 * this.game.world.centerY;

    this.nextEnemyAt = this.game.time.now + (1000 * Math.random());
  }

  public update(): void {
    //Only generate enemies if the enemy is alive.
    if (this.game.time.now > this.nextEnemyAt && this.player.alive &&
      this.player.state == PlayerState.Playing) {

      var enemy = this.enemies.getFirstExists(false) as Enemies.Enemy;
      if (enemy) {
        //Find a partition without any enemies
        var partitionFound = this.findPartition();
        //var partitionFound = false;
        //If we werent able to find a free partition, do not create the enemy.
        if (!partitionFound) {
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
        if (this.xStart >= this.game.world.width - 32) {
          this.xStart = 32;
          this.xEnd = 0.5 * this.game.world.centerX;
        }

        var delay = this.minDelay + Math.random() * (this.maxDelay - this.minDelay);
        
        var startingState = enemy.getState(Enemies.State.Starting) as EnemyStates.Starting;
        startingState.delay = delay;
        startingState.targetPos = new Phaser.Point(x, finalY);
        enemy.setTarget(this.player);

        //TODO: Prevent instantiations of phaser.point by reusing the same point 
        enemy.start(new Phaser.Point(x, y));
        this.nextEnemyAt = this.game.time.now + (500 + 500 * Math.random());
      }
    }
  }


  protected findPartition(): boolean {
    //Tries to find a partition, setting xStart and xEnd accordingly.
    //Returns true if it was able to find an empty partition.
    var partitionFound = false;
    this.updatePartitionIndex();

    //Execute up to max_steps steps to find an empty spot.
    var max_steps = 3;
    var steps = 0;
    while (steps < max_steps) {
      steps++;
      var enemyFound = false;
      //Iterate over the enemies, check that no enemy is using this space
      for (var aux of this.enemies.children) {
        //If an alive enemy is using this space,
        var auxEnemy = aux as Enemies.Enemy;
        if (auxEnemy.exists &&
          this.xStart <= auxEnemy.x &&
          auxEnemy.x <= this.xEnd) {
          enemyFound = true;
          break;
        }
      }
      if (enemyFound) {
        this.updatePartitionIndex();
      }
      else {
        partitionFound = true;
        break;
      }
    }
    return partitionFound;
  }

  protected updatePartitionIndex(): void {
    var spawnWidth = this.game.world.width - 32;
    this.partIndex = (this.partIndex + 1) % 3;
    this.xStart = 16 + this.partIndex * 0.25 * spawnWidth;;
    this.xEnd = 16 + (this.partIndex + 1) * 0.25 * spawnWidth;
  }
}