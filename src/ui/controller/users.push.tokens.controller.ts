import HttpStatus from 'http-status-codes'
import { inject } from 'inversify'
import { controller, httpDelete, httpGet, httpPut, request, response } from 'inversify-express-utils'
import { Request, Response } from 'express'
import { Identifier } from '../../di/identifiers'
import { ApiExceptionManager } from '../exception/api.exception.manager'
import { IPushTokenService } from '../../application/port/push.token.service.interface'
import { PushToken, PushTokenClientTypes } from '../../application/domain/model/push.token'

@controller('/v1/users/:user_id/push')
export class UsersPushTokensController {

    constructor(
        @inject(Identifier.PUSH_TOKEN_SERVICE) private readonly _pushTokenService: IPushTokenService
    ) {
    }

    @httpGet('/tokens')
    public async getPushTokensFromUser(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const resultWebToken: PushToken | undefined =
                await this._pushTokenService.findFromUserAndType(req.params.user_id, PushTokenClientTypes.WEB)
            const resultMobileToken: PushToken | undefined =
                await this._pushTokenService.findFromUserAndType(req.params.user_id, PushTokenClientTypes.MOBILE)

            const result = {
                web_token: resultWebToken?.token ? resultWebToken.token : '',
                mobile_token: resultMobileToken?.token ? resultMobileToken.token : ''
            }
            return res.status(HttpStatus.OK).send(result)
        } catch (err: any) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code).send(handlerError.toJSON())
        }
    }

    @httpPut('/:client_type/tokens')
    public async createOrUpdatePushTokenForUser(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            const push_token: PushToken = new PushToken().fromJSON(req.body)
            push_token.user_id = req.params.user_id
            push_token.client_type = req.params.client_type
            await this._pushTokenService.createOrUpdate(push_token)
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err: any) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code).send(handlerError.toJSON())
        }
    }

    @httpDelete('/:client_type/tokens')
    public async deletePushTokenFromUser(@request() req: Request, @response() res: Response): Promise<Response> {
        try {
            await this._pushTokenService.deleteFromUser(req.params.user_id, req.params.client_type)
            return res.status(HttpStatus.NO_CONTENT).send()
        } catch (err: any) {
            const handlerError = ApiExceptionManager.build(err)
            return res.status(handlerError.code).send(handlerError.toJSON())
        }
    }
}
