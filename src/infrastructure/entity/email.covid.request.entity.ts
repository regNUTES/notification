import { EmailEntity } from './email.entity'

export class EmailCovidRequestEntity extends EmailEntity {
    public request_code?: any
    public municipality?: any
    public health_unit?: any
    public bed_code?: any
    public bed?: any
    public operation?: any
    public type?: any
}
