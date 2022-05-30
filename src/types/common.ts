import { Request } from "express"
import { ValidationError } from "express-validator"

export interface RequestType<Res, Req, Query, D, Params = any> extends Request<Params, Res, Req, Query> {
    data?: D
}

export type BaseResponse<D, E = ValidationError[]> = {
    message: string
    data?: D
    errors?: E
}