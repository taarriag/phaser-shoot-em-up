/// <reference path="typings/phaser.comments.d.ts"/>

export class ExplosionEmitter
{
    protected emitter : Phaser.Particles.Arcade.Emitter;
    protected game : Phaser.Game;
    constructor(game : Phaser.Game)
    {
        this.game = game;
        this.emitter = this.game.add.emitter(0, 0, 15);
        //this.emitter.particleClass = ExplosionParticle;
        this.emitter.makeParticles('explosions', 2, 15, false, false);
    }

    public explode(origin : Phaser.Point, width : number, height : number)
    {
        this.emitter.x = origin.x;
        this.emitter.y = origin.y;
        this.emitter.width = width;
        this.emitter.height = height;

        //Scale without scaling
        this.emitter.minParticleScale = 1.5;
        this.emitter.maxParticleScale = 2.0;
        this.emitter.setAlpha(
            1, 0.0, 1800, 
            Phaser.Easing.Linear.None, false);
        this.emitter.minParticleSpeed.set(-30, -30);
        this.emitter.maxParticleSpeed.set(30, 30);
        this.emitter.gravity = 0;
        this.emitter.setRotation(0, 0);
        this.emitter.angularDrag = 0;
        this.emitter.start(true, 2000, 100, 5);
    }
}