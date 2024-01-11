import Joi from 'joi'

export default Joi.object({
    APP_NAME: Joi.string().required(),
    APP_ENV: Joi.string()
        .valid('local', 'staging', 'production')
        .default('local'),
    APP_PORT_HTTP: Joi.number().required(),
    APP_LOG: Joi.string().valid('info', 'error', 'warn', 'debug').required(),
    APP_KEY: Joi.string().required(),
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.number().required(),
    REDIS_TTL: Joi.number().required(),
    TELEGRAM_USERS: Joi.string().uri().required(),
    TELEGRAM_URL: Joi.string().uri().required(),
    TELEGRAM_CHAT_ID: Joi.string().required(),
    SCREENSHOT_URL: Joi.string().uri().required(),
})
