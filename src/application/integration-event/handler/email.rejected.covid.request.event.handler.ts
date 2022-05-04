import { inject } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { EmailRejectedCovidRequestValidator } from '../../domain/validator/email.reject.covid.request.validator'
import { IEmailRepository } from '../../port/email.repository.interface'
import { EmailEvent } from '../event/email.event'
import { IIntegrationEventHandler } from './integration.event.handler.interface'



export class EmailRejectedCovidRequestEventHandler implements IIntegrationEventHandler<EmailEvent> {

    /**
     * Creates an instance of EmailRejectedCovidRequestEventHandler.
     * @param _emailRepository 
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
            EmailRejectedCovidRequestValidator.validate(email)

            // 2 Configure email and send
            const nameList = email.to.name.split(' ')
            const healthUnitName: string = email.data.health_unit ? email.data.health_unit : '_'
            const bedCode: string = email.data.bed_code ? email.data.bed_code : '_'
            const bedName: string = email.data.bed ? email.data.bed : '_'

            await this._emailRepository.sendTemplate(
                email.operation,
                { name: email.to.name, email: email.to.email },
                {
                    name: `${nameList[0]} ${(nameList.length > 1 ? nameList[1] : '')}`,
                    request_code: email.data.request_code,
                    municipality: email.data.municipality,
                    health_unit: healthUnitName,
                    bed_code: bedCode,
                    bed: bedName
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
