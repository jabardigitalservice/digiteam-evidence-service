import config from './config/config'
import Evidences from './modules/evidences/evidences'
import Logger from './pkg/logger'
import Redis from './pkg/redis'
import Http from './transport/http/http'

const main = async () => {
    const logger = new Logger(config)

    const http = new Http(logger, config)
    const redis = new Redis(config, logger)
    // Start Load Modules
    new Evidences(logger, http, config, redis)
    // End Load Modules

    http.Run(config.app.port.http)

    return {
        http,
    }
}

export default main()
