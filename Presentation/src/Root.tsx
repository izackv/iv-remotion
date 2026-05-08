import React from "react";
import { Composition, Folder } from "remotion";
import { BarChartDemo, barChartDemoSchema } from "./demos/BarChartDemo";
import { PieChartDemo, pieChartDemoSchema } from "./demos/PieChartDemo";
import { VennDiagramDemo, vennDiagramDemoSchema } from "./demos/VennDiagramDemo";
import { LineChartDemo, lineChartDemoSchema } from "./demos/LineChartDemo";
import { ProgressBarDemo, progressBarDemoSchema } from "./demos/ProgressBarDemo";
import { CounterDemo, counterDemoSchema } from "./demos/CounterDemo";
import { TableDemo, tableDemoSchema } from "./demos/TableDemo";
import { TimelineDemo, timelineDemoSchema } from "./demos/TimelineDemo";
import { IconGridDemo, iconGridDemoSchema } from "./demos/IconGridDemo";
import { TitleSlideDemo, titleSlideDemoSchema } from "./demos/TitleSlideDemo";
import { QuoteDemo, quoteDemoSchema } from "./demos/QuoteDemo";
import { TwoColumnCompareDemo, twoColumnCompareDemoSchema } from "./demos/TwoColumnCompareDemo";
import { BulletListDemo, bulletListDemoSchema } from "./demos/BulletListDemo";
import { SlideFrameBarDemo, slideFrameBarDemoSchema, SlideFramePieDemo, slideFramePieDemoSchema } from "./demos/SlideFrameDemo";
import { TerminalReplayDemo, terminalReplayDemoSchema } from "./demos/TerminalReplayDemo";
import { TerminalScriptedDemo, terminalScriptedDemoSchema } from "./demos/TerminalScriptedDemo";
import { GeoHeatmapDemo, geoHeatmapDemoSchema } from "./demos/GeoHeatmapDemo";
import { FlightRouteDemo, flightRouteDemoSchema } from "./demos/FlightRouteDemo";

