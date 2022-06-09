const Joi = require('joi');

module.exports.getParams = (params) => {
    const getSchema = Joi.object().keys({
        date: Joi.array()
            .items(Joi.date().required()),
        status: Joi.number()
            .integer().min(0).max(1),
        teacherIds: Joi.array()
            .items(Joi.number().integer().min(1).required())
            .min(1),
        studentsCount: Joi.array()
            .items(Joi.number().integer().required().min(0), Joi.number().integer().greater(Joi.ref('.')))
            .min(1).max(2),
        page: Joi.number()
            .integer().min(1),
        lessonsPerPage: Joi.number()
            .integer().min(1),
        offset: Joi.number()
            .integer(), 
    });

    const { error } = getSchema.validate(params, { abortEarly: false });

    if (!error) return { validated: true };

    return {
        validated: false,
        error,
    };
};

module.exports.postBody = (body) => {
    const postSchema = Joi.object().keys({
        teacherIds: Joi.array()
            .items(Joi.number().integer().min(1).required())
            .required(),
        title: Joi.string()
            .required(),
        days: Joi.array()
            .items(Joi.number().integer().min(0).max(6)
                .required())
            .required(),
        firstDate: Joi.date()
            .required(),
        lessonsCount: Joi.number()
            .integer().min(1).max(300),
        lastDate: Joi.date()
            .min(Joi.ref('firstDate')),
    }).xor('lessonsCount', 'lastDate');

    const { error } = postSchema.validate(body, { abortEarly: false });

    if (!error) return { validated: true };

    return {
        validated: false,
        error,
    };
};