import nodeMailer from 'nodemailer'
import { inject, injectable } from 'inversify'
import { Email } from '../../application/domain/model/email'
import { BaseRepository } from './base/base.repository'
import { IEmailRepository } from '../../application/port/email.repository.interface'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { Address } from '../../application/domain/model/address'
import { ValidationException } from '../../application/domain/exception/validation.exception'
import Template from 'email-templates'
import path from 'path'
import fs from 'fs'
import { EmailTemplate } from '../../application/domain/model/email.template'
import { EmailFromUsers } from '../../application/domain/model/email.from.users'
import { EmailFromUsersEntity } from '../entity/email.from.users.entity'

/**
 * Implementation of the email repository.
 *
 * @implements {IEmailRepository}
 */
@injectable()
export class EmailRepository extends BaseRepository<EmailFromUsers, EmailFromUsersEntity> implements IEmailRepository {
    private readonly smtpTransport: any

    constructor(
        @inject(Identifier.EMAIL_REPO_MODEL) readonly emailModel: any,
        @inject(Identifier.EMAIL_FROM_USERS_ENTITY_MAPPER) readonly emailFromUsersMapper:
            IEntityMapper<EmailFromUsers, EmailFromUsersEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(emailModel, emailFromUsersMapper, logger)
        this.smtpTransport = this.createSmtpTransport()
        this.smtpTransport.verify((err, success) => {
            if (err) {
                this.logger.error(`Invalid SMTP Credentials. ${err.message}`)
                return
            }
            this.logger.info('SMTP credentials successfully verified!')
        })
    }

    /**
     * Send email using the NodeMailer library.
     *
     * @param email
     * @return Promise<Email>
     */
    public async send(email: EmailFromUsers): Promise<EmailFromUsers | undefined> {
        email.from = new Address(process.env.SENDER_NAME, process.env.ORIGIN_EMAIL)
        const emailSendNodeMailer: any = this.convertEmailToNodeMailer(email)
        try {
            await this.smtpTransport.sendMail(emailSendNodeMailer)
        } catch (err: any) {
            if (err.code && err.code === 'ESTREAM') {
                let message = err.message
                if (err.sourceUrl) message = `Error loading URL file: ${err.sourceUrl}`
                return Promise.reject(
                    new ValidationException('There was a problem with your attachments!', message)
                )
            }
            this.logger.error(err)
            return Promise.reject(err)
        }
        return super.create(email)
    }

    public sendTemplate(name: string, to: any, data: any, email: EmailFromUsers, lang?: string): Promise<void> {
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
        })
    }

    public sendTemplateAndAttachment(name: string, to: any, attachments: Array<any>, data: any, lang?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getEmailTemplateInstance(name)
                .send({
                    template: name,
                    message: {
                        to: [{ name: to.email, address: to.email }],
                        from: {
                            name: process.env.SENDER_NAME,
                            address: process.env.ORIGIN_EMAIL
                        },
                        attachments
                    },
                    locals: data
                })
                .then(resolve)
                .catch(reject)
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

    /**
     *  Convert the {Email} object to the type accepted by the NodeMailer library.
     *  Format NodeMailer:
     *  {
     *       from: {
     *          name: 'string',
     *          address: 'string'
     *       },
     *       replyTo: {
     *           name: 'string',
     *           address: 'string'
     *       },
     *       to: [{
     *          name: string,
     *          address: string
     *       }],
     *       cc: [{
     *           name: 'string',
     *           address: 'string'
     *       }],
     *       bcc: [{
     *           name: 'string',
     *           address: 'string'
     *       }],
     *       subject: 'string',
     *       text: 'string',
     *       html: 'string',
     *       attachments: [{
     *          filename: 'string',
     *          path: 'string',
     *          contentType: 'string'
     *       }]
     *  }
     *
     * @param email
     * @return object
     */
    private convertEmailToNodeMailer(email: Email): any {
        const result: any = {}

        result.from = { name: email.from.name, address: email.from.email }
        if (email.reply) result.replyTo = { name: email.reply.name, address: email.reply.email }
        result.to = email.to.map(elem => {
            return { name: elem.name, address: elem.email }
        })
        result.cc = email.cc ? email.to.map(elem => {
            return { name: elem.name, address: elem.email }
        }) : undefined
        result.bcc = email.bcc ? email.to.map(elem => {
            return { name: elem.name, address: elem.email }
        }) : undefined
        if (email.subject) result.subject = email.subject
        if (email.text) result.text = email.text
        if (email.html) result.html = email.html
        result.attachments = email.attachments ? email.attachments.map(elem => {
            return {
                filename: elem.filename,
                path: elem.path,
                contentType: elem.contentType
            }
        }) : undefined

        return result
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

    public removeEmailFromDB(userId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.emailModel.deleteMany({ user_id: userId })
                .then((result) => resolve(!!result))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public removeAllFromUser(userId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.emailModel.deleteMany({ user_id: userId })
                .then((result) => resolve(!!result))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public async findTemplateByTypeAndResource(type: string, resource: string): Promise<Buffer> {
        try {
            const templatePath: string = this.getEmailTemplateInstance(type!)
            let filePath: string = `${templatePath}/${type}/${resource}.pug`
            // Transforms the path to the Windows use case.
            if (process.platform === 'win32') filePath = this.replaceForwardSlashes(filePath)
            const result: Buffer = await fs.readFileSync(filePath)
            return Promise.resolve(Buffer.from(result))
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async updateTemplate(item: EmailTemplate): Promise<EmailTemplate> {
        try {
            const templatePath: string = this.getEmailTemplateInstance(item.type!)
            let htmlFilePath: string = `${templatePath}/${item.type}/html.pug`
            let subjectFilePath: string = `${templatePath}/${item.type}/subject.pug`
            let textFilePath: string = `${templatePath}/${item.type}/text.pug`
            if (process.platform === 'win32') {
                htmlFilePath = this.replaceForwardSlashes(htmlFilePath)
                subjectFilePath = this.replaceForwardSlashes(subjectFilePath)
                textFilePath = this.replaceForwardSlashes(textFilePath)
            }
            await fs.writeFileSync(htmlFilePath, Buffer.from(item.html?.buffer!))
            await fs.writeFileSync(subjectFilePath, Buffer.from(item.subject?.buffer!))
            await fs.writeFileSync(textFilePath, Buffer.from(item.text?.buffer!))
            return Promise.resolve(item)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    private replaceForwardSlashes(input: string): string {
        return input.replace(/\//g, '\\')
    }
}
