import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { err: null }
  }
  static getDerivedStateFromError(err) {
    return { err }
  }
  componentDidCatch(err, info) {
    // eslint-disable-next-line no-console
    console.error('Fener error', err, info)
  }
  render() {
    if (this.state.err) {
      return (
        <div className="min-h-full max-w-md mx-auto p-4 flex flex-col gap-4 justify-center">
          <div className="text-5xl text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-center">Bir hata oldu</h2>
          <p className="text-sm opacity-80 text-center">
            Uygulama beklenmedik bir durumla karşılaştı. Verilerin cihazında duruyor.
          </p>
          <pre className="text-xs opacity-60 rounded p-3 bg-[--color-fener-card] border border-[--color-fener-border] overflow-auto">
            {String(this.state.err?.message || this.state.err)}
          </pre>
          <button
            onClick={() => location.reload()}
            className="rounded-xl p-4 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold"
          >
            Yeniden başlat
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
