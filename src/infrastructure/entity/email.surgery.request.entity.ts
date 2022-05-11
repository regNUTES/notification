import { EmailEntity } from './email.entity'

export class EmailSurgeryRequestEntity extends EmailEntity {
    public request_code?: any
    public municipality?: any
    public health_unit?: any
    public surgery?: any
    public surgery_scheduling_date?: any
    public operation?: any
    public type?: any
}
