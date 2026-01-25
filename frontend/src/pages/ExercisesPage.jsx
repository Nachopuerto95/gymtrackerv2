import { useState, useEffect } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { Search, Plus, Filter } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import MenuButton from '../components/common/MenuButton';
import ExerciseCard from '../components/exercise/ExerciseCard';
import ExerciseForm from '../components/exercise/ExerciseForm';
import ExerciseProgressionChart from '../components/analytics/ExerciseProgressionChart';
import useExerciseStore from '../store/exerciseStore';
import toast from 'react-hot-toast';
import './ExercisesPage.css';

const CATEGORY_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'chest', label: 'Pecho' },
  { value: 'back', label: 'Espalda' },
  { value: 'shoulders', label: 'Hombros' },
  { value: 'arms', label: 'Brazos' },
  { value: 'legs', label: 'Piernas' },
  { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' }
];

const ExercisesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedExerciseForStats, setSelectedExerciseForStats] = useState(null);

  const {
    exercises,
    isLoading,
    error,
    fetchExercises,
    createExercise,
    updateExercise,
    deleteExercise,
    clearError
  } = useExerciseStore();

  // Fetch all exercises once on mount (uses cache if available)
  useEffect(() => {
    fetchExercises();
  }, []);

  // Client-side filtering (no API calls needed!)
  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = !searchQuery ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Clear error
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error]);

  const handleOpenCreate = () => {
    setEditingExercise(null);
    setShowModal(true);
  };

  const handleOpenEdit = (exercise) => {
    setEditingExercise(exercise);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExercise(null);
  };

  const handleSubmit = async (formData) => {
    let result;

    if (editingExercise) {
      result = await updateExercise(editingExercise._id, formData);
      if (result.success) {
        toast.success('Ejercicio actualizado');
      }
    } else {
      result = await createExercise(formData);
      if (result.success) {
        toast.success('Ejercicio creado');
      }
    }

    if (result.success) {
      handleCloseModal();
    }
  };

  const handleDelete = async (exercise) => {
    setShowDeleteConfirm(exercise);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      const result = await deleteExercise(showDeleteConfirm._id);
      if (result.success) {
        toast.success('Ejercicio eliminado');
      } else {
        toast.error(result.error);
      }
      setShowDeleteConfirm(null);
    }
  };

  const handleShowStats = (exercise) => {
    console.log('handleShowStats called with exercise:', exercise);
    setSelectedExerciseForStats(exercise);
    setShowStatsModal(true);
    console.log('showStatsModal set to true');
  };

  const handleCloseStats = () => {
    console.log('handleCloseStats called');
    setShowStatsModal(false);
    setSelectedExerciseForStats(null);
  };

  const handleRefresh = async () => {
    try {
      // Always fetch all exercises, filtering is done client-side
      const result = await fetchExercises({}, true); // forceRefresh = true
      if (result.success) {
        toast.success('Actualizado', { duration: 1500 });
      }
      return result;
    } catch (error) {
      toast.error('Error al actualizar');
      throw error;
    }
  };

  const renderContent = () => (
    <div className="exercises-container">
      {/* Header */}
      <div className="exercises-header">
        <h1 className="exercises-title">Ejercicios</h1>
        <div className="exercises-header-actions">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={18} />}
            onClick={handleOpenCreate}
          >
            Nuevo
          </Button>
          <MenuButton />
        </div>
      </div>

      {/* Search Bar */}
      <div className="exercises-search-container">
        <Search size={20} className="exercises-search-icon" />
        <input
          type="text"
          placeholder="Buscar ejercicios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="exercises-search-input"
        />
      </div>

      {/* Category Filters */}
      <div className="exercises-filters-container">
        <Filter size={16} color="#6B7280" />
        <div className="exercises-filters">
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`exercises-filter-chip ${selectedCategory === cat.value ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise List */}
      <div className="exercises-exercise-list">
        {isLoading && exercises.length === 0 ? (
          <div className="exercises-centered">
            <Spinner size="lg" />
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="exercises-empty-state">
            <p className="exercises-empty-text">
              {searchQuery || selectedCategory
                ? 'No se encontraron ejercicios con esos filtros'
                : 'No hay ejercicios. Crea el primero!'}
            </p>
            {!searchQuery && !selectedCategory && (
              <Button
                variant="primary"
                onClick={handleOpenCreate}
                leftIcon={<Plus size={18} />}
              >
                Crear ejercicio
              </Button>
            )}
          </div>
        ) : (
          filteredExercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise._id}
              exercise={exercise}
              index={index}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onShowStats={handleShowStats}
            />
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingExercise ? 'Editar ejercicio' : 'Nuevo ejercicio'}
        size="lg"
      >
        <ExerciseForm
          exercise={editingExercise}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Eliminar ejercicio"
        size="sm"
      >
        <div className="exercises-delete-confirm">
          <p className="exercises-delete-text">
            ¿Estás seguro de que quieres eliminar "{showDeleteConfirm?.name}"?
          </p>
          <p className="exercises-delete-warning">
            Esta acción no se puede deshacer.
          </p>
          <div className="exercises-delete-actions">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              isLoading={isLoading}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );

  return (
    <>
      <PullToRefresh
        onRefresh={handleRefresh}
        pullingContent=""
        refreshingContent={<div className="exercises-refreshing">Actualizando...</div>}
        pullDownThreshold={80}
        maxPullDownDistance={100}
        resistance={2}
      >
        {renderContent()}
      </PullToRefresh>

      {/* Stats Modal - outside PullToRefresh */}
      <AnimatePresence>
        {showStatsModal && selectedExerciseForStats && (
          <ExerciseProgressionChart
            key="stats-modal"
            exerciseId={selectedExerciseForStats._id}
            exerciseName={selectedExerciseForStats.name}
            onClose={handleCloseStats}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ExercisesPage;
