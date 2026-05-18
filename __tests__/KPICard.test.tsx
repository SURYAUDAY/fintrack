import { render, screen } from "@testing-library/react";
import { DollarSign } from "lucide-react";
import { KPICard } from "@/components/ui/KPICard";

describe("<KPICard />", () => {
  it("renders the label, value, and change copy", () => {
    render(
      <KPICard
        label="MRR"
        value="$24,800"
        changeLabel="+12.3% vs last month"
        changeType="positive"
        icon={DollarSign}
      />
    );

    expect(screen.getByText("MRR")).toBeInTheDocument();
    expect(screen.getByText("$24,800")).toBeInTheDocument();
    expect(screen.getByText(/\+12\.3%/)).toBeInTheDocument();
  });

  it("applies the positive trend colour class when changeType is positive", () => {
    render(
      <KPICard
        label="Revenue YTD"
        value="$148,000"
        changeLabel="+8% YoY"
        changeType="positive"
        icon={DollarSign}
      />
    );

    const trend = screen.getByText(/\+8% YoY/);
    expect(trend.parentElement?.className).toMatch(/text-green-600/);
  });
});
