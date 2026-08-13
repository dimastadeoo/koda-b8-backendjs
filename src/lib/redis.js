import {createClient} from 'redis'

const redis = await createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    }
}).on('error', (err) =>{console.log('Cannot connect to redis because '+ err.message)}).connect()

export default redis
