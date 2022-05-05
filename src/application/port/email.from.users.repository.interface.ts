import { EmailFromUsers } from '../domain/model/email.from.users'
import { IRepository } from './repository.interface'

/**
 * Interface of the email from bus repository.
 * Must be implemented by the email repository at the infrastructure layer.
 *
 * @see {@link PhysicalActivityRepository} for further information.
 * @extends {IRepository<Email>}
 */
export interface IEmailFromUsersRepository extends IRepository<EmailFromUsers> {

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
    sendTemplate(name: string, to: any, data: any, email: EmailFromUsers, lang?: string): Promise<void>
}
