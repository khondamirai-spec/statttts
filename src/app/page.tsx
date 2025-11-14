import ChartCard from "@/components/ChartCard.jsx";
import CertificatesCard from "@/components/cards/CertificatesCard";
import CourseCardsCarousel from "@/components/cards/CourseCardsCarousel";
import LessonsCard from "@/components/cards/LessonsCard";
import RegionSummaryCard from "@/components/cards/RegionSummaryCard";
import TallSalesCard from "@/components/cards/TallSalesCard";
import UsersCard from "@/components/cards/UsersCard";
import WeeklyMonthlyYearlyCard from "@/components/cards/WeeklyMonthlyYearlyCard";
import DashboardGridLayout from "@/components/layout/DashboardGridLayout";
import { ageData } from "@/data/age";
import { educationData } from "@/data/education";
import { genderData } from "@/data/gender";
import { sourceData } from "@/data/source";
export default async function DashboardPage() {
  return (
    <div className="space-y-12">
      <DashboardGridLayout>
        <div className="kpi-grid">
          <UsersCard />
          <LessonsCard />
          <CertificatesCard />
        </div>
        <TallSalesCard />
        <WeeklyMonthlyYearlyCard />
        <section id="courses" className="section-block">
          <h2>Kurslar</h2>
          <CourseCardsCarousel />
        </section>
        <section id="regions" className="section-block">
          <h2>Viloyatlar</h2>
          <RegionSummaryCard />
        </section>
        <section id="statistics" className="section-block">
          <h2>Demografik tahlil</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Jins bo’yicha statistika" data={genderData} />
            <ChartCard title="Yosh bo’yicha statistika" data={ageData} />
            <ChartCard title="Ta’lim darajasi" data={educationData} />
            <ChartCard title="Manba bo’yicha statistikalar" data={sourceData} />
          </div>
        </section>
      </DashboardGridLayout>
    </div>
  );
}
