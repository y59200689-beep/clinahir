import { reportRenderFailure } from '../monitoring';
import { Component, type ReactNode } from 'react';

export default class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { void reportRenderFailure().catch(() => {}); }
  render() {
    if (!this.state.failed) return this.props.children;
    const fr = document.documentElement.lang === 'fr';
    return <main className="app-recovery" role="alert"><h1>{fr ? 'Impossible d’ouvrir cette vue' : 'This view could not be opened'}</h1><p>{fr ? 'Rechargez la page pour réessayer. Les modifications de démonstration seront réinitialisées.' : 'Reload the page to try again. Temporary demo changes will reset.'}</p><button type="button" onClick={() => window.location.reload()}>{fr ? 'Recharger la page' : 'Reload page'}</button></main>;
  }
}
