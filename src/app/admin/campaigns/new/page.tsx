import { getRemainingDailyBudget } from '@/lib/campaigns';
import Composer from './composer';

export default async function NewCampaignPage() {
  const remaining = await getRemainingDailyBudget();
  return <Composer initialRemainingToday={remaining} />;
}
