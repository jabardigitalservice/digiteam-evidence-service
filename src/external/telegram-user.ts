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

    private async loadUsers(): Promise<void> {
        try {
            const { data } = await axios.get(this.config.telegram.users)

            const users = JSON.stringify(data.rows)

            await this.redis.Store(this.cacheKey, users, this.config.redis.ttl)

            await this.redis.Store(this.cacheKey, users, this.config.redis.ttl)
        } catch (error) {
            const users = await this.redis.Get(this.cacheKeyBackup)
            await this.redis.Store(this.cacheKey, users, this.config.redis.ttl)
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
        let telegramUser: Users[] = []
        const cacheUsers = await this.redis.Get(this.cacheKey)
        if (!cacheUsers) await this.loadUsers()

        const users = await this.redis.Get(this.cacheKey)

        if (users) telegramUser = JSON.parse(users)

        return telegramUser
    }
}

export default TelegramUser
