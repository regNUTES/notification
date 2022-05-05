import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { ILogger } from '../../../utils/custom.logger'
import { EmailEvent } from '../event/email.event'
import { EmailWelcomeValidator } from '../../domain/validator/email.welcome.validator'
import { IEmailFromUsersRepository } from '../../port/email.from.users.repository.interface'

export class EmailWelcomeEventHandler implements IIntegrationEventHandler<EmailEvent> {
    /**
     * Creates an instance of EmailWelcomeEventHandler.
     *
     * @param _emailFromUsersRepository
     * @param _logger
     */
    constructor(
        @inject(Identifier.EMAIL_FROM_USERS_REPOSITORY) public readonly _emailFromUsersRepository: IEmailFromUsersRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async handle(event: EmailEvent): Promise<void> {
        try {
            const email: any = event.email

            // 1. Validate object based on create action.
            EmailWelcomeValidator.validate(email)

            // 2 Configure email and send
            const lang: string = email.lang ? email.lang : 'pt-BR'
            const nameList = email.to.name.split(' ')
            await this._emailFromUsersRepository.sendTemplate(
                'welcome',
                { name: email.to.name, email: email.to.email },
                {
                    name: `${nameList[0]} ${(nameList.length > 1 ? nameList[1] : '')}`,
                    email: email.to.email,
                    password: email.password ? email.password : undefined,
                    action_url: email.action_url
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
