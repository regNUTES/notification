import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { EmailReservedBedValidator } from '../../domain/validator/email.reserved.bed.validator'
import { EmailEvent } from '../event/email.event'
import { IIntegrationEventHandler } from './integration.event.handler.interface'
import { IEmailCovidRequestRepository } from '../../port/email.covid.request.repository.interface'

export class EmailReservedBedEventHandler implements IIntegrationEventHandler<EmailEvent> {

    /**
     * Creates an instance of EmailReservedBedEventHandler.
     * 
     * @param _emailCovidRepository 
     * @param _logger 
     */
    constructor(
        @inject(Identifier.EMAIL_COVID_REQUEST_REPOSITORY) private readonly _emailCovidRepository: IEmailCovidRequestRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async handle(event: EmailEvent): Promise<void> {
        try {

            const email: any = event.email

            // 1. Validate object based on create action.
            EmailReservedBedValidator.validate(email)

            // 2 Configure email and send
            const nameList = email.to.name.split(' ')

            await this._emailCovidRepository.sendTemplate(
                email.operation,
                { name: email.to.name, email: email.to.email },
                {
                    name: `${nameList[0]} ${(nameList.length > 1 ? nameList[1] : '')}`,
                    request_code: email.data.request_code,
                    municipality: email.data.municipality,
                    health_unit: email.data.health_unit,
                    bed_code: email.data.bed_code,
                    bed: email.data.bed
                },
                email
            )
        } catch (err: any) {
            this._logger.warn(`An error occurred while attempting `
                .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
                .concat(err.description ? ' ' + err.description : ''))
        }
    }
}