export const RemotionRoot: React.FC = () => (
  <>
    {/* ── Charts & Data ── */}
    <Folder name="Charts">
      <Composition
        id="BarChart"
        component={BarChartDemo}
        schema={barChartDemoSchema}
        defaultProps={{
          branding: { preset: "modern" as const },
          chart: {
            dataFile: "bar-chart-data.csv",
            labelColumn: "label",
            valueColumn: "value",
            items: [],
            staggerDelay: 5,
            showLabels: true,
            showValues: true,
            animationDelay: 0,
            duration: 4,
          },
          title: "Revenue by Quarter",
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PieChart"
        component={PieChartDemo}
        schema={pieChartDemoSchema}
        defaultProps={{
          branding: { preset: "redhat-light" },
          chart: {
            dataFile: "pie-chart-data.csv",
            labelColumn: "label",
            valueColumn: "value",
            segments: [],
            innerRadius: 0,
            showLabels: true,
            staggerDelay: 8,
            animationDelay: 0,
            duration: 2,
          },
          title: "Market Share",
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LineChart"
        component={LineChartDemo}
        schema={lineChartDemoSchema}
        defaultProps={{
          branding: { preset: "redhat-light" as const },
          chart: {
            dataFile: "line-chart-data.csv",
            labelColumn: "label",
            valueColumn: "value",
            points: [],
            lineWidth: 3,
            showDots: true,
            showLabels: true,
            showValues: true,
            showGrid: true,
            duration: 2,
            animationDelay: 0,
          },
          title: "Monthly Growth",
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="VennDiagram"
        component={VennDiagramDemo}
        schema={vennDiagramDemoSchema}
        defaultProps={{"branding":{"preset":"redhat-dark" as const},"chart":{"circles":[{"label":"Design"},{"label":"Engineering"}],"overlapLabel":"UX","overlapAmount":0.35,"circleRadius":150,"animationDelay":0,"duration":2},"title":"Skills Overlap"}}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>

    {/* ── Metrics & Progress ── */}
    <Folder name="Metrics">
      <Composition
        id="Counter"
        component={CounterDemo}
        schema={counterDemoSchema}
        defaultProps={{"branding":{"preset":"redhat-light" as const},"counters":[{"value":2.4,"prefix":"$","suffix":"M","label":"Revenue","decimals":1,"startFrom":0,"animationDelay":0,"duration":2},{"value":1250,"prefix":"","suffix":"+","label":"Customers","decimals":0,"startFrom":0,"animationDelay":0,"duration":2},{"value":99.9,"prefix":"","suffix":"%","label":"Uptime","decimals":1,"startFrom":0,"animationDelay":0,"duration":2}],"title":"Key Metrics"}}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ProgressBar"
        component={ProgressBarDemo}
        schema={progressBarDemoSchema}
        defaultProps={{"branding":{"preset":"redhat-light" as const},"bars":[{"value":85,"label":"Design","variant":"horizontal" as const,"showPercentage":true,"thickness":20,"size":200,"animationDelay":0,"duration":2},{"value":62,"label":"Development","variant":"horizontal" as const,"showPercentage":true,"thickness":20,"size":200,"animationDelay":0,"duration":2},{"value":40,"label":"Testing","variant":"horizontal" as const,"showPercentage":true,"thickness":20,"size":200,"animationDelay":0,"duration":2}],"title":"Project Progress"}}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ProgressBarCircular"
        component={ProgressBarDemo}
        schema={progressBarDemoSchema}
        defaultProps={{"branding":{"preset":"corporate" as const},"bars":[{"value":100,"label":"Sprint Progress","variant":"circular" as const,"showPercentage":true,"thickness":18,"size":280,"animationDelay":0,"duration":4,"phases":[{"label":"Planning","value":15,"color":"#0066cc"},{"label":"Development-2","value":40,"color":"#3e8635"},{"label":"Testing","value":25,"color":"#f0ab00"},{"label":"Release","value":20,"color":"#ee0000"}]}],"title":"Sprint Progress"}}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Table"
        component={TableDemo}
        schema={tableDemoSchema}
        defaultProps={{
          branding: { preset: "redhat-light" as const },
          table: {
            dataFile: "table-data.csv",
            headers: [],
            rows: [],
            animationDelay: 0,
            duration: 2,
          },
          title: "Quarterly Results",
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>

    {/* ── Layout & Text ── */}
    <Folder name="Layout">
      <Composition
        id="TitleSlide"
        component={TitleSlideDemo}
        schema={titleSlideDemoSchema}
        defaultProps={{
          branding: { preset: "redhat-light" as const },
          slide: {
            heading: "Quarterly Business Review",
            subtitle: "Q4 2025 — Performance, Growth & Strategic Outlook",
            logoSrc: "",
            logoSize: 80,
            logoPosition: "top-left" as const,
            accentLine: true,
            animationDelay: 0,
            duration: 2,
          },
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="BulletList"
        component={BulletListDemo}
        schema={bulletListDemoSchema}
        defaultProps={{"branding":{"preset":"redhat-light" as const},"list":{"items":[{"text":"Automate repetitive tasks to free up engineering time","subtext":"Estimated 40% reduction in manual work"},{"text":"Adopt a microservices architecture for scalability","subtext":""},{"text":"Implement observability across all services","subtext":"Logging, metrics, and distributed tracing"},{"text":"Shift security left into the development workflow","subtext":""}],"bulletStyle":"arrow" as const,"animationDelay":0,"duration":4},"title":"Key Takeaways"}}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="QuoteLeftBar"
        component={QuoteDemo}
        schema={quoteDemoSchema}
        defaultProps={{
          branding: { preset: "redhat-light" as const },
          quote: {
            text: "Any sufficiently advanced technology is indistinguishable from magic.",
            attribution: "Arthur C. Clarke",
            variant: "left-bar" as const,
            animationDelay: 0,
            duration: 2,
          },
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="QuoteLarge"
        component={QuoteDemo}
        schema={quoteDemoSchema}
        defaultProps={{
          branding: { preset: "redhat-dark" as const },
          quote: {
            text: "Open source is not about free software. It's about collaboration, innovation, and community.",
            attribution: "Jim Whitehurst",
            variant: "large-quote" as const,
            animationDelay: 0,
            duration: 2,
          },
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CompareProsCons"
        component={TwoColumnCompareDemo}
        schema={twoColumnCompareDemoSchema}
        defaultProps={{
          branding: { preset: "redhat-light" as const },
          compare: {
            left: {
              heading: "Pros",
              items: [
                "Open source and transparent",
                "Large community support",
                "Highly customizable",
                "Enterprise-grade security",
              ],
            },
            right: {
              heading: "Cons",
              items: [
                "Steeper learning curve",
                "Requires dedicated team",
                "Migration complexity",
              ],
            },
            variant: "pros-cons" as const,
            divider: true,
            animationDelay: 0,
            duration: 2,
          },
          title: "Platform Evaluation",
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CompareBeforeAfter"
        component={TwoColumnCompareDemo}
        schema={twoColumnCompareDemoSchema}
        defaultProps={{"branding":{"preset":"redhat-light" as const},"compare":{"left":{"heading":"Before","items":["Manual deployments","Siloed teams","Hours of downtime"]},"right":{"heading":"After","items":["Automated CI/CD pipelines","Cross-functional collaboration","99.9% uptime SLA"]},"variant":"before-after" as const,"divider":true,"animationDelay":0,"duration":5},"title":"Digital Transformation"}}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Timeline-Vertical"
        component={TimelineDemo}
        schema={timelineDemoSchema}
        defaultProps={{
          branding: { preset: "redhat-light" as const },
          timeline: {
            milestones: [
              { title: "Discovery", description: "Requirements gathering and research", date: "Q1 2025" },
              { title: "Design", description: "Architecture and UX design", date: "Q2 2025" },
              { title: "Development", description: "Build core features", date: "Q3 2025" },
              { title: "Launch", description: "Public release", date: "Q4 2025" },
            ],
            variant: "vertical" as const,
            animationDelay: 0,
            duration: 2,
          },
          title: "Project Roadmap",
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Timeline-Horizontal"
        component={TimelineDemo}
        schema={timelineDemoSchema}
        defaultProps={{
          branding: { preset: "redhat-light" as const },
          timeline: {
            milestones: [
              { title: "Kickoff", date: "Jan", description: "" },
              { title: "Alpha", date: "Mar", description: "" },
              { title: "Beta", date: "Jun", description: "" },
              { title: "RC", date: "Sep", description: "" },
              { title: "GA", date: "Nov", description: "" },
            ],
            variant: "horizontal" as const,
            animationDelay: 0,
            duration: 2,
          },
          title: "Release Timeline",
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="IconGrid"
        component={IconGridDemo}
        schema={iconGridDemoSchema}
        defaultProps={{"branding":{"preset":"redhat-light" as const},"grid":{"items":[{"icon":"rocket","label":"Fast Deploy","description":"Ship in minutes"},{"icon":"shield","label":"Secure","description":"Enterprise-grade security"},{"icon":"globe","label":"Global Scale","description":"Deploy anywhere"},{"icon":"chart","label":"Analytics","description":"Real-time insights"},{"icon":"users","label":"Collaboration","description":"Built for teams"},{"icon":"gear","label":"Configurable","description":"Fully customizable"}],"columns":3,"iconSize":48,"animationDelay":0,"duration":2},"title":"Platform Features - 2"}}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>

    {/* ── Slide-Frames ── */}
    <Folder name="Slide-Frames">
      <Composition
        id="SlideFrame-BarChart"
        component={SlideFrameBarDemo}
        schema={slideFrameBarDemoSchema}
        defaultProps={{
          branding: { preset: "redhat-light" as const },
          frame: {
            title: "Revenue by Quarter",
            subtitle: "FY 2025",
            logoSrc: "",
            logoSize: 48,
            footer: "Confidential",
            footerRight: "Page 3",
            accentLine: true,
            contentPadding: 48,
            animationDelay: 0,
            duration: 1,
          },
          chart: {
            dataFile: "bar-chart-data.csv",
            labelColumn: "label",
            valueColumn: "value",
            items: [],
            showLabels: true,
            showValues: true,
            staggerDelay: 5,
            animationDelay: 15,
            duration: 3,
          },
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SlideFrame-PieChart"
        component={SlideFramePieDemo}
        schema={slideFramePieDemoSchema}
        defaultProps={{
          branding: { preset: "redhat-dark" as const },
          frame: {
            title: "Market Share",
            subtitle: "Global Distribution",
            logoSrc: "",
            logoSize: 48,
            footer: "Source: Internal Analytics",
            footerRight: "Page 5",
            accentLine: true,
            contentPadding: 48,
            animationDelay: 0,
            duration: 1,
          },
          chart: {
            dataFile: "pie-chart-data.csv",
            labelColumn: "label",
            valueColumn: "value",
            segments: [],
            innerRadius: 0.5,
            showLabels: true,
            staggerDelay: 8,
            animationDelay: 15,
            duration: 3,
          },
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>

    {/* ── Terminal ── */}
    <Folder name="Terminal">
      <Composition
        id="Terminal-Replay"
        component={TerminalReplayDemo}
        schema={terminalReplayDemoSchema}
        defaultProps={{"branding":{"preset":"redhat-dark" as const},"terminal":{"castFile":"sample.cast","castContent":"","speed":1,"fontSize":18,"lineHeight":1.4,"showHeader":true,"title":"zsh — 80x24","maxLines":24,"animationDelay":0},"annotations":{"annotations":[{"type":"circle" as const,"x":25,"y":91,"width":45,"height":9,"startTime":6,"color":"#ee0000","strokeWidth":3,"endTime":9},{"type":"note" as const,"x":55,"y":75,"text":"Server is ready!","fontSize":18,"startTime":6.2,"color":"#ffffff","bgColor":"#ee0000","endTime":9},{"type":"arrow" as const,"fromX":55,"fromY":77,"toX":40,"toY":87,"startTime":6.4,"color":"#ee0000","strokeWidth":3,"endTime":9},{"type":"zoom" as const,"x":20,"y":10,"scale":1.8,"startTime":6,"endTime":9,"transitionDuration":0.5}]}}}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Terminal-Scripted"
        component={TerminalScriptedDemo}
        schema={terminalScriptedDemoSchema}
        defaultProps={{
          branding: { preset: "redhat-dark" as const },
          terminal: {
            linesFile: "docker-demo.json",
            lines: [],
            fontSize: 18,
            lineHeight: 1.5,
            showHeader: true,
            title: "docker — build & run",
            maxLines: 24,
            animationDelay: 0,
          },
          annotations: {
            annotations: [
              { type: "note" as const, x: 20, y: 13, text: "Cache hit — no rebuild needed!", fontSize: 16, startTime: 3.3, endTime: 6, color: "#ffffff", bgColor: "#3e8635" },
              { type: "circle" as const, x: 10, y: 43.5, width: 20, height: 6, startTime: 9.5, color: "#56b6c2", strokeWidth: 2 },
            ],
          },
        }}
        durationInFrames={330}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>

    {/* ── Maps ── */}
    <Folder name="Maps">
      <Composition
        id="GeoHeatmap"
        component={GeoHeatmapDemo}
        schema={geoHeatmapDemoSchema}
        defaultProps={{
          branding: { preset: "redhat-dark" as const },
          heatmap: {
            dataFile: "sales-data.csv",
            data: [],
            cityColumn: "city",
            valueColumn: "value",
            lngColumn: "lng",
            latColumn: "lat",
            minRadius: 6,
            maxRadius: 40,
            showLabels: true,
            showValues: true,
            showLandmasses: true,
            geoJsonFile: "world-110m.geojson",
            zoomPadding: 0.15,
            zoomDuration: 1.5,
            animationDelay: 0,
            duration: 3,
          },
          title: "Global Sales Distribution",
        }}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FlightRoute-Vintage"
        component={FlightRouteDemo}
        schema={flightRouteDemoSchema}
        defaultProps={{"branding":{"preset":"corporate" as const},"flight":{"origin":"sofia","destination":"tel aviv","mapStyle":"vintage" as const,"showAirplane":true,"showLabels":true,"duration":6}}}
        durationInFrames={210}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FlightRoute-Realistic"
        component={FlightRouteDemo}
        schema={flightRouteDemoSchema}
        defaultProps={{"branding":{"preset":"redhat-light" as const},"flight":{"origin":"san francisco","destination":"tokyo","mapStyle":"realistic" as const,"showAirplane":true,"showLabels":true,"duration":6}}}
        durationInFrames={210}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>
  </>
);
