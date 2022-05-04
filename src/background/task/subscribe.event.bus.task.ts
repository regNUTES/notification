import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { ILogger } from '../../utils/custom.logger'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { EmailEvent } from '../../application/integration-event/event/email.event'
import { EmailSendEventHandler } from '../../application/integration-event/handler/email.send.event.handler'
import { DIContainer } from '../../di/di'
import { EmailWelcomeEventHandler } from '../../application/integration-event/handler/email.welcome.event.handler'
import { EmailResetPasswordEventHandler } from '../../application/integration-event/handler/email.reset.password.event.handler'
import { EmailUpdatePasswordEventHandler } from '../../application/integration-event/handler/email.update.password.event.handler'
import { EmailPilotStudyDataEventHandler } from '../../application/integration-event/handler/email.pilot.study.data.event.handler'
import { UserDeleteEvent } from '../../application/integration-event/event/user.delete.event'
import { UserDeleteEventHandler } from '../../application/integration-event/handler/user.delete.event.handler'
import { PushSendEvent } from '../../application/integration-event/event/push.send.event'
import { PushSendEventHandler } from '../../application/integration-event/handler/push.send.event.handler'
import { EmailScheduledSurgeryEventHandler } from '../../application/integration-event/handler/email.scheduled.surgery.event.handler'
import { EmailRejectedSurgeryRequestEventHandler } from '../../application/integration-event/handler/email.rejected.request.surgery.event.handler'
import { EmailRejectedCovidRequestEventHandler } from '../../application/integration-event/handler/email.rejected.covid.request.event.handler'
import { EmailReservedBedEventHandler } from '../../application/integration-event/handler/email.reserved.bed.event.handler'

@injectable()
export class SubscribeEventBusTask implements IBackgroundTask {
    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public run(): void {
        this.initializeSubscribe()
    }

    public async stop(): Promise<void> {
        try {
            await this._eventBus.dispose()
        } catch (err: any) {
            return Promise.reject(new Error(`Error stopping SubscribeEventBusTask! ${err.message}`))
        }
    }

