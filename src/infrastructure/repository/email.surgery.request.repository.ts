import nodeMailer from 'nodemailer'
import path from 'path'
import fs from 'fs'
import Template from 'email-templates'
import { IEmailSurgeryRequestRepository } from '../../application/port/email.surgery.request.repository.interface'
import { Identifier } from '../../di/identifiers'
import { IEntityMapper } from '../../infrastructure/port/entity.mapper.interface'
import { inject, injectable } from 'inversify'
import { ILogger } from '../../utils/custom.logger'
import { BaseRepository } from './base/base.repository'
import { Query } from './query/query'
import { EmailSurgeryRequestEntity } from '../../infrastructure/entity/email.surgery.request.entity'
import { EmailSurgeryRequest } from '../../application/domain/model/email.surgery.request'

@injectable()
export class EmailSurgeryRequestRepository extends BaseRepository<EmailSurgeryRequest, EmailSurgeryRequestEntity>
    implements IEmailSurgeryRequestRepository {

    private readonly smtpTransport: any
    private connection: boolean

    constructor(
        @inject(Identifier.EMAIL_REPO_MODEL) readonly emailModel: any,
        @inject(Identifier.EMAIL_SURGERY_REQUEST_ENTITY_MAPPER) readonly emailSurgeryRequestEntityMapper:
            IEntityMapper<EmailSurgeryRequest, EmailSurgeryRequestEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(emailModel, emailSurgeryRequestEntityMapper, logger)
        this.smtpTransport = this.createSmtpTransport()
        this.connection = false
        this.smtpTransport.verify((err, success) => {
            if (err) {
                this.logger.error(`Invalid SMTP Credentials. ${err.message}`)
                this.connection = false
                return
            }
            this.connection = true
            this.logger.info('SMTP credentials successfully verified!')
        })
    }

    public sendTemplate(name: string, to: any, data: any, email: any, lang?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getEmailTemplateInstance(name)
                .send({
                    template: name,
                    message: {
                        to: [{ name: to.email, address: to.email }],
                        from: {
                            name: process.env.SENDER_NAME,
                            address: process.env.ORIGIN_EMAIL
                        }
                    },
                    locals: data
                })
                .then(resolve)
                .catch(reject)

            if (!this.connection) {
                if (!email.id) {
                    this.createEmailFromSurgery(email, name)
                }
            }
        })
    }

    public createEmailFromSurgery(item: EmailSurgeryRequest, type): Promise<EmailSurgeryRequest | undefined> {
        return new Promise<EmailSurgeryRequest | undefined>((resolve, reject) => {
            item.type = type
            this.Model.create(item)
                .then((result) => {
                    const query = new Query()
                    query.filters = result._id
                    return resolve(this.findOne(query))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    /**
     * Create the SMTP NodeMailer transport.
     *
     * @return SMTP transport.
     */
     private createSmtpTransport(): any {
        const smtpPort = Number(process.env.SMTP_PORT)
        return nodeMailer.createTransport({
            host: process.env.SMTP_HOST,
            port: smtpPort,
            secure: smtpPort === 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
            }
        })
    }

    private getEmailTemplateInstance(typeTemplate: string): any {
        const emailTemplatesPath = process.env.EMAIL_TEMPLATES_PATH
        if (emailTemplatesPath) {
            try {
                const data: any = fs.readdirSync(emailTemplatesPath)
                if (data && data.find(item => item === typeTemplate)) {
                    return new Template({
                        transport: this.smtpTransport,
                        send: true,
                        preview: false,
                        views: { root: path.resolve(emailTemplatesPath) }
                    })
                }
            } catch (err: any) {
                this.logger.error(`The custom templates could not be accessed successfully, so the default will be used.`
                    .concat(err.message))
            }
        }
        return new Template({
            transport: this.smtpTransport,
            send: true,
            preview: false,
            views: { root: path.resolve(process.cwd(), 'dist', 'src', 'ui', 'templates', 'emails') }
        })
    }
}
