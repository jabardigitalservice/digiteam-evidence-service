import axios from 'axios'
import { Config } from '../config/config.interface'
import { Evidence } from '../modules/evidences/entity/interface'
import Logger from '../pkg/logger'

class Telegram {
    constructor(private config: Config, private logger: Logger) {}

    public async SendPhotoWithChannel(evidence: Evidence, caption: string) {
        if (!caption) return
        try {
            await axios.post(this.config.telegram.url + '/sendPhoto', {
                chat_id: this.config.telegram.chat_id,
                photo: evidence.screenshot,
                caption,
            })
            this.logger.Info('success send photo with channel', {
                category: 'telegram',
            })
        } catch (error: any) {
            this.logger.Error(
                'failed send photo with channel' + error.message,
                {
                    category: 'telegram',
                }
            )
        }
    }

    public async SendMessageWithChannel(caption: string) {
        if (!caption) return
        try {
            await axios.post(`${this.config.telegram.url}/sendMessage`, {
                chat_id: this.config.telegram.chat_id,
                text: caption,
            })
            this.logger.Info('success send message with channel', {
                category: 'telegram',
            })
        } catch (error: any) {
            this.logger.Error(
                'success send message with channel' + error.message,
                {
                    category: 'telegram',
                }
            )
        }
    }

    public FormatByCreated = (evidence: Evidence): string => {
        const participants = evidence.participants.length
            ? evidence.participants[0]
            : ''
        const date = evidence.date ? `Tanggal: ${evidence.date}` : ''
        const difficulty = evidence.difficulty
            ? `Kesulitan: ${evidence.difficulty}`
            : ''

        const message = `
  /lapor ${evidence.project} | ${evidence.title}
Peserta: ${participants}
Lampiran: ${evidence.attachment}
${date}
${difficulty}
`
        return participants ? message : ''
    }

    public FormatByReview = (evidence: Evidence) => {
        const participant = evidence.participants.length
            ? evidence.participants.slice(1).join('  ')
            : ''
        const date = evidence.date ? `Tanggal: ${evidence.date}` : ''
        const message = `
/lapor ${evidence.project} | Peer code review ${evidence.title}
Peserta: ${participant}
Lampiran: ${evidence.attachment}
${date}
`
        return participant ? message : ''
    }

    public FormatDefault = (evidence: Evidence) => {
        const participant = evidence.participants.length
            ? evidence.participants.join('  ')
            : ''
        const date = evidence.date ? `Tanggal: ${evidence.date}` : ''
        const difficulty =
            evidence.difficulty && evidence.difficulty !== 3
                ? `Kesulitan: ${evidence.difficulty}`
                : ''

        const message = `
/lapor ${evidence.project} | ${evidence.title}
Peserta: ${participant}
Lampiran: ${evidence.attachment}
${date}
${difficulty}
`
        return participant ? message : ''
    }
}

export default Telegram
