import { Config } from '../../../config/config.interface'
import Screenshot from '../../../external/screenshot'
import Telegram from '../../../external/telegram'
import TelegramUser from '../../../external/telegram-user'
import { Translate } from '../../../helpers/translate'
import error from '../../../pkg/error'
import Logger from '../../../pkg/logger'
import Redis from '../../../pkg/redis'
import statusCode from '../../../pkg/statusCode'
import { Evidence } from '../entity/interface'

class Usecase {
    constructor(
        private logger: Logger,
        private redis: Redis,
        private telegramUser: TelegramUser,
        private config: Config,
        private screesshot: Screenshot,
        private telegram: Telegram
    ) {}

    private evidenceRegex = {
        project: /project: (.+)/i,
        title: /title: (.+)/i,
        participants: /participants: (.+)/i,
        date: /date: (.+)/i,
        screenshot: /screenshot: (.+)/i,
        attachment: /attachment: (.+)/i,
    }

    private cacheKey = 'telegram-user'
    private cacheKeyBackup = 'telegram-user-backup'

    public async Evidence(body: Evidence) {
        try {
            const evidence = await this.getEvidenceFromDescription(
                body.description,
                body.participants
            )
            evidence.attachment = evidence.attachment
                ? evidence.attachment
                : body.attachment
            evidence.screenshot = evidence.screenshot
                ? evidence.screenshot
                : await this.screesshot.GetImage(evidence.attachment)

            evidence.source = body.source

            const messageByCreated = this.telegram.FormatByCreated(evidence)
            const messageByReview = this.telegram.FormatByReview(evidence)

            if (evidence.screenshot) {
                this.telegram.SendPhotoWithChannel(evidence, messageByCreated)
                this.telegram.SendPhotoWithChannel(evidence, messageByReview)
                return
            }

            this.telegram.SendMessageWithChannel(messageByCreated)
            this.telegram.SendMessageWithChannel(messageByReview)

            this.logger.Info('success send evidence', {
                category: 'evidence',
                evidence,
            })
        } catch (error: any) {
            this.logger.Error(error.message, {
                category: 'evidence',
                evidence: body,
            })
        }
    }

    private validateEvidence = (evidence: any) => {
        const required = ['project', 'title']
        let isValid = true
        for (const item in evidence) {
            const validation =
                evidence[item] === null && required.includes(item)
            if (validation) {
                isValid = false
                break
            }

            evidence[item] = evidence[item] ? evidence[item][1].trim() : ''
        }

        evidence.isValid = isValid

        return evidence
    }

    private async getTelegramUser() {
        let cacheUsers = await this.redis.Get(this.cacheKey)
        let telegramUser
        if (!cacheUsers) {
            try {
                const user = await this.telegramUser.GetUsers()
                await this.redis.Store(
                    this.cacheKey,
                    JSON.stringify(user),
                    this.config.redis.ttl
                )
                await this.redis.Store(
                    this.cacheKeyBackup,
                    JSON.stringify(user),
                    0
                )
                telegramUser = user
            } catch (error) {
                const cacheUsers = await this.redis.Get(this.cacheKeyBackup)
                if (cacheUsers) {
                    telegramUser = JSON.parse(cacheUsers)
                } else {
                    telegramUser = []
                }
            }
        } else {
            telegramUser = JSON.parse(cacheUsers)
        }

        return telegramUser
    }

    private getEvidenceFromDescription = async (
        description: string,
        participants: string[]
    ): Promise<Evidence> => {
        const evidence = this.validateEvidence({
            project: this.evidenceRegex.project.exec(description),
            title: this.evidenceRegex.title.exec(description),
            participants: this.evidenceRegex.participants.exec(description),
            date: this.evidenceRegex.date.exec(description),
            screenshot: this.evidenceRegex.screenshot.exec(description),
            attachment: this.evidenceRegex.attachment.exec(description),
        })

        if (!evidence.isValid)
            throw new error(
                statusCode.BAD_REQUEST,
                Translate('not_valid', { attribute: 'format' })
            )

        evidence.participants = evidence.participants
            ? evidence.participants.split(/[ ,]+/)
            : []

        const users = participants.length ? participants : evidence.participants

        const telegramUser = await this.getTelegramUser()
    
        evidence.participants = await this.telegramUser.ReplaceToUserTelegram(
            users,
            telegramUser
        )

        return evidence
    }
}

export default Usecase
