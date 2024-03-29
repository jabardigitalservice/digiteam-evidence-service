import Joi from 'joi'
import error from '../pkg/error'
import statusCode from '../pkg/statusCode'

const getValidationErrors = (validationErrors: Joi.ValidationErrorItem[]) => {
    const errors: Record<string, string> = {}

    validationErrors.forEach((item) => {
        const { path, message } = item
        const key = path.join('.')
        errors[key] = message
    })

    return errors
}

export const Validate = (schema: Joi.Schema, values: any) => {
    const { error, value } = schema.validate(values, {
        abortEarly: false,
        stripUnknown: true,
        errors: {
            wrap: {
                label: '',
            },
        },
        cache: true,
    })

    if (!error) {
        return {
            errors: error,
            value,
        }
    }

    return {
        errors: getValidationErrors(error.details),
        value,
    }
}

export const ValidateFormRequest = (schema: Joi.Schema, values: any) => {
    const { errors, value } = Validate(schema, values)

    if (errors) {
        throw new error(
            statusCode.UNPROCESSABLE_ENTITY,
            JSON.stringify(errors),
            true
        )
    }

    return value
}

export const ValidateParams = (schema: Joi.Schema, values: any) => {
    const { errors, value } = Validate(schema, values)

    if (errors) {
        throw new error(statusCode.BAD_REQUEST, errors[''])
    }

    return value
}
