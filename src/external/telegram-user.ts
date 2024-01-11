import axios from 'axios'
import { Config } from '../config/config.interface'
import Redis from '../pkg/redis'

interface Users {
    Timestamp: Date
    username: string
    telegram: string
}

class TelegramUser {
    private cacheKey = 'telegram-user'
    private cacheKeyBackup = 'telegram-user-backup'

    constructor(private config: Config, private redis: Redis) {}

    private async GetUsers(): Promise<Users[]> {
        try {
            const { data } = await axios.get(this.config.telegram.users)

            return data.rows
        } catch (error) {
            return []
        }
    }

    private searchUser(user: string, users: Users[]) {
        const result = users.filter(({ username }) => username === user)
        if (result.length) return result[0].telegram

        return user
    }

    public async ReplaceToUserTelegram(participants: string[], users: Users[]) {
        const newParticipants: string[] = []
        for (const participant of participants) {
            newParticipants.push(this.searchUser(participant, users))
        }

        return newParticipants
    }

    public async GetTelegramUser() {
        let cacheUsers = await this.redis.Get(this.cacheKey)
        let telegramUser
        if (!cacheUsers) {
            try {
                const user = await this.GetUsers()
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
                cacheUsers = await this.redis.Get(this.cacheKeyBackup)
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
}

export default TelegramUser
