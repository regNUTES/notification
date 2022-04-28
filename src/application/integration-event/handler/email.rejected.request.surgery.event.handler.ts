import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { EmailRejectedRequestValidator } from '../../domain/validator/email.rejected.request.validator'
import { IEmailRepository } from '../../port/email.repository.interface'
import { EmailEvent } from '../event/email.event'
import { IIntegrationEventHandler } from './integration.event.handler.interface'

export class EmailRejectedSurgeryRequestEventHandler implements IIntegrationEventHandler<EmailEvent> {

    /**
     * Creates an instance of EmailRejectedSurgeryRequestEventHandler.
     * @param _emailFromBusRepository 
     * @param _logger 
     */
    constructor(
        @inject(Identifier.EMAIL_REPOSITORY) private readonly _emailRepository: IEmailRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async handle(event: EmailEvent): Promise<void> {
        try {
            const email: any = event.email

            // 1. Validate object based on create action.
            EmailRejectedRequestValidator.validate(email)

            // 2 Configure email and send
            const nameList = email.to.name.split(' ')
            const health_unit_name: string = email.data.health_unit ? email.data.health_unit : '_'
            const surgery_name: string = email.data.surgery ? email.data.surgery : '_'

            await this._emailRepository.sendTemplate(
                email.operation,
                { name: email.to.name, email: email.to.email },
                {
                    name: `${nameList[0]} ${(nameList.length > 1 ? nameList[1] : '')}`,
                    request_code: email.data.request_code,
                    municipality: email.data.municipality,
                    health_unit: health_unit_name,
                    surgery: surgery_name
                },
                email,
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
