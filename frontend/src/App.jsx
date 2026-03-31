import { useMemo, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000/predict'

const initialForm = {
  age: 55,
  baseline_mmse: 27,
  hippocampus_dmean_gy: 8,
  hippocampus_dmax_gy: 16,
  radiomics_entropy: 3.1,
  radiomics_texture_nonuniformity: 7.5,
}

const mobileTabs = [
  { id: 'input', label: 'Input', icon: '📝' },
  { id: 'result', label: 'Hasil', icon: '📊' },
  { id: 'about', label: 'Info', icon: 'ℹ️' },
]

export default function App() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('input')

  const summaryText = useMemo(() => {
    if (!result) {
      return 'Belum ada hasil prediksi. Isi data lalu tekan tombol Prediksi Risiko.'
    }

    return `Risiko ${result.risk_category} dengan probabilitas ${(result.risk_probability * 100).toFixed(1)}%`
  }, [result])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: Number(value) }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error('Gagal memproses prediksi')
      }

      const data = await response.json()
      setResult(data)
      setActiveTab('result')
    } catch (err) {
      setError(err.message)
      setResult(null)
      setActiveTab('result')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <section className="card">
        <header className="hero">
          <h1>Hippocampus-Saver AI</h1>
          <p>
            Prediksi penurunan fungsi kognitif pasca WBRT berbasis MRI radiomics dan dosis
            hippocampus.
          </p>
        </header>

        <section className={`panel ${activeTab === 'input' ? 'panel-active' : ''}`}>
          <form onSubmit={handleSubmit} className="grid">
            {Object.entries(form).map(([key, value]) => (
              <label key={key}>
                {key}
                <input name={key} type="number" step="0.1" value={value} onChange={handleChange} />
              </label>
            ))}
            <button type="submit" disabled={loading}>
              {loading ? 'Menghitung...' : 'Prediksi Risiko'}
            </button>
          </form>
        </section>

        <section className={`panel ${activeTab === 'result' ? 'panel-active' : ''}`}>
          {error && <p className="error">{error}</p>}

          <article className="result">
            <h2>Hasil</h2>
            {result ? (
              <>
                <p>Probabilitas risiko: {(result.risk_probability * 100).toFixed(1)}%</p>
                <p>Kategori: {result.risk_category}</p>
                <p>Perubahan MMSE 6 bulan: {result.predicted_mmse_delta_6m}</p>
                <p>Rekomendasi: {result.recommendation}</p>
              </>
            ) : (
              <p>{summaryText}</p>
            )}
          </article>
        </section>

        <section className={`panel panel-about ${activeTab === 'about' ? 'panel-active' : ''}`}>
          <h2>Tentang Aplikasi</h2>
          <p>
            Gunakan menu bawah saat di mobile untuk berpindah cepat antara form input, hasil
            prediksi, dan informasi aplikasi.
          </p>
          <p className="mini-summary">{summaryText}</p>
        </section>
      </section>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        {mobileTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span aria-hidden="true">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </main>
  )
}
