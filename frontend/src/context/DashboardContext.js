import React, { createContext, useContext, useState } from 'react';

/**
 * @typedef {'dashboard' | 'table'} ViewType
 */

/**
 * @typedef {Object} DashboardContextValue
 * @property {ViewType} currentView - Current view mode ('dashboard' or 'table')
 * @property {(view: ViewType) => void} setView - Set the current view
 * @property {() => void} toggleView - Toggle between dashboard and table views
 */

const DashboardContext = createContext(undefined);

/**
 * DashboardProvider component that manages view state
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {ViewType} [props.initialView='table'] - Initial view mode
 */
export const DashboardProvider = ({ children, initialView = 'table' }) => {
  const [currentView, setCurrentView] = useState(initialView);

  /**
   * Set the current view mode
   * @param {ViewType} view - The view to switch to ('dashboard' or 'table')
   */
  const setView = (view) => {
    if (view !== 'dashboard' && view !== 'table') {
      console.warn(`Invalid view type: ${view}. Must be 'dashboard' or 'table'.`);
      return;
    }
    setCurrentView(view);
  };

  /**
   * Toggle between dashboard and table views
   */
  const toggleView = () => {
    setCurrentView(prevView => prevView === 'dashboard' ? 'table' : 'dashboard');
  };

  const value = {
    currentView,
    setView,
    toggleView
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

/**
 * Custom hook to use the DashboardContext
 * @returns {DashboardContextValue}
 * @throws {Error} If used outside of DashboardProvider
 */
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  
  return context;
};
