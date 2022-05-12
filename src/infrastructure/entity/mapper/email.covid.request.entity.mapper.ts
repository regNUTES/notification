import { EmailCovidRequest } from '../../../application/domain/model/email.covid.request'
import { IEntityMapper } from '../../../infrastructure/port/entity.mapper.interface'
import { injectable } from 'inversify'
import { Address } from '../../../application/domain/model/address'
import { EmailCovidRequestEntity } from '../email.covid.request.entity'

@injectable()
export class EmailCovidRequestEntityMapper implements IEntityMapper<EmailCovidRequest, EmailCovidRequestEntity> {

    public transform(item: any): any {
        if (item instanceof EmailCovidRequest) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    public modelToModelEntity(item: EmailCovidRequest): EmailCovidRequestEntity {
        const result: EmailCovidRequestEntity = new EmailCovidRequestEntity()

        if (item.id) result.id = item.id
        result.to = item.to ? item.to.map(elem => elem.toJSON()) : []
        if (item.request_code) result.request_code = item.request_code
        if (item.municipality) result.municipality = item.municipality
        if (item.health_unit) result.health_unit = item.health_unit
        if (item.bed_code) result.bed_code = item.bed_code
        if (item.bed) result.bed = item.bed
        if (item.operation) result.operation = item.operation
        if (item.type) result.type = item.type
        return result
    }

    public jsonToModel(json: any): EmailCovidRequest {
        const result: EmailCovidRequest = new EmailCovidRequest()

        if (!json) return result

        if (json.id !== undefined) result.id = json.id
        if (json.created_at !== undefined) result.createdAt = json.created_at
        if (json.to !== undefined && json.to instanceof Array) {
            result.to = json.to.map(item => new Address().fromJSON(item))
        }
        if (json.request_code !== undefined) result.request_code = json.request_code
        if (json.municipality !== undefined) result.municipality = json.municipality
        if (json.health_unit !== undefined) result.health_unit = json.health_unit
        if (json.bed_code !== undefined) result.bed_code = json.bed_code
        if (json.bed !== undefined) result.bed = json.bed
        if (json.operation !== undefined) result.operation = json.operation
        if (json.type !== undefined) result.type = json.type

        return result
    }
}
