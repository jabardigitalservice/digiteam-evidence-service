import Screenshot from '../../../external/screenshot'
import Telegram from '../../../external/telegram'
import TelegramUser from '../../../external/telegram-user'
import { Translate } from '../../../helpers/translate'
import error from '../../../pkg/error'
import Logger from '../../../pkg/logger'
import statusCode from '../../../pkg/statusCode'
import { Evidence } from '../entity/interface'

class Usecase {
    constructor(
        private logger: Logger,
        private telegramUser: TelegramUser,
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

    public async Evidence(body: Evidence) {
        try {
            const evidence = await this.getEvidenceFromDescription(
                body.description,
                body.participants
            )
            evidence.attachment = evidence.attachment || body.attachment
            evidence.screenshot =
                evidence.screenshot ||
                (await this.screesshot.GetImage(evidence.attachment))
            evidence.description = body.description
            evidence.source = body.source

            const messageByCreated = this.telegram.FormatByCreated(evidence)
            const messageByReview = this.telegram.FormatByReview(evidence)

            if (evidence.screenshot) {
                this.telegram.SendPhotoWithChannel(evidence, messageByCreated)
                this.telegram.SendPhotoWithChannel(evidence, messageByReview)
                this.logger.Info('success send evidence', {
                    category: 'evidence',
                    evidence,
                })
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
        const telegramUser = await this.telegramUser.GetTelegramUser()

        evidence.participants = await this.telegramUser.ReplaceToUserTelegram(
            users,
            telegramUser
        )

        return evidence
    }
}

export default Usecase
