import DashboardComponent from "@/components/DashboardComponent";

export default async function Dashboard({
  params,
}: {
  params: Promise<{ market: string }>;
}) {
  const market = (await params).market;

  return (
    <>
      <DashboardComponent symbol={market} />
    </>
  );
}
