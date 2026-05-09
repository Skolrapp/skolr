import type { Metadata } from 'next';
import PublicInfoPage from '@/components/public/PublicInfoPage';

export const metadata: Metadata = {
  title: 'Contact Skolr',
  description: 'Reach Skolr for learner support, parent account help, and platform questions.',
};

export default function ContactPage() {
  return (
    <PublicInfoPage
      eyebrow="Contact"
      title="Talk to the Skolr team"
      description="Use this page as your direct route for support questions, subscription follow-up, and platform guidance while the dedicated contact workflow continues to grow."
      sections={[
        {
          title: 'Support requests',
          body: 'For account access, learner progress, or class availability, contact Skolr support through the contact details shared in your official onboarding or support channels.',
        },
        {
          title: 'Parent and learner help',
          body: 'If you are managing multiple learners, include the parent account phone number and the learner name when requesting help so the issue can be traced faster.',
        },
        {
          title: 'Instructor and partnership questions',
          body: 'Teaching, content, or partnership requests should include your name, your area of expertise, and the classes or subjects you want to discuss with the Skolr team.',
        },
      ]}
      ctaLabel="Back to home"
      ctaHref="/"
    />
  );
}
