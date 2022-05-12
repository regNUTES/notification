import { EmailCovidRequest } from '../domain/model/email.covid.request'
import { IRepository } from './repository.interface'

export interface IEmailCovidRequestRepository extends IRepository<EmailCovidRequest> {

    /**
     *  Send email about covid request process using a predefined template.
     * @param name 
     * @param to 
     * @param data 
     * @param email 
     * @param lang 
     */
    sendTemplate(name: string, to: any, data: any, email: EmailCovidRequest, lang?: string): Promise<void>
}
