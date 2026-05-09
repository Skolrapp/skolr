import type { Metadata } from 'next';
import PublicInfoPage from '@/components/public/PublicInfoPage';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'Read how Skolr handles account, learner, and usage information across the platform.',
};

export default function PrivacyPage() {
  return (
    <PublicInfoPage
      eyebrow="Privacy"
      title="Skolr privacy policy"
      description="This summary explains how Skolr handles learner, parent, and instructor information so every footer link leads somewhere clear and useful."
      sections={[
        {
          title: 'Information we use',
          body: 'Skolr uses account details such as name, phone number, subscription data, learner profile information, and progress activity to deliver classes and support the right learner experience.',
        },
        {
          title: 'How it supports learning',
          body: 'Learning activity, enrollments, and watch progress are used to resume classes, personalize dashboards, and help parents or instructors understand engagement where that experience applies.',
        },
        {
          title: 'Protection and access',
          body: 'Platform access is protected through authenticated sessions and administrative controls. Sensitive information should only be accessed by authorized users for product support, security, or service delivery.',
        },
      ]}
      ctaLabel="Read terms"
      ctaHref="/terms"
    />
  );
}
