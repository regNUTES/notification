import { EmailFromBus } from '../domain/model/email.from.bus'
import { IRepository } from './repository.interface'

/**
 * Interface of the email from bus repository.
 * Must be implemented by the email repository at the infrastructure layer.
 *
 * @see {@link PhysicalActivityRepository} for further information.
 * @extends {IRepository<Email>}
 */
export interface IEmailFromBusRepository extends IRepository<EmailFromBus> {

    /**
     * Send email using a predefined template.
     *
     * @param name
     * @param to
     * @param data
     * @param lang
     * @return {Promise<void>}
     * @throws {ValidationException | RepositoryException}
     */
    sendTemplate(name: string, to: any, data: any, email: EmailFromBus, lang?: string): Promise<void>
}
