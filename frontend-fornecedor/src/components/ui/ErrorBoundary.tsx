import { Component, type ErrorInfo, type ReactNode } from 'react';
import './ui.css';
interface Props { children: ReactNode; }
interface State { hasError: boolean; }
export class ErrorBoundary extends Component<Props, State> { state: State = { hasError: false }; static getDerivedStateFromError(): State { return { hasError: true }; } componentDidCatch(error: Error, info: ErrorInfo) { console.error('Erro de interface COCAPEC', error, info); } render() { return this.state.hasError ? <div className="ui-error-boundary"><h2>Algo saiu do lugar</h2><p>Recarregue a página para continuar.</p><button type="button" onClick={() => window.location.reload()}>Recarregar</button></div> : this.props.children; } }
