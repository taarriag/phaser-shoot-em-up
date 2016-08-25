/// <reference path="typings/phaser.comments.d.ts"/>
export class ExplosionParticle extends Phaser.Particle
{
    constructor(game : Phaser.Game, x : number, y : number, key? : any, frame? : any)
    {
        super(game, x, y, key, frame);
        this.animations.add('explosion', [1, 1, 1, 1, 0, 0, 0], 20, false);
    }

    public onEmit() : void
    {
        this.animations.play('explosion');
    }

    public update() : void
    {
        super.update();   
    }
}