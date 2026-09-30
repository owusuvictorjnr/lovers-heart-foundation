import "server-only";
import { siteConfig } from "@/config/site";
import { db } from "@/lib/db";

/** Impact numbers computed live from the data the admin enters. */
export async function getImpactStats() {
  const [homes, regions, children, volunteers] = await Promise.all([
    db.home.count({ where: { published: true } }),
    db.home.findMany({ where: { published: true }, distinct: ["region"], select: { region: true } }),
    db.outreach.aggregate({ where: { upcoming: false }, _sum: { childrenReached: true } }),
    db.volunteer.count({ where: { status: { not: "ARCHIVED" } } }),
  ]);
  return {
    years: new Date().getFullYear() - siteConfig.foundedYear,
    homes,
    regions: regions.length,
    children: children._sum.childrenReached ?? 0,
    volunteers,
  };
}
