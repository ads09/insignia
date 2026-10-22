import { http } from '@/shared/api/http';

interface TransferRequest {
  to_username: string;
  amount: number;
}

export async function getBalance(): Promise<number> {
  const { data } = await http.get<{ balance: number }>('/balance');
  return data.balance;
}

export async function topUp(amount: number): Promise<void> {
  await http.post('/topup', { amount });
}

export async function transfer(request: TransferRequest): Promise<void> {
  await http.post('/transfer', request);
}
