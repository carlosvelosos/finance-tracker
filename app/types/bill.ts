export type Bill = {
  id: number;
  description: string;
  dueDay: string;
  paymentMethod: string;
  country: string;
  value: number;
  paid: boolean;
}; 