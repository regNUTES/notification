import nodeMailer from 'nodemailer'
import { inject, injectable } from 'inversify'
import { BaseRepository } from './base/base.repository'
import { IEmailFromBusRepository } from '../../application/port/email.from.bus.repository.interface'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { IEntityMapper } from '../port/entity.mapper.interface'
import Template from 'email-templates'
import path from 'path'
import fs from 'fs'
import { EmailFromBus } from '../../application/domain/model/email.from.bus'
import { EmailFromBusEntity } from '../entity/email.from.bus.entity'
import { Query } from './query/query'
import cryptojs from 'crypto-js'

/**
 * Implementation of the email from bus repository.
 *
 * @implements {IEmailFromBusRepository}
 */
@injectable()
export class EmailFromBusRepository extends BaseRepository<EmailFromBus, EmailFromBusEntity> implements IEmailFromBusRepository {

    private smtpTransport: any
    private connection: boolean

    constructor(
        @inject(Identifier.EMAIL_REPO_MODEL) readonly emailModel: any,
        @inject(Identifier.EMAIL_FROM_BUS_ENTITY_MAPPER) readonly emailFromBusEntityMapper:
            IEntityMapper<EmailFromBus, EmailFromBusEntity>,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(emailModel, emailFromBusEntityMapper, logger)
        this.connection = false
        this.smtpTransport = this.createSmtpTransport()
    }

    public async verifyConnection(): Promise<void> {

        return new Promise<void>(async (resolve, reject) => {
            await this.smtpTransport.verify((err, success) => {
                if (err) {
                    this.logger.error(`Invalid SMTP Credentials. ${err.message}`)
                    this.connection = false
                    resolve()
                    return
                }
                this.connection = true
                this.logger.info('SMTP credentials successfully verified!')
                resolve()
            })
        })
    }

    public async sendTemplate(name: string, to: any, data: any, email: EmailFromBus, senderName: string,
        lang?: string): Promise<void> {

        await this.verifyConnection()

        return new Promise<void>((resolve, reject) => {
            this.getEmailTemplateInstance(name)
                .send({
                    template: name,
                    message: {
                        to: [{ name: to.email, address: to.email }],
                        from: {
                            name: senderName,
                            address: process.env.ORIGIN_EMAIL
                        }
                    },
                    locals: data
                })
                .then(resolve)
                .catch(reject)


            if (!this.connection) {
                if (!email.id) {
                    const passphrase = 'RegNutes@123'
                    const newPasswordEncrypt = cryptojs.AES.encrypt(email.password, passphrase).toString()

                    email.password = newPasswordEncrypt
                    this.createEmailFromBus(email, name)
                }
            }
        })
    }

    public createEmailFromBus(item: EmailFromBus, type): Promise<EmailFromBus | undefined> {
        return new Promise<EmailFromBus | undefined>((resolve, reject) => {
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
