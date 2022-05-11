import { EmailSurgeryRequest } from '../domain/model/email.surgery.request'
import { IRepository } from './repository.interface'

export interface IEmailSurgeryRequestRepository extends IRepository<EmailSurgeryRequest> {

    /**
     *  Send email about surgery process using a predefined template.
     * @param name 
     * @param to 
     * @param data 
     * @param email 
     * @param lang 
     */
    sendTemplate(name: string, to: any, data: any, email: EmailSurgeryRequest, lang?: string): Promise<void>
}
