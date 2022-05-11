import Mongoose from 'mongoose'

interface IEmailModel extends Mongoose.Document {
}

const addressObj = {
    name: { type: String },
    email: { type: String }
}

const emailSchema = new Mongoose.Schema({
        reply: addressObj,
        from: addressObj,
        to: [addressObj],
        cc: [addressObj],
        bcc: [addressObj],
        subject: { type: String },
        text: { type: String },
        html: { type: String },
        action_url: { type: String },
        password: { type: String },
        request_code: { type: String},
        municipality: { type: String},
        health_unit: { type: String},
        surgery: { type: String},
        surgery_scheduling_date: { type: String},
        operation: { type: String},
        type: { type: String },
        attachments: [{
            filename: { type: String },
            path: { type: String },
            content_type: { type: String }
        }],
        user_id: {
            type: Mongoose.Schema.Types.ObjectId
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false },
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id
                delete ret._id
                delete ret.__v
                return ret
            }
        }
    }
)

export const EmailRepoModel = Mongoose.model<IEmailModel>('Email', emailSchema)
