import React, { useState } from 'react';
import './App.css';
import PDFUploader from './components/PDFUploader';
import FilterPanel from './components/filters/FilterPanel';
import TransactionTable from './components/table/TransactionTable';
import { FilterProvider } from './context/FilterContext';
import { useFilters } from './context/FilterContext';
import { createFilterMetadata } from './utils/filterMetadata';
import axios from 'axios';

/**
 * FilterView component - Displays filtering interface and transaction table
 * Wrapped in its own component to use the FilterContext
 */
const FilterView = ({ darkMode, extractedData, onExport, onStartOver, isExporting }) => {
  const { filteredTransactions, allTransactions, filters, clearFilters } = useFilters();
  const [showExportOptions, setShowExportOptions] = useState(false);
  const dropdownRef = React.useRef(null);

  // Debug logging
  React.useEffect(() => {
    console.log('FilterView: Received extractedData:', {
      hasData: !!extractedData,
      hasMetadata: !!extractedData?.metadata,
      hasSummary: !!extractedData?.metadata?.summary,
      summary: extractedData?.metadata?.summary,
      transactionCount: allTransactions?.length
    });
  }, [extractedData, allTransactions]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportOptions(false);
      }
    };

    if (showExportOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showExportOptions]);

  const handleExportClick = async (format) => {
    setShowExportOptions(false);
    await onExport(format, filteredTransactions, filters);
  };

  return (
    <div className="filter-view">
      <div className="filter-view-header">
        <div className="extraction-summary">
          <h2>📊 Extracted Data</h2>
          <div className="summary-stats">
            <span className="stat">
              <strong>{extractedData.metadata.summary.totalFunds}</strong> Funds
            </span>
            <span className="stat">
              <strong>{extractedData.metadata.summary.totalFolios}</strong> Folios
            </span>
            <span className="stat">
              <strong>{extractedData.metadata.summary.totalTransactions}</strong> Transactions
            </span>
          </div>
        </div>
        <div className="filter-view-actions">
          <div className="export-dropdown" ref={dropdownRef}>
            <button 
              className="export-button" 
              onClick={() => setShowExportOptions(!showExportOptions)}
              disabled={isExporting}
            >
              {isExporting ? '⏳ Exporting...' : '📥 Export Filtered Data'}
            </button>
            {showExportOptions && (
              <div className="export-options">
                <button onClick={() => handleExportClick('excel')}>
                  📊 Excel (.xlsx)
                </button>
                <button onClick={() => handleExportClick('json')}>
                  📄 JSON (.json)
                </button>
                <button onClick={() => handleExportClick('text')}>
                  📝 Text (.txt)
                </button>
              </div>
            )}
          </div>
          <button className="start-over-button" onClick={onStartOver}>
            🔄 Upload New PDF
          </button>
        </div>
      </div>

      <div className="filter-content">
        <aside className="filter-sidebar">
          <FilterPanel darkMode={darkMode} collapsible={true} />
        </aside>
        <main className="table-main">
          <TransactionTable
            transactions={filteredTransactions}
            isLoading={false}
            totalCount={allTransactions.length}
            filteredCount={filteredTransactions.length}
            darkMode={darkMode}
            onClearFilters={clearFilters}
          />
        </main>
      </div>
    </div>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [currentView, setCurrentView] = useState('upload'); // 'upload' or 'filter'
  const [isExporting, setIsExporting] = useState(false);

  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  /**
   * Handle successful extraction - switch to filter view
   */
  const handleExtractionComplete = (data) => {
    console.log('Extraction complete, received data:', data);
    
    // Validate that we have the required data structure
    if (!data || !data.transactions || !Array.isArray(data.transactions)) {
      console.error('Invalid data structure received:', data);
      alert('Error: Invalid data structure received from server. Please try again.');
      return;
    }
    
    setExtractedData(data);
    setCurrentView('filter');
  };

  /**
   * Handle export of filtered data
   * @param {string} format - Export format: 'excel', 'json', or 'text'
   * @param {Array} filteredTransactions - Filtered transaction array
   * @param {Object} filters - Current filter state
   */
  const handleExport = async (format, filteredTransactions, filters) => {
    try {
      setIsExporting(true);

      // Create filter metadata
      const filterMetadata = createFilterMetadata(
        filters,
        extractedData.transactions.length,
        filteredTransactions.length
      );

      // Prepare export request
      const exportData = {
        filteredTransactions,
        portfolioData: extractedData.portfolioData,
        transactionData: extractedData.transactionData,
        filterMetadata,
        outputFormat: format,
        selectedSheets: ['portfolio', 'transactions', 'holdings'],
        sourceFileName: extractedData.metadata.sourceFile
      };

      // Send export request to backend
      const response = await axios.post(
        'http://localhost:5000/api/export-filtered',
        exportData,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Set filename based on format
      const timestamp = Date.now();
      const baseName = extractedData.metadata.sourceFile.replace(/\.(pdf|PDF)$/, '');
      let filename;
      switch (format) {
        case 'json':
          filename = `${baseName}_Filtered_${timestamp}.json`;
          break;
        case 'text':
          filename = `${baseName}_Filtered_${timestamp}.txt`;
          break;
        default:
          filename = `${baseName}_Filtered_${timestamp}.xlsx`;
      }
      link.setAttribute('download', filename);

      // Trigger download
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log(`✓ Exported ${filteredTransactions.length} filtered transactions as ${format}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Handle starting over - return to upload view
   */
  const handleStartOver = () => {
    setExtractedData(null);
    setCurrentView('upload');
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <header className="App-header">
        <div className="header-content">
          <div className="title-section">
            <h1>📊 ITR Complete</h1>
            <p>CAS Data Extractor & Analyzer</p>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>
      
      <main className="App-main">
        {currentView === 'upload' && (
          <PDFUploader 
            darkMode={darkMode} 
            onExtractionComplete={handleExtractionComplete}
          />
        )}
        
        {currentView === 'filter' && extractedData && (
          <>
            {/* Validate data structure before rendering FilterProvider */}
            {!extractedData.transactions || !Array.isArray(extractedData.transactions) ? (
              <div className="filter-view">
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <span>Error: Invalid data structure. Please try uploading the PDF again.</span>
                </div>
                <button className="start-over-button" onClick={handleStartOver}>
                  🔄 Upload New PDF
                </button>
              </div>
            ) : (
              <FilterProvider transactions={extractedData.transactions}>
                <FilterView
                  darkMode={darkMode}
                  extractedData={extractedData}
                  onExport={handleExport}
                  onStartOver={handleStartOver}
                  isExporting={isExporting}
                />
              </FilterProvider>
            )}
          </>
        )}
      </main>
      
      <footer className="App-footer">
        <p>Extract comprehensive mutual fund data from your CAS PDFs</p>
        <p className="version">Version 1.5.0 | Powered by ITR2 Extraction Engine</p>
      </footer>
    </div>
  );
}

export default App;
