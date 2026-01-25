import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { Plus, Users, User } from 'lucide-react';
import { theme } from '../styles/theme';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import MenuButton from '../components/common/MenuButton';
import RoutineCard from '../components/routine/RoutineCard';
import useRoutineStore from '../store/routineStore';
import useExerciseStore from '../store/exerciseStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import './RoutinesPage.css';

const RoutinesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineDescription, setNewRoutineDescription] = useState('');

  const { user } = useAuthStore();
  const { exercises, fetchExercises, getExerciseDataMap } = useExerciseStore();
  const {
    routines,
    isLoading,
    error,
    fetchRoutines,
    createRoutine,
    deleteRoutine,
    activateRoutine,
    deactivateRoutine,
    copyRoutine,
    togglePrivacy,
    clearError
  } = useRoutineStore();

  // Fetch routines and exercises when user is available
  useEffect(() => {
    // Only fetch when user is loaded to ensure filtering works correctly
    const userId = user?.id || user?._id;
    if (userId) {
      fetchRoutines();
      fetchExercises();
    }
  }, [user]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error]);

  // Filter routines based on active tab
  // Handle both 'id' and '_id' for compatibility with MongoDB responses
  const userId = user?.id || user?._id;
  const myRoutines = routines.filter(r => {
    const routineUserId = r.userId?.toString();
    const creatorId = r.createdBy?._id || r.createdBy?.id;
    return routineUserId === userId || creatorId === userId;
  });
  const publicRoutines = routines.filter(r => !r.isPrivate);

  const displayedRoutines = activeTab === 'my' ? myRoutines : publicRoutines;

  const handleCreateRoutine = async () => {
    if (!newRoutineName.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    const result = await createRoutine({
      name: newRoutineName.trim(),
      description: newRoutineDescription.trim(),
      workoutDays: [],
      isPrivate: false
    });

    if (result.success) {
      toast.success('Rutina creada');
      setShowCreateModal(false);
      setNewRoutineName('');
      setNewRoutineDescription('');

      // Auto-activate if this is the first routine (no active routine exists)
      if (!routines.find(r => r.isActive)) {
        await activateRoutine(result.routine._id);
        toast.success('Rutina activada automáticamente');
      }

      // Navigate to builder
      navigate(`/routines/${result.routine._id}/edit`);
    }
  };

  const handleEdit = (routine) => {
    navigate(`/routines/${routine._id}/edit`);
  };

  const handleCopy = async (routineId) => {
    const result = await copyRoutine(routineId);
    if (result.success) {
      toast.success('Rutina copiada a tu cuenta');
    }
  };

  const handleDelete = (routine) => {
    setShowDeleteConfirm(routine);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      const result = await deleteRoutine(showDeleteConfirm._id);
      if (result.success) {
        toast.success('Rutina eliminada');
      }
      setShowDeleteConfirm(null);
    }
  };

  const handleActivate = async (routineId) => {
    const result = await activateRoutine(routineId);
    if (result.success) {
      toast.success('Rutina activada');
    }
  };

  const handleDeactivate = async () => {
    const result = await deactivateRoutine();
    if (result.success) {
      toast.success('Rutina desactivada');
    }
  };

  const handleTogglePrivacy = async (routineId, isPrivate) => {
    const result = await togglePrivacy(routineId, isPrivate);
    if (result.success) {
      toast.success(isPrivate ? 'Rutina marcada como privada' : 'Rutina marcada como pública');
    }
  };

  const handleRefresh = async () => {
    await fetchRoutines();
    toast.success('Actualizado', { duration: 1500 });
  };

  const renderContent = () => (
    <div className="routines-container">
      {/* Header */}
      <div className="routines-header">
        <h1 className="routines-title">Rutinas</h1>
        <div className="routines-header-actions">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={18} />}
            onClick={() => setShowCreateModal(true)}
          >
            Nueva
          </Button>
          <MenuButton />
        </div>
      </div>

      {/* Tabs */}
      <div className="routines-tabs">
        <button
          onClick={() => setActiveTab('my')}
          className="routines-tab"
        >
          <User size={18} />
          Mis Rutinas ({myRoutines.length})
        </button>
        <button
          onClick={() => setActiveTab('public')}
          className="routines-tab"
        >
          <Users size={18} />
          Públicas ({publicRoutines.length})
        </button>
      </div>

      {/* Routine List */}
      <div className="routines-routine-list">
        {isLoading && routines.length === 0 ? (
          <div className="routines-centered">
            <Spinner size="lg" />
          </div>
        ) : displayedRoutines.length === 0 ? (
          <div className="routines-empty-state">
            <p className="routines-empty-text">
              {activeTab === 'my'
                ? 'No tienes rutinas. Crea tu primera rutina!'
                : 'No hay rutinas públicas disponibles'}
            </p>
            {activeTab === 'my' && (
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                leftIcon={<Plus size={18} />}
              >
                Crear rutina
              </Button>
            )}
          </div>
        ) : (
          displayedRoutines.map((routine, index) => (
            <RoutineCard
              key={routine._id}
              routine={routine}
              currentUserId={user?.id}
              index={index}
              exerciseDataMap={getExerciseDataMap()}
              onEdit={handleEdit}
              onCopy={handleCopy}
              onDelete={handleDelete}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
              onTogglePrivacy={handleTogglePrivacy}
            />
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nueva rutina"
        size="md"
      >
        <div className="routines-create-form">
          <div className="routines-field">
            <label className="routines-label">Nombre *</label>
            <input
              type="text"
              value={newRoutineName}
              onChange={(e) => setNewRoutineName(e.target.value)}
              placeholder="Ej: Rutina Push Pull Legs"
              className="routines-input"
              autoFocus
            />
          </div>
          <div className="routines-field">
            <label className="routines-label">Descripción (opcional)</label>
            <textarea
              value={newRoutineDescription}
              onChange={(e) => setNewRoutineDescription(e.target.value)}
              placeholder="Descripción de la rutina..."
              rows={3}
              className="routines-textarea"
            />
          </div>
          <div className="routines-create-actions">
            <Button
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateRoutine}
              isLoading={isLoading}
            >
              Crear y editar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Eliminar rutina"
        size="sm"
      >
        <div className="routines-delete-confirm">
          <p className="routines-delete-text">
            ¿Estás seguro de que quieres eliminar "{showDeleteConfirm?.name}"?
          </p>
          <p className="routines-delete-warning">
            Esta acción no se puede deshacer y perderás todos los datos de la rutina.
          </p>
          <div className="routines-delete-actions">
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
    <PullToRefresh
      onRefresh={handleRefresh}
      pullingContent=""
      refreshingContent={<div className="routines-refreshing">Actualizando...</div>}
      pullDownThreshold={80}
      maxPullDownDistance={100}
      resistance={2}
    >
      {renderContent()}
    </PullToRefresh>
  );
};

export default RoutinesPage;
