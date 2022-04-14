import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { ILogger } from '../../../utils/custom.logger'
import { EmailEvent } from '../event/email.event'
import { IEmailRepository } from '../../port/email.repository.interface'
import { EmailUpdatePasswordValidator } from '../../domain/validator/email.update.password.validator'

export class EmailUpdatePasswordEventHandler implements IIntegrationEventHandler<EmailEvent> {
    /**
     * Creates an instance of EmailUpdatePasswordEventHandler.
     *
     * @param _emailRepository
     * @param _logger
     */
    constructor(
        @inject(Identifier.EMAIL_FROM_BUS_REPOSITORY) public readonly _emailFromBusRepository: IEmailRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async handle(event: EmailEvent): Promise<void> {
        try {
            const email: any = event.email

            // 1. Validate object based on create action.
            EmailUpdatePasswordValidator.validate(email)

            // 2 Configure email and send
            const lang: string = email.lang ? email.lang : 'pt-BR'
            await this._emailFromBusRepository.sendTemplate(
                'updated-password',
                { name: email.to.name, email: email.to.email },
                {
                    name: email.to.name,
                    email: email.to.email
                },
                email,
                lang
            )
            // 3. If got here, it's because the action was successful.
            this._logger.info(`Action for event ${event.event_name} successfully performed!`)
        } catch (err: any) {
            this._logger.warn(`An error occurred while attempting `
                .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
                .concat(err.description ? ' ' + err.description : ''))
        }
    }
}
