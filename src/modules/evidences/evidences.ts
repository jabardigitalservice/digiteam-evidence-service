import Http from '../../transport/http/http'
import Logger from '../../pkg/logger'
import Usecase from './usecase/usecase'
import Handler from './delivery/http/handler'
import { Config } from '../../config/config.interface'
import Redis from '../../pkg/redis'
import TelegramUser from '../../external/telegram-user'
import Screenshot from '../../external/screenshot'
import Telegram from '../../external/telegram'
import { VerifySecretKey } from '../../transport/http/middleware/verifyAuth'

class Evidences {
    constructor(
        private logger: Logger,
        private http: Http,
        private config: Config,
        redis: Redis
    ) {
        const telegramUser = new TelegramUser(config, redis)
        const screenshot = new Screenshot(config)
        const telegram = new Telegram(config, logger)
        const usecase = new Usecase(logger, telegramUser, screenshot, telegram)
        this.loadHttp(usecase)
    }

    private loadHttp(usecase: Usecase) {
        const handler = new Handler(this.logger, this.http, usecase)
        this.httpPublic(handler)
        this.httpPrivate(handler)
    }

    private httpPublic(handler: Handler) {}

    public httpPrivate(handler: Handler) {
        const Router = this.http.Router()

        Router.post(
            '/github/merge/:secretKey',
            VerifySecretKey(this.config),
            handler.GithubMerge()
        )
        Router.post(
            '/gitlab/merge/:secretKey',
            VerifySecretKey(this.config),
            handler.GitlabMerge()
        )
        Router.post(
            '/qase/:secretKey',
            VerifySecretKey(this.config),
            handler.Qase()
        )
        Router.post('/evidence/', handler.Evidence())

        this.http.SetRouter('/', Router)
    }
}

export default Evidences
