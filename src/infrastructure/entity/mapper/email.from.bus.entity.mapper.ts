import { injectable } from 'inversify'
import { Address } from '../../../application/domain/model/address'
import { EmailFromBus } from '../../../application/domain/model/email.from.bus'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { EmailFromBusEntity } from '../email.from.bus.entity'

@injectable()
export class EmailFromBusEntityMapper implements IEntityMapper<EmailFromBus, EmailFromBusEntity> {
    public transform(item: any): any {
        if (item instanceof EmailFromBus) return this.modelToModelEntity(item)
        return this.jsonToModel(item) // json
    }

    public modelToModelEntity(item: EmailFromBus): EmailFromBusEntity {
        const result: EmailFromBusEntity = new EmailFromBusEntity()

        if (item.id) result.id = item.id
        result.to = item.to ? item.to.map(elem => elem.toJSON()) : []
        if (item.action_url) result.action_url = item.action_url
        if (item.password) result.password = item.password
        if (item.type) result.type = item.type
        return result
    }

    public jsonToModel(json: any): EmailFromBus {
        const result: EmailFromBus = new EmailFromBus()

        if (!json) return result

        if (json.id !== undefined) result.id = json.id
        if (json.created_at !== undefined) result.createdAt = json.created_at
        if (json.to !== undefined && json.to instanceof Array) {
            result.to = json.to.map(item => new Address().fromJSON(item))
        }
        if (json.action_url !== undefined) result.action_url = json.action_url
        if (json.password !== undefined) result.password = json.password
        if (json.type !== undefined) result.type = json.type

        return result
    }
}
