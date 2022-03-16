//%icon="\uf135" color="#458FAA"
//%block="Meteoroid"
//%block.loc.zh-CN="砸落特效"
namespace meteoroid {


    //%block
    //%blockid=meteoroid_launch_meteoriod %block.loc.zh-CN="将 %sprite=variables_get(mySprite) 以速度 %velocity 在 %delayMillis 毫秒后砸向地面"
    export function launchMeteoroid(sprite:Sprite, toLocation:tiles.Location, velocity:number, delayMillis:number) {
        launchMeteoroidToPosition(sprite, toLocation.x, toLocation.y, velocity, delayMillis)
    }

    //%block
    //%blockid=meteoroid_launch_meteoriod %block.loc.zh-CN="将 %sprite=variables_get(mySprite) 以速度 %velocity 在 %delayMillis 毫秒后砸向地面"
    export function launchMeteoroidToPosition(sprite: Sprite, x:number, y:number, velocity: number, delayMillis: number) {
        sprite.setFlag(SpriteFlag.Ghost, true)

        let shade = shader.createImageShaderSprite(sprite.image, shader.ShadeLevel.One)
        shade.setPosition(x, y)

        sprite.onDestroyed(() => {
            shade.destroy()
        })

        let timeoutHolder = setTimeout(() => {
            let delta = y - sprite.y
            if (delta < 1.5) {
                shade.destroy()
            }
        }, 100)

        shade.onDestroyed(() => {
            sprite.setFlag(SpriteFlag.Ghost, false)
            sprite.setPosition(shade.x, shade.y)
            sprite.vy = 0
            clearTimeout(timeoutHolder)
        })



        sprite.setPosition(x, y)
        sprite.y -= velocity * delayMillis - sprite.height / 2
        sprite.vy = velocity

        shade.lifespan = delayMillis * 1000
    }
}