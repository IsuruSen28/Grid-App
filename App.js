import React, { useState } from 'react';
import { ThemeProvider } from './src/context/ThemeContext';
import HomeScreen from './src/components/HomeScreen';
import WorkspaceScreen from './src/components/WorkspaceScreen';

export default function App() {
  return (
    <ThemeProvider>
      <AppRoot />
    </ThemeProvider>
  );
}

function AppRoot() {
  const [screen, setScreen] = useState('home');
  const [workspaceUri, setWorkspaceUri] = useState(null);

  const openWorkspace = (uri) => {
    if (!uri) return;
    setWorkspaceUri(uri);
    setScreen('workspace');
  };

  const goHome = () => {
    setWorkspaceUri(null);
    setScreen('home');
  };

  if (screen === 'workspace' && workspaceUri) {
    return (
      <WorkspaceScreen
        key={workspaceUri}
        imageUri={workspaceUri}
        onGoHome={goHome}
      />
    );
  }

  return <HomeScreen onOpenWorkspace={openWorkspace} />;
}
