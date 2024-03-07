import { Config } from '../../../config/config.interface'
import Screenshot from '../../../external/screenshot'
import Telegram from '../../../external/telegram'
import TelegramUser from '../../../external/telegram-user'
import { Translate } from '../../../helpers/translate'
import error from '../../../pkg/error'
import Logger from '../../../pkg/logger'
import statusCode from '../../../pkg/statusCode'
import { Evidence, EvidenceWithForm } from '../entity/interface'

class Usecase {
    constructor(
        private logger: Logger,
        private telegramUser: TelegramUser,
        private screesshot: Screenshot,
        private telegram: Telegram,
        private config: Config
    ) {}

    private evidenceRegex = {
        project: /project: (.+)/i,
        title: /title: (.+)/i,
        participants: /participants: (.+)/i,
        date: /date: (.+)/i,
        screenshot: /screenshot: (.+)/i,
        attachment: /attachment: (.+)/i,
        difficulty: /difficulty: (.+)/i,
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

    public async EvidenceWithForm(body: EvidenceWithForm) {
        try {
            const participants = await this.getUsersFormTelegram(
                body.participants.split(/[ ,]+/)
            )

            const evidence: Evidence = {
                ...body,
                participants,
                attachment: body.attachment,
                description: '',
                source: body.source,
            }
            const message = this.telegram.FormatDefault(evidence)

            await this.telegram.SendPhotoWithChannel(evidence, message, this.config.telegram.chat.jds)
            this.logger.Info('success send evidence', {
                category: 'evidence',
                evidence,
            })
        } catch (err: any) {
            this.logger.Error(err.message, {
                category: 'evidence',
                evidenceWithForm: body,
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
            difficulty: this.evidenceRegex.difficulty.exec(description),
        })

        if (!evidence.isValid)
            throw new error(
                statusCode.BAD_REQUEST,
                Translate('not_valid', { attribute: 'format' })
            )

        evidence.participants = evidence.participants
            ? evidence.participants.split(/[ ,]+/)
            : []

        evidence.participants = participants.length
            ? participants
            : evidence.participants

        evidence.participants = await this.getUsersFormTelegram(
            evidence.participants
        )

        return evidence
    }

    private getUsersFormTelegram = async (
        participants: string[]
    ): Promise<string[]> => {
        const telegramUser = await this.telegramUser.GetTelegramUser()

        participants = await this.telegramUser.ReplaceToUserTelegram(
            participants,
            telegramUser
        )

        return participants
    }
}

export default Usecase
