import type { Metadata } from 'next';
import PublicInfoPage from '@/components/public/PublicInfoPage';

export const metadata: Metadata = {
  title: 'Help and support',
  description: 'Get help using Skolr, from account access to subscriptions and course guidance.',
};

export default function HelpPage() {
  return (
    <PublicInfoPage
      eyebrow="Support"
      title="Help using Skolr"
      description="Find the fastest route for login issues, course access, parent accounts, and subscriptions without getting stuck in the app."
      sections={[
        {
          title: 'Account access',
          body: 'Use your registered phone number to sign in. If login is blocked, reset from the sign-in page or contact support so the team can help you recover access securely.',
        },
        {
          title: 'Courses and study access',
          body: 'If a course does not open, first confirm your subscription is active and that the class level matches your plan. Parent accounts should also confirm the correct learner profile is active on the device.',
        },
        {
          title: 'Payments and subscriptions',
          body: 'Subscription help covers plan selection, free trial questions, and payment follow-up after a successful mobile money transaction. If access does not update after payment, share the transaction reference with support.',
        },
      ]}
      ctaLabel="Open pricing"
      ctaHref="/pricing"
    />
  );
}
