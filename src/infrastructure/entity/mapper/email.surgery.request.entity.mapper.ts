import { Address } from '../../../application/domain/model/address'
import { EmailSurgeryRequest } from '../../../application/domain/model/email.surgery.request'
import { IEntityMapper } from '../../../infrastructure/port/entity.mapper.interface'
import { injectable } from 'inversify'
import { EmailSurgeryRequestEntity } from '../email.surgery.request.entity'


@injectable()
export class EmailSurgeryRequestEntityMapper implements IEntityMapper<EmailSurgeryRequest, EmailSurgeryRequestEntity> {

    public transform(item: any): any {
        if (item instanceof EmailSurgeryRequest) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    public modelToModelEntity(item: EmailSurgeryRequest): EmailSurgeryRequestEntity {
        const result: EmailSurgeryRequestEntity = new EmailSurgeryRequestEntity()

        if (item.id) result.id = item.id
        result.to = item.to ? item.to.map(elem => elem.toJSON()) : []
        if (item.request_code) result.request_code = item.request_code
        if (item.municipality) result.municipality = item.municipality
        if (item.health_unit) result.health_unit = item.health_unit
        if (item.surgery) result.surgery = item.surgery
        if (item.surgery_scheduling_date) result.surgery_scheduling_date = item.surgery_scheduling_date
        if (item.operation) result.operation = item.operation
        if (item.type) result.type = item.type
        return result
    }

    public jsonToModel(json: any): EmailSurgeryRequest {
        const result: EmailSurgeryRequest = new EmailSurgeryRequest()

        if (!json) return result

        if (json.id !== undefined) result.id = json.id
        if (json.created_at !== undefined) result.createdAt = json.created_at
        if (json.to !== undefined && json.to instanceof Array) {
            result.to = json.to.map(item => new Address().fromJSON(item))
        }
        if (json.request_code !== undefined) result.request_code = json.request_code
        if (json.municipality !== undefined) result.municipality = json.municipality
        if (json.health_unit !== undefined) result.health_unit = json.health_unit
        if (json.surgery !== undefined) result.surgery = json.surgery
        if (json.surgery_scheduling_date !== undefined) result.surgery_scheduling_date = json.surgery_scheduling_date
        if (json.operation !== undefined) result.operation = json.operation
        if (json.type !== undefined) result.type = json.type

        return result
    }
}
