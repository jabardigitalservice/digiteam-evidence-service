import axios from 'axios'
import { Config } from '../config/config.interface'

interface Users {
    Timestamp: Date
    username: string
    telegram: string
}

class TelegramUser {
    constructor(private config: Config) {}

    public async GetUsers(): Promise<Users[]> {
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

    public async GetParticipants(participants: string[], users: Users[]) {
        const newParticipants: string[] = []
        for (const participant of participants) {
            newParticipants.push(this.searchUser(participant, users))
        }

        return newParticipants
    }
}

export default TelegramUser
