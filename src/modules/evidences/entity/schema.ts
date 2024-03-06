import Joi from 'joi'

export const EvidenceWithForm = Joi.object({
    title: Joi.string().required(),
    project: Joi.string().required(),
    participants: Joi.string().required(),
    date: Joi.string().isoDate().optional().allow(''),
    screenshot: Joi.string().uri().required(),
    attachment: Joi.string().uri().required(),
    difficulty: Joi.number().min(1).max(5).optional().default(3),
    source: Joi.string().forbidden().default('form'),
})
