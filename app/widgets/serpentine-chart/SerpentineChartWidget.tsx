"use client";
import { useEffect, useRef, useState } from "react";
import { WidgetProps } from "../../types/widget";
import { SerpentineChartWidgetConfig, SerpentineChartData } from "./types";

// Import amCharts 4 modules directly
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_timeline from "@amcharts/amcharts4/plugins/timeline";
import * as am4plugins_bullets from "@amcharts/amcharts4/plugins/bullets";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";

// Helper function for date formatting
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Make sure export is explicit and default export is also provided
export function SerpentineChartWidget({
  config,
  width,
  height,
  adapters,
}: WidgetProps<SerpentineChartWidgetConfig>) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<SerpentineChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartInstanceRef = useRef<am4plugins_timeline.SerpentineChart | null>(
    null
  );

  const adapter = adapters[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await adapter.initialize(config);
        const chartData = await adapter.fetchData();
        setData(chartData);
      } catch (error) {
        console.error("Error fetching serpentine chart data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch serpentine chart data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [adapter, config]);

  // Initialize and update the chart
  useEffect(() => {
    if (!chartRef.current || !data || loading || error) return;

    // Apply themes
    am4core.useTheme(am4themes_animated);
    am4core.useTheme(am4themes_dark);

    // Create chart instance
    const chart = am4core.create(
      chartRef.current,
      am4plugins_timeline.SerpentineChart
    );
    chartInstanceRef.current = chart;

    // Configure chart
    chart.curveContainer.padding(20, 20, 70, 20); // Adjusted top padding since we're removing the top legend
    chart.levelCount = 4;
    chart.yAxisRadius = am4core.percent(25);
    chart.yAxisInnerRadius = am4core.percent(-25);
    chart.maskBullets = false;

    // Create color set
    const colorSet = new am4core.ColorSet();
    colorSet.saturation = 0.5;

    // Get unique categories for the bottom legend
    const categories = Array.from(
      data.dataPoints.map((point) => point.category.split(" (")[0])
    ).filter((value, index, self) => self.indexOf(value) === index);
    const categoryColors: { [key: string]: string } = {};

    // Prepare chart data
    const chartData = data.dataPoints.map((point) => {
      const category = point.category.split(" (")[0];
      
      if (!categoryColors[category]) {
        categoryColors[category] =
          point.color ||
          colorSet.getIndex(Object.keys(categoryColors).length).hex;
      }

      return {
        category: category,
        start: point.startDate,
        end: point.endDate,
        color: categoryColors[category],
        task: category,
      };
    });

    chart.data = chartData;

    // Configure date formatter
    chart.dateFormatter.dateFormat = "yyyy-MM-dd";
    chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";
    chart.fontSize = 11;

    // Create category axis
    const categoryAxis = chart.yAxes.push(
      new am4charts.CategoryAxis<am4plugins_timeline.AxisRendererCurveY>()
    );
    categoryAxis.renderer = new am4plugins_timeline.AxisRendererCurveY();
    (
      categoryAxis as unknown as { dataFields: { category: string } }
    ).dataFields = { category: "category" };
    categoryAxis.cursorTooltipEnabled = false;
    categoryAxis.renderer.grid.template.disabled = true;
    categoryAxis.renderer.labels.template.paddingRight = 25;
    categoryAxis.renderer.minGridDistance = 10;
    categoryAxis.renderer.innerRadius = -60;
    categoryAxis.renderer.radius = 60;

    // Create date axis
    const dateAxis = chart.xAxes.push(
      new am4charts.DateAxis<am4plugins_timeline.AxisRendererCurveX>()
    );
    dateAxis.renderer = new am4plugins_timeline.AxisRendererCurveX();
    dateAxis.renderer.minGridDistance = 70;
    (
      dateAxis as unknown as {
        baseInterval: { count: number; timeUnit: string };
      }
    ).baseInterval = { count: 1, timeUnit: "day" };
    dateAxis.renderer.tooltipLocation = 0;
    dateAxis.startLocation = -0.5;
    dateAxis.renderer.line.strokeDasharray = "1,4";
    dateAxis.renderer.line.strokeOpacity = 0.6;
    dateAxis.tooltip.background.fillOpacity = 0.2;
    dateAxis.tooltip.background.cornerRadius = 5;
    dateAxis.tooltip.label.fill = new am4core.InterfaceColorSet().getFor(
      "alternativeBackground"
    );
    dateAxis.tooltip.label.paddingTop = 7;

    // Set default time range and scrollbar
    const dates = chartData.map(item => new Date(item.start || "").getTime()).filter(Boolean);
    const maxDate = new Date(Math.max(...dates));
    const minDate = new Date(maxDate);
    minDate.setMonth(minDate.getMonth() - 1);
    
    // Set axis range
    dateAxis.min = minDate.getTime();
    dateAxis.max = maxDate.getTime();

    // Add scrollbar with default one month range
    chart.scrollbarX = new am4core.Scrollbar();
    chart.scrollbarX.align = "center";
    chart.scrollbarX.width = am4core.percent(85);
    chart.scrollbarX.marginBottom = 40;

    // Calculate scrollbar position to show last month
    const totalTime = maxDate.getTime() - Math.min(...dates);
    const oneMonthTime = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    const scrollStart = Math.max(0, 1 - (oneMonthTime / totalTime));
    chart.scrollbarX.start = scrollStart;
    chart.scrollbarX.end = 1;

    // Adjust zoom limits based on task durations
    dateAxis.minZoomCount = 5; // Show at least 5 days
    dateAxis.maxZoomCount = 90; // Maximum zoom out to 90 days

    // Style axis labels
    const labelTemplate = dateAxis.renderer.labels.template;
    labelTemplate.verticalCenter = "middle";
    labelTemplate.fillOpacity = 0.7;
    labelTemplate.background.fill = new am4core.InterfaceColorSet().getFor(
      "background"
    );
    labelTemplate.background.fillOpacity = 1;
    labelTemplate.padding(7, 7, 7, 7);

    // Create series
    const series = chart.series.push(
      new am4plugins_timeline.CurveColumnSeries()
    );
    series.columns.template.height = am4core.percent(20);
    series.columns.template.tooltipText =
      "{task}: [bold]{openDateX}[/] - [bold]{dateX}[/]";

    series.dataFields.openDateX = "start";
    series.dataFields.dateX = "end";
    series.dataFields.categoryY = "category";
    series.columns.template.propertyFields.fill = "color";
    series.columns.template.propertyFields.stroke = "color";
    series.columns.template.strokeOpacity = 0;

    // Add bullets
    // const bullet = series.bullets.push(new am4charts.CircleBullet());
    // bullet.circle.radius = 3;
    // bullet.circle.strokeOpacity = 0;
    // bullet.propertyFields.fill = "color";
    // bullet.locationX = 0;

    // const bullet2 = series.bullets.push(new am4charts.CircleBullet());
    // bullet2.circle.radius = 3;
    // bullet2.circle.strokeOpacity = 0;
    // bullet2.propertyFields.fill = "color";
    // bullet2.locationX = 1;

    // Add event series for hotfixes
    const eventSeries = chart.series.push(
      new am4plugins_timeline.CurveLineSeries()
    );
    eventSeries.dataFields.dateX = "eventDate";
    eventSeries.dataFields.categoryY = "category";

    // Create random hotfix events across the timeline and categories
    const hotfixEvents = [];
    const platforms = ["PC", "Xbox", "PS5", "China"];

    // Generate 10 random hotfix events
    for (let i = 0; i < 10; i++) {
      const randomDate = new Date(2023, 0, 1 + Math.floor(Math.random() * 90)); // Random date in Q1 2023
      const randomPlatform =
        platforms[Math.floor(Math.random() * platforms.length)];
      const version = `${Math.floor(Math.random() * 5)}.${String(
        Math.floor(Math.random() * 100)
      ).padStart(2, "0")}.${String(Math.floor(Math.random() * 1000)).padStart(
        3,
        "0"
      )}`;

      hotfixEvents.push({
        category: `${randomPlatform} (${formatDate(randomDate)})`,
        eventDate: formatDate(randomDate),
        letter: "HotFix",
        description: `v${version}`,
      });
    }

    eventSeries.data = hotfixEvents;
    eventSeries.strokeOpacity = 0;

    // Style the event markers
    const flagBullet = eventSeries.bullets.push(
      new am4plugins_bullets.FlagBullet()
    );
    flagBullet.label.propertyFields.text = "letter";
    flagBullet.locationX = 0;
    flagBullet.tooltipText = "{description}";
    flagBullet.label.fontSize = 10;
    flagBullet.label.fill = am4core.color("#FFFFFF");
    flagBullet.pole.stroke = am4core.color("#FF0000");
    flagBullet.pole.strokeWidth = 2;
    flagBullet.background.fill = am4core.color("#FF0000");

    // Remove the old text label bullet since we're using the flag's built-in label

    // Create bottom legend
    const bottomLegend = chart.createChild(am4charts.Legend);
    bottomLegend.position = "bottom";
    bottomLegend.contentAlign = "center";
    bottomLegend.paddingTop = 15;
    bottomLegend.paddingBottom = 5;
    bottomLegend.marginTop = 15;
    bottomLegend.valueLabels.template.disabled = true;
    bottomLegend.markers.template.width = 16;
    bottomLegend.markers.template.height = 16;

    // Style the bottom legend
    bottomLegend.labels.template.fill = am4core.color("#FFFFFF");
    bottomLegend.labels.template.fontSize = 12;
    bottomLegend.useDefaultMarker = true;
    bottomLegend.background.fillOpacity = 0.5;

    // Create data for the legend
    const legendData = categories.map((category) => ({
      name: category,
      fill: categoryColors[category],
    }));

    bottomLegend.data = legendData;

    // Add cursor
    const cursor = new am4plugins_timeline.CurveCursor();
    chart.cursor = cursor;
    cursor.xAxis = dateAxis;
    cursor.yAxis = categoryAxis;
    cursor.lineY.disabled = true;
    cursor.lineX.strokeDasharray = "1,4";
    cursor.lineX.strokeOpacity = 1;

    dateAxis.renderer.tooltipLocation2 = 0;
    categoryAxis.cursorTooltipEnabled = false;

    // Clean up on component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
      }
    };
  }, [data, loading, error]);

  return (
    <div
      className="bg-black rounded-sm p-8 h-full"
      style={{ gridColumn: `span ${width}`, gridRow: `span ${height}` }}
    >
      <h2 className="text-lg font-bold mb-4 text-zinc-200">
        {data?.title || "PROJECT TIMELINE"}
      </h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-200"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 text-center">{error}</div>
      ) : (
        <div className="h-full " style={{ minHeight: "600px" }}>
          <div ref={chartRef} style={{ width: "100%", height: "100%" }}></div>
        </div>
      )}
    </div>
  );
}

// Add default export as well to ensure compatibility
export default SerpentineChartWidget;
