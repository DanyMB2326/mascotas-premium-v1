import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Loader from '../Loader/Loader';
import './MisMascotas.css';

const EMPTY_PET = {
  nombre:   '',
  especie:  'perro',
  raza:     '',
  peso:     '',
  edad:     '',
  color:    '',
  alergias: '',
  medicacion: '',
  notas:    '',
};

const MisMascotas = () => {
  const { user } = useAuth();
  const [mascotas, setMascotas] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // null = new pet
  const [form, setForm]         = useState(EMPTY_PET);

  /* ── Fetch pets from Firestore ── */
  useEffect(() => {
    if (!user) return;
    const fetchPets = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setMascotas(snap.data().mascotas || []);
        }
      } catch {
        toast.error('No se pudieron cargar tus mascotas.');
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, [user]);

  /* ── Save pets list to Firestore ── */
  const savePets = async (updatedList) => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        { uid: user.uid, email: user.email || null, mascotas: updatedList },
        { merge: true },
      );
      setMascotas(updatedList);
    } catch {
      toast.error('Error al guardar. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const openNewForm = () => {
    setForm(EMPTY_PET);
    setEditIndex(null);
    setShowForm(true);
    setTimeout(() => document.getElementById('pet-nombre')?.focus(), 100);
  };

  const openEditForm = (index) => {
    setForm({ ...mascotas[index] });
    setEditIndex(index);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.raza.trim()) {
      toast.error('Nombre y raza son obligatorios.');
      return;
    }

    const updated = [...mascotas];
    if (editIndex !== null) {
      updated[editIndex] = form;
    } else {
      updated.push({ ...form, id: Date.now().toString() });
    }

    await savePets(updated);
    toast.success(editIndex !== null ? 'Mascota actualizada ✓' : '¡Mascota agregada! 🐾');
    setShowForm(false);
  };

  const handleDelete = async (index) => {
    if (!window.confirm(`¿Eliminás a ${mascotas[index].nombre}?`)) return;
    const updated = mascotas.filter((_, i) => i !== index);
    await savePets(updated);
    toast.success('Mascota eliminada.');
  };

  const especieEmoji = (e) => e === 'gato' ? '🐱' : '🐶';

  if (loading) return <Loader text="Cargando tus mascotas..." />;

  return (
    <section className="mascotas-page">
      <div className="section-header">
        <span className="tag">Tu perfil 🐾</span>
        <h1>Mis Mascotas</h1>
        <p>Carga los datos de tus mascotas una vez y reusalos en cada reserva.</p>
      </div>

      {/* ── Pet cards ── */}
      {mascotas.length > 0 && (
        <div className="mascotas-grid">
          {mascotas.map((m, i) => (
            <div key={m.id || i} className="mascota-card">
              <div className="mascota-avatar">{especieEmoji(m.especie)}</div>
              <div className="mascota-info">
                <h3 className="mascota-nombre">{m.nombre}</h3>
                <p className="mascota-meta">
                  {m.especie === 'gato' ? 'Gato' : 'Perro'} · {m.raza}
                  {m.peso ? ` · ${m.peso} kg` : ''}
                  {m.edad ? ` · ${m.edad} años` : ''}
                </p>
                {m.alergias && (
                  <p className="mascota-tag mascota-tag--warning">⚠️ Alergias: {m.alergias}</p>
                )}
                {m.medicacion && (
                  <p className="mascota-tag mascota-tag--info">💊 {m.medicacion}</p>
                )}
                {m.notas && (
                  <p className="mascota-notas">📝 {m.notas}</p>
                )}
              </div>
              <div className="mascota-actions">
                <Link to="/reservar" className="btn-primary mascota-btn">
                  📅 Reservar
                </Link>
                <button className="btn-outline mascota-btn" onClick={() => openEditForm(i)}>
                  ✏️ Editar
                </button>
                <button className="btn-ghost mascota-btn-delete" onClick={() => handleDelete(i)}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {mascotas.length === 0 && !showForm && (
        <div className="state-container">
          <span className="state-icon">🐾</span>
          <h2>Todavía no agregaste mascotas</h2>
          <p>Guarda sus datos una vez y usálos en citas, hotel y más.</p>
        </div>
      )}

      {/* ── Add button ── */}
      {!showForm && (
        <button className="btn-primary mascotas-add-btn" onClick={openNewForm}>
          + Agregar mascota
        </button>
      )}

      {/* ── Form ── */}
      {showForm && (
        <div className="mascota-form-wrap">
          <h2 className="mascota-form-title">
            {editIndex !== null ? `Editando a ${mascotas[editIndex]?.nombre}` : 'Nueva mascota'}
          </h2>

          <form className="mascota-form" onSubmit={handleSubmit} noValidate>

            <div className="form-section">
              <h3 className="form-section-title">Datos básicos</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pet-nombre">Nombre *</label>
                  <input
                    id="pet-nombre"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Luna"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Especie</label>
                  <select name="especie" value={form.especie} onChange={handleChange}>
                    <option value="perro">🐶 Perro</option>
                    <option value="gato">🐱 Gato</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Raza *</label>
                  <input
                    name="raza"
                    value={form.raza}
                    onChange={handleChange}
                    placeholder="Golden Retriever"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Color / pelaje</label>
                  <input
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    placeholder="Dorado"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Peso (kg)</label>
                  <input
                    name="peso"
                    type="number"
                    value={form.peso}
                    onChange={handleChange}
                    placeholder="12"
                    min="0"
                    max="120"
                  />
                </div>
                <div className="form-group">
                  <label>Edad (años)</label>
                  <input
                    name="edad"
                    type="number"
                    value={form.edad}
                    onChange={handleChange}
                    placeholder="3"
                    min="0"
                    max="30"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Salud y cuidados</h3>
              <div className="form-group">
                <label>Alergias conocidas</label>
                <input
                  name="alergias"
                  value={form.alergias}
                  onChange={handleChange}
                  placeholder="Pollo, maíz... (dejá vacío si no tiene)"
                />
              </div>
              <div className="form-group">
                <label>Medicación habitual</label>
                <input
                  name="medicacion"
                  value={form.medicacion}
                  onChange={handleChange}
                  placeholder="Pastilla X, 1 vez al día..."
                />
              </div>
              <div className="form-group">
                <label>Notas para el equipo</label>
                <textarea
                  name="notas"
                  value={form.notas}
                  onChange={handleChange}
                  placeholder="Comportamiento, miedos, rutinas especiales..."
                  rows={3}
                />
              </div>
            </div>

            <div className="mascota-form-actions">
              <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Guardando...' : editIndex !== null ? 'Guardar cambios' : 'Agregar mascota'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default MisMascotas;