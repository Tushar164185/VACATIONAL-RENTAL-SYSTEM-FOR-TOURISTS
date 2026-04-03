const joi=require("joi");
module.exports.validation= joi.object({
    reviews: joi.object({
        Comment:joi.string().required(),
        rating:joi.number().required().min(1).max(5)
    }).required()
})