/**
 * Session presentation data including embed URLs and speaker notes
 */

export interface SessionPresentation {
  sessionTitle: string;
  embedUrl?: string;
  speakerNotes: string;
  slideCount?: number;
}

export const sessionPresentations: Record<string, SessionPresentation> = {
  "Saving Lives and Millions: AI Transforms Avalanche Forecasting": {
    sessionTitle: "Saving Lives and Millions: AI Transforms Avalanche Forecasting",
    embedUrl: "https://docs.google.com/presentation/d/1oJCks_F4e1ADcLgjsLFi5hY5MLepQux0/embed?start=false&loop=false&delayms=3000",
    slideCount: 50,
    speakerNotes: `Saving Lives and Millions: AI Transforms Avalanche Forecasting

Slide 1: Title
Saving Lives and Millions: AI Transforms Avalanche Forecasting. Applied AI Conference, November 3, 2025. Presented by Mark Teskey and Chad Brackelsberg from Utah Avalanche Center and Warecorp.

Slide 2: Agenda
Topics covered: Understanding avalanche mechanics, global and local impact, current forecasting methods, AI-powered solutions, and real-world results.

Slide 3: About the Presenters
Mark Teskey - Video instructor and strategic technology leader with 20+ years experience in digital transformation.

Slide 4: Avalanche Mechanics
An avalanche requires three key elements: A trigger, a slab of snow, and a weak layer beneath. These typically occur on slopes greater than 30 degrees.

Slide 5: The Problem - Globally
Avalanches have caused devastating losses worldwide. Notable disasters include 30,000 deaths in the 1970 Peru Huascarán avalanche, 2,000-10,000 deaths in the 1916 White Friday avalanches in Italy, and 4,000 deaths in the 1962 Peru Huascarán avalanche.

Slide 6: The Problem - Locally
In the United States, there are 27 avalanche fatalities per year on average, with 1,234 total US avalanche fatalities since 1951. Activities with highest risk include skiing and snowboarding with 498 deaths, snowmobiling with 332 deaths, and climbing with 193 deaths. Last year, over 4,000 avalanches were reported in Utah and Colorado alone, representing just a fraction of actual avalanches.

Slide 7: Why it Matters - Economic Impact
Avalanches cause significant economic disruption. Donner Pass sees 15 million dollars per day in goods transported, often delayed by multi-day closures. Utah's Little Cottonwood Canyon experiences 2.4 million dollars per day in closure costs, with 30 closures in 2023 alone. Road closures cost 110 thousand dollars per hour in economic impact. In 2023, Little Cottonwood Canyon road was closed for 1,480 hours total.

Slide 8: Current Forecasting Challenges
Avalanche forecasting has traditionally been more art than science, relying heavily on manual processes. AI enables earlier detection and targeted advisories. The Utah Avalanche Center's models bridge science and operations for real-world impact.

Slide 9: Avalanche Forecasts
Avalanche forecasts provide detailed danger ratings by elevation and aspect. They include overall danger levels on a scale of 1 to 5, descriptions of avalanche problems like persistent weak layers, and likelihood and size estimates. Forecasters must consider terrain, snowpack structure, and weather conditions.

Slide 10: AI-Powered Solution
The new AI system integrates multiple data sources, provides predictive modeling, and enables real-time monitoring and alerts. This transforms avalanche forecasting from reactive to proactive.

The presentation demonstrates how artificial intelligence is revolutionizing avalanche safety through advanced data analysis, predictive modeling, and real-time monitoring. The Utah Avalanche Center has partnered with technology leaders to create next-generation forecasting tools that save lives and reduce economic losses from avalanche-related closures and accidents.

Key takeaways include the global and local impact of avalanches, the economic costs of avalanche closures, the limitations of traditional forecasting methods, and how AI enables earlier detection and more accurate predictions. The system processes weather data, snowpack observations, and historical patterns to provide forecasters with actionable intelligence.`
  }
};
