import axios from 'axios'
import { Config } from '../config/config.interface'

class Screenshot {
    constructor(private config: Config) {}

    public async GetImage(url: string) {
        try {
            const { data } = await axios.post(this.config.screenshot.url, {
                url,
                property: {
                    height: 1280,
                    width: 1280,
                },
            })

            return data.data.url
        } catch (error) {
            return ''
        }
    }
}

export default Screenshot