    /**
     * Subscribe for all events.
     */
    private initializeSubscribe(): void {
        /**
         * Subscribe in EmailSendEvent
         */
        this._eventBus
            .subscribe(new EmailEvent('EmailSendEvent'),
                new EmailSendEventHandler(DIContainer.get(Identifier.EMAIL_REPOSITORY), this._logger),
                'emails.send')
            .then((result: boolean) => {
                if (result) this._logger.info('Subscribe in EmailSendEvent successful!')
            })
            .catch(err => {
                this._logger.error(`Error in Subscribe EmailSendEvent! ${err.message}`)
            })

        /**
         * Subscribe in EmailWelcomeEvent
         */
        this._eventBus
            .subscribe(new EmailEvent('EmailWelcomeEvent'),
                new EmailWelcomeEventHandler(DIContainer.get(Identifier.EMAIL_FROM_BUS_REPOSITORY), this._logger),
                'emails.welcome')
            .then((result: boolean) => {
                if (result) this._logger.info('Subscribe in EmailWelcomeEvent successful!')
            })
            .catch(err => {
                this._logger.error(`Error in Subscribe EmailWelcomeEvent! ${err.message}`)
            })

        /**
         * Subscribe in EmailResetPasswordEvent
         */
        this._eventBus
            .subscribe(new EmailEvent('EmailResetPasswordEvent'),
                new EmailResetPasswordEventHandler(DIContainer.get(Identifier.EMAIL_FROM_BUS_REPOSITORY), this._logger),
                'emails.reset-password')
            .then((result: boolean) => {
                if (result) this._logger.info('Subscribe in EmailResetPasswordEvent successful!')
            })
            .catch(err => {
                this._logger.error(`Error in Subscribe EmailResetPasswordEvent! ${err.message}`)
            })

        /**
         * Subscribe in EmailUpdatePasswordEvent
         */
        this._eventBus
            .subscribe(new EmailEvent('EmailUpdatePasswordEvent'),
                new EmailUpdatePasswordEventHandler(DIContainer.get(Identifier.EMAIL_FROM_BUS_REPOSITORY), this._logger),
                'emails.update-password')
            .then((result: boolean) => {
                if (result) this._logger.info('Subscribe in EmailUpdatePasswordEvent successful!')
            })
            .catch(err => {
                this._logger.error(`Error in Subscribe EmailUpdatePasswordEvent! ${err.message}`)
            })

        /**
         * Subscribe in EmailScheduledSurgeryEvent
         */
        this._eventBus
            .subscribe(new EmailEvent('EmailScheduledSurgeryEvent'),
                new EmailScheduledSurgeryEventHandler(DIContainer.get(Identifier.EMAIL_REPOSITORY), this._logger),
                'emails.scheduled-surgery')
            .then((result: boolean) => {
                if (result) this._logger.info('Subscribe in EmailScheduledSurgeryEvent successful!')
            })
            .catch(err => {
                this._logger.error(`Error in Subscribe EmailScheduledSurgeryEvent! ${err.message}`)
            })

        /**
         * Subscribe in EmailRejectedRequestEvent
         */
        this._eventBus
            .subscribe(new EmailEvent('EmailRejectedSurgeryRequestEvent'),
                new EmailRejectedSurgeryRequestEventHandler(DIContainer.get(Identifier.EMAIL_REPOSITORY), this._logger),
                'emails.rejected-surgery-request')
            .then((result: boolean) => {
                if (result) this._logger.info('Subscribe in EmailRejectedSurgeryRequestEvent successful!')
            })
            .catch(err => {
                this._logger.error(`Error in Subscribe EmailRejectedSurgeryRequestEvent! ${err.message}`)
            })

        /**
         *  Subscribe in EmailRejectedCovidRequestEvent
         */
        this._eventBus
            .subscribe(new EmailEvent('EmailRejectedCovidRequestEvent'),
                new EmailRejectedCovidRequestEventHandler(DIContainer.get(Identifier.EMAIL_REPOSITORY), this._logger),
                'emails.rejected-covid-request')
            .then((result: boolean) => {
                if (result) this._logger.info('Subscribe in EmailRejectedCovidRequestEvent successful!')
            })
            .catch(err => {
                this._logger.error(`Error in Subscribe EmailRejectedCovidRequestEvent! ${err.message}`)
            })

        /**
         * Subscribe in EmailReservedBedEvent
         */
        this._eventBus
            .subscribe(new EmailEvent('EmailReservedBedEvent'),
                new EmailReservedBedEventHandler(DIContainer.get(Identifier.EMAIL_REPOSITORY), this._logger),
                'emails.reserved-bed')
            .then((result: boolean) => {
                if (result) this._logger.info('Subscribe in EmailReservedBedEvent successful!')
            })
            .catch(err => {
                this._logger.error(`Error in Subscribe EmailReservedBedEvent! ${err.message}`)
            })

        /**
         * Subscribe in EmailPilotStudyDataEvent
         */
        this._eventBus
            .subscribe(new EmailEvent('EmailPilotStudyDataEvent'),
                new EmailPilotStudyDataEventHandler(DIContainer.get(Identifier.EMAIL_REPOSITORY), this._logger),
                'emails.pilotstudies-data')
            .then((result: boolean) => {
                if (result) this._logger.info('Subscribe in EmailPilotStudyDataEvent successful!')
            })
            .catch(err => {
                this._logger.error(`Error in Subscribe EmailPilotStudyDataEvent! ${err.message}`)
            })

        /**
         * Subscribe in UserDeleteEvent
         */
        this._eventBus
            .subscribe(new UserDeleteEvent(),
                new UserDeleteEventHandler(DIContainer.get(Identifier.EMAIL_REPOSITORY), this._logger),
                UserDeleteEvent.ROUTING_KEY)
            .then((result: boolean) => {
                if (result) this._logger.info('Subscribe in UserDeleteEvent successful!')
            })
            .catch(err => {
                this._logger.error(`Error in Subscribe UserDeleteEvent! ${err.message}`)
            })
        /**
         * Subscribe in UserDeleteEvent
         */
        this._eventBus
            .subscribe(new PushSendEvent(),
                new PushSendEventHandler(DIContainer.get(Identifier.PUSH_SERVICE), this._logger),
                PushSendEvent.ROUTING_KEY)
            .then((result: boolean) => {
                if (result) this._logger.info('Subscribe in PushSendEvent successful!')
            })
            .catch(err => {
                this._logger.error(`Error in Subscribe PushSendEvent! ${err.message}`)
            })
    }
}
