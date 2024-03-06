import Http from '../../../../transport/http/http'
import Logger from '../../../../pkg/logger'
import Usecase from '../../usecase/usecase'
import { NextFunction, Response } from 'express'
import statusCode from '../../../../pkg/statusCode'
import { GithubMerge } from '../../entity/github-merge.interface'
import error from '../../../../pkg/error'
import { Evidence } from '../../entity/interface'
import { GitlabMerge } from '../../entity/gitlab-merge.interface'
import { Qase } from '../../entity/qase.interface'

class Handler {
    constructor(
        private logger: Logger,
        private http: Http,
        private usecase: Usecase
    ) {}

    public GithubMerge() {
        return async (req: any, res: Response, next: NextFunction) => {
            try {
                const body = req.body as GithubMerge
                if (body.action !== 'closed' || !body.pull_request.merged) {
                    throw new error(
                        statusCode.FORBIDDEN,
                        statusCode[statusCode.FORBIDDEN]
                    )
                }

                const evidence: Evidence = {
                    description: body.pull_request.body,
                    source: 'github',
                    attachment: body.pull_request.html_url,
                    participants: [],
                }

                this.usecase.Evidence(evidence)
                this.logger.Info(statusCode[statusCode.OK], {
                    additional_info: this.http.AdditionalInfo(
                        req,
                        statusCode.OK
                    ),
                })

                return res.json({ message: 'Success' })
            } catch (error) {
                return next(error)
            }
        }
    }

    public GitlabMerge() {
        return async (req: any, res: Response, next: NextFunction) => {
            try {
                const body = req.body as GitlabMerge
                if (body.object_attributes.action !== 'merge') {
                    throw new error(
                        statusCode.FORBIDDEN,
                        statusCode[statusCode.FORBIDDEN]
                    )
                }

                const evidence: Evidence = {
                    description: body.object_attributes.description,
                    source: 'gitlab',
                    attachment: body.object_attributes.url,
                    participants: [],
                }

                this.usecase.Evidence(evidence)
                this.logger.Info(statusCode[statusCode.OK], {
                    additional_info: this.http.AdditionalInfo(
                        req,
                        statusCode.OK
                    ),
                })

                return res.json({ message: 'Success' })
            } catch (error) {
                return next(error)
            }
        }
    }

    public Qase() {
        return async (req: any, res: Response, next: NextFunction) => {
            try {
                const body = req.body as Qase

                let description = ''
                if (body.payload.description) {
                    description = decodeURIComponent(
                        body.payload.description.replace(
                            new RegExp('\\\\', 'g'),
                            ''
                        )
                    )
                }

                const evidence: Evidence = {
                    description,
                    source: 'qase',
                    attachment: '',
                    participants: [],
                }

                this.usecase.Evidence(evidence)
                this.logger.Info(statusCode[statusCode.OK], {
                    additional_info: this.http.AdditionalInfo(
                        req,
                        statusCode.OK
                    ),
                })

                return res.json({ message: 'Success' })
            } catch (error) {
                return next(error)
            }
        }
    }
    public Evidence() {
        return async (req: any, res: Response, next: NextFunction) => {
            try {
                const evidence: Evidence = {
                    description: req.body?.description ?? '',
                    source: 'Evidence',
                    attachment: '',
                    participants: [],
                }

                this.usecase.Evidence(evidence)
                this.logger.Info(statusCode[statusCode.OK], {
                    additional_info: this.http.AdditionalInfo(
                        req,
                        statusCode.OK
                    ),
                })

                return res.json({ message: 'Success' })
            } catch (error) {
                return next(error)
            }
        }
    }
}

export default Handler
