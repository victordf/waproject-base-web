export default interface IRequest {
  id?: number;
  description: string;
  amount: number;
  value: number;

  createdDate?: Date;
  updatedDate?: Date;
}
