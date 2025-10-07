export interface IRequest<TResponse = void> { }
export interface INotification { }

export interface IRequestHandler<TRequest extends IRequest<TResponse>, TResponse extends void> {
  handle(request: TRequest, )
}