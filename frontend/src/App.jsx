import { useState } from 'react'

const API_URL = 'http://127.0.0.1:8000/predict'

const initialForm = {
  age: 55,
  baseline_mmse: 27,
  hippocampus_dmean_gy: 8,
  hippocampus_dmax_gy: 16,
  radiomics_entropy: 3.1,
  radiomics_texture_nonuniformity: 7.5,
}

export default function App() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    } catch (err) {
      setError(err.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Hippocampus-Saver AI</h1>
        <p>
          Prediksi penurunan fungsi kognitif pasca WBRT berbasis MRI radiomics dan dosis
          hippocampus.
        </p>

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

        {error && <p className="error">{error}</p>}

        {result && (
          <article className="result">
            <h2>Hasil</h2>
            <p>Probabilitas risiko: {(result.risk_probability * 100).toFixed(1)}%</p>
            <p>Kategori: {result.risk_category}</p>
            <p>Perubahan MMSE 6 bulan: {result.predicted_mmse_delta_6m}</p>
            <p>Rekomendasi: {result.recommendation}</p>
          </article>
        )}
      </section>
    </main>
  )
}
