import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import cron from 'node-cron'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { ILogger } from '../../utils/custom.logger'
import { IQuery } from '../../application/port/query.interface'
import { Query } from '../../infrastructure/repository/query/query'
import { IEmailService } from '../../application/port/email.service.interface'
import { IEmailFromBusRepository } from '../../application/port/email.from.bus.repository.interface'
import cryptojs from 'crypto-js'

/**
 * Task responsible for identifying not sented emails users and try again them.
 */
@injectable()

export class EmailsNotSentTask implements IBackgroundTask {

    private schedule: any

    constructor(
        @inject(Identifier.EMAIL_SERVICE) private readonly _emailService: IEmailService,
        @inject(Identifier.EMAIL_FROM_BUS_REPOSITORY) public readonly _emailFromBusRepository: IEmailFromBusRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger,
        private readonly expressionDontSentEmails?: string
    ) {

    }

    public async run(): Promise<void> {
        try {
            if (this.expressionDontSentEmails) {
                // Initialize crontab.
                this.schedule = cron.schedule(`${this.expressionDontSentEmails}`,
                    async () => await this.findNotSentEmails(), {
                    scheduled: false
                })
                this.schedule.start()
            } else await this.findNotSentEmails()

            this._logger.debug('Verify not sent emails task started successfully!')
        } catch (error: any) {
            this._logger.error(`An error occurred initializing the Fitbit inactive users task. ${error.message}`)
        }
    }

    public stop(): Promise<void> {
        if (this.expressionDontSentEmails) this.schedule.stop()
        return Promise.resolve()
    }

    private async findNotSentEmails(): Promise<void> {
        try {
            const queryEmails: IQuery = new Query()

            const emailsNotSent: Array<any> = await this._emailService.getAllEmailBus(queryEmails)

            if (emailsNotSent.length) {
                for (const email of emailsNotSent) {
                    if (email.type) {
                        if (email.type === 'welcome') {
                            await this.formatEmailWelcome(email)
                        }

                        if (email.type === 'reset-password') {
                            await this.formatEmailResetPassword(email)
                        }

                        if (email.type === 'updated-password') {
                            await this.formatEmailUpdatePassword(email)
                        }

                        // 1. If send email, delete this email to db
                        await this._emailFromBusRepository.delete(email.id)

                        // 2. If got here, it's because the action was successful.
                        this._logger.info(`Action for event send email successfully performed!`)
                    }
                }
            }
        } catch (error: any) {
            this._logger.warn(`An error occurred while attempting `
                .concat(`send email that is in the db. ${error.message}`)
                .concat(error.description ? ' ' + error.description : ''))
        }
    }

    public async formatEmailWelcome(email: any): Promise<void> {

        const passphrase = 'RegNutes@123'
        const bytes = cryptojs.AES.decrypt(email.password, passphrase)
        const passwordDecrypt = bytes.toString(cryptojs.enc.Utf8)

        const lang: string = email.lang ? email.lang : 'pt-BR'
        const nameList = email.to[0].name.split(' ')
        await this._emailFromBusRepository.sendTemplate(
            'welcome',
            { name: email.to[0].name, email: email.to[0].email },
            {
                name: `${nameList[0]} ${(nameList.length > 1 ? nameList[1] : '')}`,
                email: email.to[0].email,
                password: passwordDecrypt ? passwordDecrypt : undefined,
                action_url: email.action_url
            },
            email,
            lang
        )
    }

    public async formatEmailResetPassword(email: any): Promise<void> {
        const lang: string = email.lang ? email.lang : 'pt-BR'
        await this._emailFromBusRepository.sendTemplate(
            'reset-password',
            { name: email.to[0].name, email: email.to[0].email },
            {
                name: email.to[0].name,
                email: email.to[0].email,
                action_url: email.action_url
            },
            email,
            lang
        )
    }

    public async formatEmailUpdatePassword(email: any): Promise<void> {
        const lang: string = email.lang ? email.lang : 'pt-BR'
        await this._emailFromBusRepository.sendTemplate(
            'updated-password',
            { name: email.to[0].name, email: email.to[0].email },
            {
                name: email.to[0].name,
                email: email.to[0].email,
            },
            email,
            lang
        )
    }
}
