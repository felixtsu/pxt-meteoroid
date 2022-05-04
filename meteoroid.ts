//%icon="\uf135" color="#458FAA"
//%block="Meteoroid"
//%block.loc.zh-CN="砸落特效"
namespace meteoroid {
    let spriteShades :SparseArray<Sprite> = {}

    const METEOROID_DESTINATION_X = "METEOROID_DESTINATION_X"
    const METEOROID_DESTINATION_Y = "METEOROID_DESTINATION_Y"
    const METEOROID_OFFSET = "METEOROID_OFFSET"

    //%block
    //%blockid=meteoroid_launch_meteoriod 
    //%block.loc.zh-CN="将 %sprite=variables_get(mySprite) 以速度 %velocity 在 %delayMillis 毫秒后砸向地面"
    export function launchMeteoroid(sprite:Sprite, toLocation:tiles.Location, velocity:number, delayMillis:number, offset:number=0) {
        launchMeteoroidToPosition(sprite, toLocation.x, toLocation.y, velocity, delayMillis, offset)
    }

    //%block
    //%blockid=meteoroid_launch_meteoriod 
    //%block.loc.zh-CN="将 %sprite=variables_get(mySprite) 以速度 %velocity 在 %delayMillis 毫秒后砸向地面 || 距离地面高度 %offset 生效"
    export function launchMeteoroidToPosition(sprite: Sprite, x:number, y:number, velocity: number, delayMillis: number, offset:number=0) {
        sprite.setFlag(SpriteFlag.Ghost, true)

        sprites.setDataNumber(sprite, METEOROID_OFFSET, offset)

        let shade = shader.createImageShaderSprite(sprite.image, shader.ShadeLevel.One)
        shade.setFlag(SpriteFlag.GhostThroughWalls,true)
        spriteShades[sprite.id] = shade

        shade.setPosition(x, y)

        sprite.onDestroyed(() => {
            shade.destroy()
            spriteShades[sprite.id] = null
        })

        let intervalHolder = setInterval(() => {
            let detinationX = sprites.readDataNumber(shade, METEOROID_DESTINATION_X)
            let detinationY = sprites.readDataNumber(shade, METEOROID_DESTINATION_Y)

            let delta = 0
            if (detinationX && detinationY) {
                // 有横向移动的陨石
                // 判断阴影是否移动到特定的位置
                delta = Math.sqrt(Math.pow(y - detinationY, 2) + Math.pow(x - detinationX, 2))
                
            } 
            if (delta < 1.5) {
                console.log(`${y}, ${sprite.y}, ${x}, ${sprite.x},`)
                let deltaHeight = Math.sqrt(Math.pow(y - sprite.y, 2) + Math.pow(x - sprite.x, 2))
                console.log(`${deltaHeight}, ${offset}`)
                if (deltaHeight < offset) {
                    sprite.setFlag(SpriteFlag.Ghost, false)
                }
                if (deltaHeight < 1.5) {
                    shade.destroy()
                }
            }
        }, 25)

        shade.onDestroyed(() => {
            sprite.setFlag(SpriteFlag.Ghost, false)
            sprite.setPosition(shade.x, shade.y)
            sprite.vx = 0
            sprite.vy = 0
            clearInterval(intervalHolder)
        })

        sprite.setPosition(x, y)
        sprite.y -= velocity * delayMillis / 1000 - sprite.height / 2
        sprite.vy = velocity

        shade.lifespan = delayMillis
    }


    function changeVelocity(sprite:Sprite, x:number, y:number, delayMillis:number) {
        let deltaY = y - sprite.y
        sprite.vy = deltaY / delayMillis * 1000
        
        let deltaX = x - sprite.x
        sprite.vx = deltaX / delayMillis * 1000
    }

    export function redirectTo(sprite: Sprite, x: number, y: number, delayMillis:number) {        
        let offset = sprites.readDataNumber(sprite, METEOROID_OFFSET)
        if (!offset) {
            offset = 0
        }

        changeVelocity(sprite, x, y - offset, delayMillis)

        let shade = spriteShades[sprite.id]
        changeVelocity(shade, x, y, delayMillis)
        
        // 横向移动陨石，设置目标位置
        sprites.setDataNumber(shade, METEOROID_DESTINATION_X, x)
        sprites.setDataNumber(shade, METEOROID_DESTINATION_Y, y)

        // 重设lifespan
        shade.lifespan = delayMillis
    }
}