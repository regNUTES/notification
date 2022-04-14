import { Config } from '../utils/config'
import { inject, injectable } from 'inversify'
import { Identifier } from '../di/identifiers'
import { ILogger } from '../utils/custom.logger'
import { IConnectionDB } from '../infrastructure/port/connection.db.interface'
import { IBackgroundTask } from '../application/port/background.task.interface'
import { IEventBus } from '../infrastructure/port/event.bus.interface'
import { IConnectionFirebase } from '../infrastructure/port/connection.firebase.interface'
import { EmailsNotSentTask } from './task/email.not.sent.task'
import { DIContainer } from '../di/di'
import { IEmailService } from '../application/port/email.service.interface'
import { Default } from '../utils/default'
import { IEmailFromBusRepository } from '../application/port/email.from.bus.repository.interface'

@injectable()
export class BackgroundService {

    private _emailsNotSentTask: IBackgroundTask = new EmailsNotSentTask(
        DIContainer.get<IEmailService>(Identifier.EMAIL_SERVICE),
        DIContainer.get<IEmailFromBusRepository>(Identifier.EMAIL_FROM_BUS_REPOSITORY),
        this._logger,
        process.env.EXPRESSION_DONT_SENT_EMAILS || Default.EXPRESSION_DONT_SENT_EMAILS
    )

    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.MONGODB_CONNECTION) private readonly _mongodb: IConnectionDB,
        @inject(Identifier.FIREBASE_CONNECTION) private readonly _firebase: IConnectionFirebase,
        @inject(Identifier.SUBSCRIBE_EVENT_BUS_TASK) private readonly _subscribeTask: IBackgroundTask,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async startServices(): Promise<void> {
        try {
            // Trying to connect to mongodb.
            // Go ahead only when the run is resolved.
            // Since the application depends on the database connection to work.
            const dbConfigs = Config.getMongoConfig()
            await this._mongodb.tryConnect(dbConfigs.uri, dbConfigs.options)

            // Initializes the Firebase SDK.
            this._initFirebase()

            // Opens RabbitMQ connection to perform tasks
            this._startTasks()
        } catch (err: any) {
            return Promise.reject(new Error(`Error initializing services in background! ${err.message}`))
        }
    }

    public async stopServices(): Promise<void> {
        try {
            await this._mongodb.dispose()

            await this._subscribeTask.stop()
            await this._emailsNotSentTask.stop()
        } catch (err: any) {
            return Promise.reject(new Error(`Error stopping background services! ${err.message}`))
        }
    }

    /**
     * Initializes Firebase connection
     */
    private _initFirebase(): void {
        const firebaseConfigs = Config.getFirebaseConfig()

        if (firebaseConfigs.options.is_enable) {
            this._firebase
                .open(firebaseConfigs.options)
                .then(() => {
                    this._logger.info('Connection to Google Firebase successful!')
                })
                .catch(err => {
                    this._logger.error(`Could not initialize the Firebase SDK: ${err.message}`)
                })
        }
    }

    /**
     * Open RabbitMQ connection and perform tasks
     */
    private _startTasks(): void {
        const rabbitConfigs = Config.getRabbitConfig()

        this._eventBus
            .connectionSub
            .open(rabbitConfigs.uri, rabbitConfigs.options)
            .then((conn) => {
                this._logger.info('Subscribe connection established!')

                conn.on('disconnected', () => this._logger.warn('Subscribe connection has been lost...'))
                conn.on('reestablished', () => this._logger.info('Subscribe connection re-established!'))

                this._subscribeTask.run()
            })
            .catch(err => {
                this._logger.error(`Error trying to get connection to Event Bus for event subscribing. ${err.message}`)
            })

        this._emailsNotSentTask.run()
    }
}
