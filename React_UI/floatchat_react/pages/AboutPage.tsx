import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-light-text dark:text-white">About FloatChat</h1>
        <p className="text-light-text-muted dark:text-dark-text-muted mb-8">
          Interactive ocean data visualization platform
        </p>

        <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-light-text dark:text-white">Welcome to FloatChat</h2>
          <p className="text-light-text dark:text-dark-text mb-4">
            FloatChat is an interactive ocean data visualization platform that leverages ARGO float data 
            to provide insights into ocean conditions worldwide. Simply ask questions in natural language 
            and get instant visualizations!
          </p>
          <p className="text-light-text dark:text-dark-text">
            The platform allows users to query ocean data using natural language, visualize oceanographic 
            parameters through interactive charts, explore geographic distributions of ocean measurements, 
            and analyze temporal trends in ocean conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-white">What are ARGO Floats?</h2>
            <p className="text-light-text dark:text-dark-text mb-3">
              ARGO is a global ocean observing system that provides real-time data about the ocean's 
              temperature, salinity, and other properties.
            </p>
            <ul className="space-y-2 text-sm text-light-text-muted dark:text-dark-text-muted">
              <li>• 4,000+ active floats worldwide</li>
              <li>• Autonomous instruments that drift with ocean currents</li>
              <li>• 10-day measurement cycles from surface to 2000m depth</li>
              <li>• Free and open data available to all researchers</li>
              <li>• 20+ years of continuous ocean monitoring</li>
            </ul>
          </div>

          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-white">Ocean Data Parameters</h2>
            <p className="text-light-text dark:text-dark-text mb-3">
              Key oceanographic parameters analyzed:
            </p>
            <ul className="space-y-2 text-sm text-light-text-muted dark:text-dark-text-muted">
              <li><strong>Temperature (TEMP):</strong> Ocean temperature profiles</li>
              <li><strong>Salinity (PSAL):</strong> Practical salinity measurements</li>
              <li><strong>Density (RHO):</strong> Water density calculations</li>
              <li><strong>Buoyancy Frequency (N2):</strong> Ocean stratification</li>
              <li><strong>Sound Speed (SOUND):</strong> Acoustic velocity in water</li>
            </ul>
          </div>
        </div>

        <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-light-text dark:text-white">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-light-text dark:text-white mb-2">Natural Language Queries</h3>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                Ask questions in plain English and get instant visualizations and insights.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-light-text dark:text-white mb-2">Interactive Visualizations</h3>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                Time series, correlations, and distribution plots for comprehensive data analysis.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-light-text dark:text-white mb-2">Geographic Mapping</h3>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                See where data was collected using interactive maps powered by OpenStreetMap.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-light-text dark:text-white mb-2">Data Export</h3>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                Download results as CSV files for further analysis and use in research.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-light-text dark:text-white">How to Use FloatChat</h2>
          <ol className="space-y-3 text-light-text dark:text-dark-text">
            <li><strong>1. Start at Home:</strong> Use the chat interface to ask questions about ocean data</li>
            <li><strong>2. View Graphs:</strong> Navigate to the Graphs page for detailed visualizations and statistics</li>
            <li><strong>3. Explore Maps:</strong> Visit the Map page to see geographic distribution of measurements</li>
            <li><strong>4. Learn More:</strong> Return to this About page for additional information</li>
          </ol>
          <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <p className="text-sm font-semibold text-light-text dark:text-white mb-2">Example Queries:</p>
            <ul className="space-y-1 text-sm text-light-text-muted dark:text-dark-text-muted">
              <li>• "Show me temperature data for Bay of Bengal last year"</li>
              <li>• "What's the salinity data for Arabian Sea last 6 months?"</li>
              <li>• "Give me all ocean parameters for Indian Ocean in 2023"</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-3 text-light-text dark:text-white">Backend Technologies</h2>
            <ul className="space-y-1 text-sm text-light-text-muted dark:text-dark-text-muted">
              <li>• FastAPI for RESTful API</li>
              <li>• Python data processing pipeline</li>
              <li>• Gemini AI for natural language processing</li>
              <li>• Pandas/NumPy for data manipulation</li>
              <li>• NetCDF4 for ARGO data formats</li>
            </ul>
          </div>

          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-3 text-light-text dark:text-white">Frontend Technologies</h2>
            <ul className="space-y-1 text-sm text-light-text-muted dark:text-dark-text-muted">
              <li>• React with TypeScript</li>
              <li>• Plotly for interactive visualizations</li>
              <li>• Leaflet for geographic mapping</li>
              <li>• Tailwind CSS for styling</li>
              <li>• Vite for fast development</li>
            </ul>
          </div>
        </div>

        <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-light-text dark:text-white">Version Information</h2>
          <div className="space-y-2 text-light-text dark:text-dark-text">
            <p><span className="font-semibold">Version:</span> 1.0.0</p>
            <p><span className="font-semibold">Last Updated:</span> December 2025</p>
            <p><span className="font-semibold">License:</span> MIT</p>
          </div>
        </div>

        <div className="text-center text-light-text-muted dark:text-dark-text-muted mt-8 pb-4">
          <p className="font-semibold">FloatChat v1.0 - Ocean Data Visualization Platform</p>
          <p className="text-sm mt-1">Built for ocean science and data exploration</p>
          <p className="text-sm">Data provided by the International ARGO Program</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
