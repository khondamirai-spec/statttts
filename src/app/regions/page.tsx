import Link from "next/link";
import RegionCard from "@/components/RegionCard";
import { getRegions } from "@/lib/api";
import { formatNumber, toNumber } from "@/lib/utils";

function normalizeRegions(rows: Awaited<ReturnType<typeof getRegions>>) {
  if (!rows) return [];
  return rows
    .map((row, index) => ({
      region: row.region ?? row.name ?? `Viloyat ${index + 1}`,
      users: toNumber(row.users),
      views: toNumber(row.views),
      certificates: toNumber(row.certificates),
    }))
    .sort((a, b) => b.users - a.users);
}

export default async function RegionsPage() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  const data = normalizeRegions(
    await getRegions({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    }),
  );

  const topRegions = data.slice(0, 6);

  return (
    <section className="regions-page space-y-8">
      <div className="card glass-panel space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Viloyatlar ro’yxati
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Hududlar</h1>
            <p className="text-sm text-slate-500">
              {start.toLocaleDateString("uz-UZ")} —{" "}
              {end.toLocaleDateString("uz-UZ")}
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full bg-slate-900/90 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-900"
          >
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topRegions.map((region, index) => (
          <RegionCard
            key={region.region}
            title={region.region}
            value={region.users}
            accent={["purple", "orange", "blue", "green"][index % 4] as
              | "purple"
              | "orange"
              | "blue"
              | "green"}
          />
        ))}
      </div>

      <div className="card region-table overflow-hidden">
        <div className="region-table__header">
          <span>#</span>
          <span>Viloyat</span>
          <span>Foydalanuvchilar</span>
          <span>Ko’rishlar</span>
          <span>Sertifikatlar</span>
        </div>
        <div className="region-table__body">
          {data.map((region, index) => (
            <div key={region.region} className="region-table__row">
              <span>{index + 1}</span>
              <span>{region.region}</span>
              <span>{formatNumber(region.users)}</span>
              <span>{formatNumber(region.views)}</span>
              <span>{formatNumber(region.certificates)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

