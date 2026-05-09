import type { Metadata } from 'next';
import PublicInfoPage from '@/components/public/PublicInfoPage';

export const metadata: Metadata = {
  title: 'Terms of service',
  description: 'Review the core terms for using Skolr as a learner, parent, or instructor.',
};

export default function TermsPage() {
  return (
    <PublicInfoPage
      eyebrow="Terms"
      title="Skolr terms of service"
      description="These terms summarize the main expectations for learners, parents, and instructors using the Skolr platform."
      sections={[
        {
          title: 'Using the platform',
          body: 'Users should provide accurate account information, protect login access, and use Skolr only for genuine learning, teaching, and platform support purposes.',
        },
        {
          title: 'Subscriptions and access',
          body: 'Paid access follows the active plan attached to the account. Course availability depends on plan level, account role, and learner profile setup where parent-managed learning applies.',
        },
        {
          title: 'Content and conduct',
          body: 'Instructors should submit original or properly authorized learning content. Learners and parents should not misuse platform material, account access, or course resources in ways that harm the service or other users.',
        },
      ]}
      ctaLabel="View courses"
      ctaHref="/courses"
    />
  );
}
