import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { Address } from './address'
import { Email } from './email'

export class EmailFromBus extends Email implements IJSONSerializable, IJSONDeserializable<EmailFromBus> {
    private _action_url!: string
    private _password?: string
    private _type?: string

    constructor() {
        super()
    }

    get action_url(): string {
        return this._action_url
    }

    set action_url(value: string) {
        this._action_url = value
    }

    get password(): string | undefined {
        return this._password
    }

    set password(value: string | undefined) {
        this._password = value
    }

    get type(): string | undefined {
        return this._type
    }

    set type(value: string | undefined) {
        this._type = value
    }

    public toJSON(): any {
        return {
            id: super.id,
            created_at: this.createdAt,
            to: super.to ? super.to.map(item => item.toJSON()) : [],
            action_url: this.action_url,
            password: this.password,
            type: this.type
        }
    }

    public fromJSON(json: any): EmailFromBus {
        if (!json) return this
        if (JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }
        if (json.id !== undefined) super.id = json.id
        if (json.created_at !== undefined) this.createdAt = json.created_at
        if (json.to !== undefined && json.to instanceof Array) {
            this.to = json.to.map(item => new Address().fromJSON(item))
        }
        if (json.action_url !== undefined) this.action_url = json.action_url
        if (json.password !== undefined) this.password = json.password
        if (json.type !== undefined) this.type = json.type

        return this
    }
}
