export default async function Page() {
  const { HeroWelcome } = await import("@/components/hero-welcome");
  return <HeroWelcome />;
}
