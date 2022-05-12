import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { Address } from './address'
import { Email } from './email'

export class EmailCovidRequest extends Email implements IJSONSerializable, IJSONDeserializable<EmailCovidRequest> {

    private _request_code!: string
    private _municipality!: string
    private _health_unit!: string
    private _bed_code!: string
    private _bed!: string
    private _operation!: string
    private _type!: string

    constructor() {
        super()
    }

    get request_code(): string {
        return this._request_code
    }

    set request_code(value: string) {
        this._request_code = value
    }

    get municipality(): string {
        return this._municipality
    }

    set municipality(value: string) {
        this._municipality = value
    }


    get health_unit(): string {
        return this._health_unit
    }

    set health_unit(value: string) {
        this._health_unit = value
    }


    get bed_code(): string {
        return this._bed_code
    }

    set bed_code(value: string) {
        this._bed_code = value
    }

    get bed(): string {
        return this._bed
    }

    set bed(value: string) {
        this._bed = value
    }

    get operation(): string {
        return this._operation
    }

    set operation(value: string) {
        this._operation = value
    }

    get type(): string {
        return this._type
    }

    set type(value: string) {
        this._type = value
    }

    public toJSON(): any {
        return {
            id: super.id,
            created_at: this.createdAt,
            to: super.to ? super.to.map(item => item.toJSON()) : [],
            request_code: this.request_code,
            municipality: this.municipality,
            health_unit: this.health_unit,
            bed_code: this.bed_code,
            bed: this.bed,
            operation: this.operation,
            type: this.type
        }
    }

    public fromJSON(json: any): EmailCovidRequest {
        if (!json) return this
        if (JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }
        if (json.id !== undefined) super.id = json.id
        if (json.created_at !== undefined) this.createdAt = json.created_at
        if (json.to !== undefined && json.to instanceof Array) {
            this.to = json.to.map(item => new Address().fromJSON(item))
        }
        if (json.request_code !== undefined) this.request_code = json.request_code
        if (json.municipality !== undefined) this.municipality = json.municipality
        if (json.health_unit !== undefined) this.health_unit = json.health_unit
        if (json.bed_code !== undefined) this.bed_code = json.bed_code
        if (json.bed !== undefined) this.bed = json.bed
        if (json.operation !== undefined) this.operation = json.operation

        return this
    }
}
