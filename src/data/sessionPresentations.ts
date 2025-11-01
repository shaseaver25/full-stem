/**
 * Session presentation data including embed URLs and speaker notes per slide
 */

export interface SlideData {
  slideNumber: number;
  title: string;
  content: string;
}

export interface SessionPresentation {
  sessionTitle: string;
  embedUrl?: string;
  slides: SlideData[];
  slideCount?: number;
}

export const sessionPresentations: Record<string, SessionPresentation> = {
  "AI-Assisted Skill Practice: Redefining Roleplay": {
    sessionTitle: "AI-Assisted Skill Practice: Redefining Roleplay",
    embedUrl: "/presentations/ai-assisted-skill-practice.pdf",
    slideCount: 20,
    slides: [
      {
        slideNumber: 1,
        title: "Title Slide",
        content: "Amplified Leveraged Professional Impact - Practical Tools & Techniques. Applied AI Conference 2025."
      },
      {
        slideNumber: 2,
        title: "AI Assisted Skill Practice",
        content: "Applied AI Conference 2025. Presented by Tyler Moberg, AI Learning Specialist."
      },
      {
        slideNumber: 3,
        title: "10,000 Hours",
        content: "The concept of mastery through extensive practice. Discussion point: Agree or Disagree with the 10,000 hour rule for skill development."
      },
      {
        slideNumber: 4,
        title: "Deliberate Practice",
        content: "Zoning in on the specific skills you struggle with and using immediate feedback to correct your mistakes in real time. This focused approach accelerates learning and skill development."
      },
      {
        slideNumber: 5,
        title: "Real-World Application",
        content: "Exploring how AI can facilitate deliberate practice in professional settings, enabling individuals to practice difficult conversations, presentations, and skill-based scenarios in a safe environment."
      },
      {
        slideNumber: 6,
        title: "AI-Powered Role Play",
        content: "Using AI to simulate realistic scenarios for skill practice, providing immediate feedback and allowing for multiple iterations without risk."
      },
      {
        slideNumber: 7,
        title: "Practical Implementation",
        content: "Step-by-step guide to implementing AI-assisted skill practice in your organization or personal development routine."
      },
      {
        slideNumber: 8,
        title: "Case Studies",
        content: "Real examples of AI-assisted skill practice improving professional capabilities across different industries and skill sets."
      },
      {
        slideNumber: 9,
        title: "Tools and Platforms",
        content: "Overview of available AI platforms and tools that can be used for skill practice and roleplay scenarios."
      },
      {
        slideNumber: 10,
        title: "Best Practices",
        content: "Guidelines for effective AI-assisted skill practice including setting clear objectives, creating realistic scenarios, and incorporating feedback loops."
      }
    ]
  },
  "Saving Lives and Millions: AI Transforms Avalanche Forecasting": {
    sessionTitle: "Saving Lives and Millions: AI Transforms Avalanche Forecasting",
    embedUrl: "https://docs.google.com/presentation/d/1oJCks_F4e1ADcLgjsLFi5hY5MLepQux0/embed?start=false&loop=false&delayms=3000",
    slideCount: 50,
    slides: [
      {
        slideNumber: 1,
        title: "Title Slide",
        content: "Saving Lives and Millions: AI Transforms Avalanche Forecasting. Applied AI Conference, November 3, 2025. Presented by Mark Teskey and Chad Brackelsberg from Utah Avalanche Center and Warecorp."
      },
      {
        slideNumber: 2,
        title: "Agenda",
        content: "Today's presentation covers understanding avalanche mechanics, examining global and local avalanche impacts, reviewing current forecasting methods, exploring AI-powered solutions, and demonstrating real-world results from our implementation."
      },
      {
        slideNumber: 3,
        title: "About the Presenters",
        content: "Mark Teskey is a video instructor and strategic technology leader with over 20 years of experience driving digital transformation across consumer electronics, medical devices, and enterprise data solutions."
      },
      {
        slideNumber: 4,
        title: "Avalanche Mechanics",
        content: "An avalanche requires three key elements to occur: A trigger that initiates the slide, a slab of snow that moves, and a weak layer beneath the slab. These conditions typically form on slopes greater than 30 degrees."
      },
      {
        slideNumber: 5,
        title: "The Problem - Globally",
        content: "Avalanches have caused devastating losses worldwide throughout history. Notable disasters include 30,000 deaths in the 1970 Peru Huascarán avalanche triggered by an earthquake, 2,000 to 10,000 deaths in the 1916 White Friday avalanches in Italy, 4,000 deaths in the 1962 Peru Huascarán avalanche, and 310 deaths in the 2015 Afghanistan avalanches."
      },
      {
        slideNumber: 6,
        title: "The Problem - Locally",
        content: "In the United States, there are an average of 27 avalanche fatalities per year, with 1,234 total US avalanche fatalities recorded since 1951. Activities with the highest risk include skiing and snowboarding with 498 deaths, snowmobiling with 332 deaths, and climbing with 193 deaths. Last year alone, over 4,000 avalanches were reported in Utah and Colorado, representing just a fraction of actual avalanches. Avalanche accidents place significant strain and cost on search and rescue teams. Many areas of Utah lack avalanche forecasts and adequate snow and weather data."
      },
      {
        slideNumber: 7,
        title: "Why it Matters - Economic Impact",
        content: "Avalanches cause significant economic disruption across multiple sectors. Donner Pass handles 15 million dollars per day in transported goods, often delayed by multi-day closures. Utah's Little Cottonwood Canyon experiences 2.4 million dollars per day in closure costs, with 30 closures recorded in 2023 alone. Road closures cost 110 thousand dollars per hour in economic impact. In 2023, the Little Cottonwood Canyon road was closed for a total of 1,480 hours."
      },
      {
        slideNumber: 8,
        title: "Current Forecasting Challenges",
        content: "Avalanche forecasting has traditionally been more art than science, relying heavily on manual processes and expert judgment. Artificial intelligence enables earlier detection of dangerous conditions and targeted advisories. The Utah Avalanche Center's new AI models bridge the gap between scientific research and operational forecasting for real-world impact and public safety."
      },
      {
        slideNumber: 9,
        title: "Avalanche Forecasts",
        content: "Avalanche forecasts provide detailed danger ratings organized by elevation and aspect. They include overall danger levels rated on a scale of 1 to 5, descriptions of specific avalanche problems like persistent weak layers, and estimates of likelihood and avalanche size. Forecasters must carefully consider terrain characteristics, snowpack structure, and weather conditions when issuing forecasts."
      },
      {
        slideNumber: 10,
        title: "Avalanche Danger Scale",
        content: "The avalanche danger scale uses a 5-point system that is not linear. Danger levels are assessed at a regional level and account for both avalanche likelihood and potential size. The levels range from 1 Low through 2 Moderate, 3 Considerable, 4 High, to 5 Extreme danger."
      },
      {
        slideNumber: 11,
        title: "Why Us - Utah Avalanche Center",
        content: "Utah has a long history of avalanche awareness and forecasting expertise. The Utah Avalanche Center has been serving the community for decades. Salt Lake City is hosting the 2034 Olympic and Paralympic Winter Games, making accurate avalanche forecasting critical for athlete and spectator safety."
      },
      {
        slideNumber: 12,
        title: "Project Goals and Vision",
        content: "Our project has four main goals: Increase the accuracy of avalanche forecasts through AI-powered analysis. Create staff efficiencies by automating data processing and analysis. Provide visual representations of data for both internal use and public consumption, including interactive weather maps. Generate new insights and identify trends that would otherwise go unnoticed, acting as an omnipresent observer of mountain conditions."
      },
      {
        slideNumber: 13,
        title: "Existing Tools - SNOWPACK Model",
        content: "SNOWPACK is a sophisticated heat and water transport model that simulates the three-phase ice, water, and air porous medium of snow. It measures heat and water transport at the top and bottom of the snowpack, then models the physics in between the surface and ground to predict snow structure and metamorphism. The model accounts for solar radiation, precipitation, wind, longwave radiation, snowdrift, wind erosion, canopy effects, latent heat, surface hoar formation, meltwater movement, subsurface melt, refrozen layers, runoff, weak layer development, ice lens formation, and soil or permafrost conditions."
      },
      {
        slideNumber: 14,
        title: "Data Inputs for Forecasting",
        content: "From seven key weather variables, we can recreate the snowpack's energy transfer and predict its conditions. These variables include air temperature, relative humidity, snow surface temperature, reflected shortwave radiation, wind speed, wind direction, and height of snow accumulation."
      },
      {
        slideNumber: 15,
        title: "Data Flow Architecture",
        content: "Weather station data flows through multiple processing stages. First, we generate input files from weather stations. Then we run the SNOWPACK program which outputs detailed snowpack properties. Next, we compute instability metrics from the snowpack data. Finally, we compute danger levels and plot the results for forecasters to review."
      },
      {
        slideNumber: 16,
        title: "Machine Learning Instability Model",
        content: "Machine learning algorithms leverage existing relationships to predict snowpack stability. We identified 6 features with the highest correlation to snowpack instability. Decision trees are used to assess snow instability from simulated snow stratigraphy, providing forecasters with objective data to complement their expert judgment."
      },
      {
        slideNumber: 17,
        title: "Feature Relationships",
        content: "The instability model analyzes multiple snowpack features and their relationships. Key features include grain size, grain type, snow density, temperature gradients, and layer thickness. These features interact in complex ways that machine learning can help identify and predict."
      },
      {
        slideNumber: 18,
        title: "Snowpack Instability Detection",
        content: "The system can detect various types of snowpack instability including surface hoar layers, faceted snow, depth hoar, and melt-freeze crusts. Each type of weak layer has characteristic signatures in the data that the AI model has learned to recognize."
      },
      {
        slideNumber: 19,
        title: "AI Model Architecture",
        content: "Our AI architecture combines multiple models working together. Weather data feeds into the SNOWPACK model, which generates detailed snowpack simulations. These simulations feed into machine learning models that predict instability and danger levels. The system processes data continuously to provide up-to-date forecasts."
      },
      {
        slideNumber: 20,
        title: "Danger Level Prediction",
        content: "The danger level model uses ensemble methods to predict avalanche danger on the 1 to 5 scale. It considers multiple factors including snowpack instability, recent avalanche activity, weather trends, and terrain characteristics. The model achieved a 0.86 correlation coefficient with expert human forecasts."
      },
      {
        slideNumber: 21,
        title: "Real-Time Monitoring",
        content: "The system provides real-time monitoring of conditions across multiple weather stations. Forecasters can view current conditions, trends over time, and model predictions all in one integrated dashboard. Alerts are generated automatically when dangerous conditions develop."
      },
      {
        slideNumber: 22,
        title: "Visualization Tools",
        content: "Interactive visualizations help forecasters quickly understand complex data. Maps show spatial patterns of danger. Time series plots reveal trends and patterns. Snowpack profile visualizations display layer structure and weak layers. All visualizations are designed for both expert users and public communication."
      },
      {
        slideNumber: 23,
        title: "Integration with Existing Workflows",
        content: "The AI system integrates seamlessly with existing forecasting workflows. Forecasters can access AI predictions alongside traditional data sources. The system enhances rather than replaces human expertise, providing additional insights and catching patterns that might be missed."
      },
      {
        slideNumber: 24,
        title: "Stakeholder Collaboration",
        content: "Success required collaboration between avalanche forecasters, data scientists, software engineers, and operational staff. Regular feedback sessions ensured the system met real-world needs. The Utah Avalanche Center provided domain expertise while technology partners delivered the implementation."
      },
      {
        slideNumber: 25,
        title: "User Experience Design",
        content: "The system was designed with the end user in mind. Forecasters need quick access to key information during busy mornings. The public needs clear, actionable information. Different interfaces serve different user groups while sharing the same underlying data and models."
      },
      {
        slideNumber: 26,
        title: "System Requirements",
        content: "Key requirements included affordability, information updates by 4 AM and 4 PM daily, ability to compare days, weeks, and seasons, forecasting out 12, 24, and 48 hours, ease of use, support for multiple users from multiple organizations, and ability to segment data by location, user, and organization. Users need to quickly see what has changed in the past 24 hours and what is expected to change in the next 2 days."
      },
      {
        slideNumber: 27,
        title: "Project Timeline",
        content: "The project timeline spanned multiple years from 2023 through 2027. Phase 1 focused on planning and identification. Phase 2 delivered proof of concept. Phase 3 involved prototype development and model validation. Phase 4 included dashboard and web app builds. Phase 5 covers deployment in 5 regions. Future phases will focus on regional growth and expansion."
      },
      {
        slideNumber: 28,
        title: "Technology Stack",
        content: "We built on the Microsoft technology stack including Azure hosting with virtual machines and platform-as-code. Microsoft Fabric serves as our data warehouse. Power BI was crucial for initial design work due to its speed of development and iterative nature. The platform provides flexibility for tool integration and accommodates various data sources including weather stations, snow profiles, snowpack models, custom imagery, infrasound detection, and avalanche observations."
      },
      {
        slideNumber: 29,
        title: "Optimization Efforts",
        content: "The original implementation was a literal translation of operational architecture. Through optimization, we reduced processing time from 6 hours down to 1 hour. Key improvements included moving from Python Pandas to PySpark for distributed processing and better data engineering with precomputed tables. Next steps include continued operations group training, dashboard refinement, granular processing, ongoing validation and tuning, and building auto-tuning and configuration capabilities."
      },
      {
        slideNumber: 30,
        title: "Proof of Concept Results",
        content: "The proof of concept used data from the 2022-2023 and 2023-2024 seasons, while the prototype used 2024-2025 season data. Testing focused on the data-rich Atwater Study Plot in Little Cottonwood Canyon, Utah. The models successfully identified 4 radiation recrystallization events. The instability model identified weak layers that were missed by forecast staff and later produced avalanche events. The danger level model achieved a 0.86 correlation coefficient with human forecasts."
      }
    ]
  }
};
