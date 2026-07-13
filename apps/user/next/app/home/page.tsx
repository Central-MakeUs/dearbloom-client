import { Button } from '@dearbloom/ui';

export default function HomePage() {
  const header = (
    <header className="flex flex-col gap-2">
      <h1 className="text-head-1 text-neutral-950">Customer 홈 (작품 피드)</h1>
      <p className="text-body-5 text-neutral-600">route: /home</p>
    </header>
  );

  const variantSection = (
    <section className="flex flex-col gap-4">
      <h2 className="text-head-2 text-neutral-900">Variants</h2>
      <div className="flex flex-wrap items-center gap-4">
        <Button>Get Started</Button>
        <Button variant="secondary">Learn More</Button>
        <Button variant="ghost">View Portfolio</Button>
        <Button variant="dark">Sign Up</Button>
      </div>
    </section>
  );

  const sizeSection = (
    <section className="flex flex-col gap-4">
      <h2 className="text-head-2 text-neutral-900">Sizes</h2>
      <div className="flex flex-wrap items-center gap-4">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </section>
  );

  const stateSection = (
    <section className="flex flex-col gap-4">
      <h2 className="text-head-2 text-neutral-900">States</h2>
      <div className="flex flex-wrap items-center gap-4">
        <Button icon={false}>No Icon</Button>
        <Button disabled>Disabled</Button>
        <Button variant="ghost" size="lg">
          Explore Snaps
        </Button>
      </div>
    </section>
  );

  return (
    <div className="flex flex-col gap-12 p-10">
      {header}
      {variantSection}
      {sizeSection}
      {stateSection}
    </div>
  );
}
