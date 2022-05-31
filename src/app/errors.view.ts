import { HTTPError } from '@youwol/http-clients'
import { VirtualDOM } from '@youwol/flux-view'

export class HTTPErrorView implements VirtualDOM {
    public readonly class =
        'w-100 mx-auto my-auto fv-text-error text-center p-5'
    public readonly children: VirtualDOM[]

    constructor(params: { packageName: string; error: HTTPError }) {
        const factory = {
            401: `You are not authorized to access the package ${params.packageName}`,
            404: `The package ${params.packageName} is not found`,
        }

        this.children = [
            {
                innerText:
                    factory[params.error.status] ||
                    'Internal server error while retrieving the package',
            },
        ]
    }
}
