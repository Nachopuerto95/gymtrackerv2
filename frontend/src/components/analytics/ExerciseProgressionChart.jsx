import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, X, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import './ExerciseProgressionChart.css';

const ExerciseProgressionChart = ({ exerciseId, exerciseName, onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBodyweight, setIsBodyweight] = useState(false);
  const fetchedRef = useRef(false);
  const currentExerciseIdRef = useRef(exerciseId);

  useEffect(() => {
    // Reset if exerciseId changes
    if (currentExerciseIdRef.current !== exerciseId) {
      fetchedRef.current = false;
      currentExerciseIdRef.current = exerciseId;
    }

    // Prevent duplicate fetches
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchProgressionData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/workouts/progression/${exerciseId}`);

        if (response.data.success) {
          setIsBodyweight(response.data.isBodyweight || false);

          // Format data for the chart
          const formattedData = response.data.data.map(item => ({
            date: new Date(item.date).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit'
            }),
            fullDate: new Date(item.date).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }),
            oneRM: item.oneRM,
            bestWeight: item.bestSet?.weight || 0,
            maxReps: item.maxReps,
            avgWeight: item.avgWeight,
            avgReps: item.avgReps,
            totalSets: item.totalSets,
            bestSet: item.bestSet
          }));

          setData(formattedData);
        }
      } catch (err) {
        console.error('Error fetching progression data:', err);
        setError('Error al cargar los datos de progresión');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressionData();
  }, [exerciseId]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="stats-chart-tooltip">
          <p className="stats-chart-tooltip-date">{data.fullDate}</p>
          <div className="stats-chart-tooltip-metrics">
            {isBodyweight ? (
              <>
                <p className="stats-chart-tooltip-metric primary">
                  Máx reps: {data.maxReps}
                </p>
                <p className="stats-chart-tooltip-metric secondary">
                  Reps medias: {data.avgReps}
                </p>
                <p className="stats-chart-tooltip-metric secondary">
                  Series: {data.totalSets}
                </p>
              </>
            ) : (
              <>
                <p className="stats-chart-tooltip-metric primary">
                  1RM: {data.oneRM} kg
                </p>
                <p className="stats-chart-tooltip-metric secondary">
                  Peso medio: {data.avgWeight} kg
                </p>
                <p className="stats-chart-tooltip-metric secondary">
                  Reps medias: {data.avgReps}
                </p>
                {data.bestSet && data.bestSet.weight > 0 && data.bestSet.reps > 0 && (
                  <p className="stats-chart-tooltip-metric secondary">
                    Mejor set: {data.bestSet.weight}kg × {data.bestSet.reps} reps
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  // Calculate progression percentage
  const calculateProgression = () => {
    if (data.length < 2) return null;

    if (isBodyweight) {
      const firstReps = data[0].maxReps;
      const lastReps = data[data.length - 1].maxReps;
      if (firstReps === 0) return null;
      const percentage = ((lastReps - firstReps) / firstReps) * 100;

      return {
        value: percentage.toFixed(1),
        isPositive: percentage >= 0
      };
    }

    const firstRM = data[0].oneRM;
    const lastRM = data[data.length - 1].oneRM;
    if (firstRM === 0) return null;
    const percentage = ((lastRM - firstRM) / firstRM) * 100;

    return {
      value: percentage.toFixed(1),
      isPositive: percentage >= 0
    };
  };

  const progression = calculateProgression();

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="stats-modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="stats-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header */}
          <div className="stats-modal-header">
            <div className="stats-modal-header-content">
              <div className="stats-modal-icon">
                <TrendingUp />
              </div>
              <div className="stats-modal-title-section">
                <h2 className="stats-modal-title">{exerciseName}</h2>
                <p className="stats-modal-subtitle">
                  {isBodyweight ? 'Evolución de repeticiones' : 'Evolución del peso'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="stats-modal-close-btn"
            >
              <X />
            </button>
          </div>

          {/* Content */}
          <div className="stats-modal-body">
            {loading ? (
              <div className="stats-modal-loading">
                <div className="stats-modal-spinner" />
                <p className="stats-modal-loading-text">Cargando datos...</p>
              </div>
            ) : error ? (
              <div className="stats-modal-error">
                <Activity className="stats-modal-error-icon" />
                <p className="stats-modal-error-text">{error}</p>
              </div>
            ) : data.length === 0 ? (
              <div className="stats-modal-empty">
                <Activity className="stats-modal-empty-icon" />
                <p className="stats-modal-empty-title">No hay datos de progresión disponibles</p>
                <p className="stats-modal-empty-subtitle">
                  Completa algunas sesiones de entrenamiento para ver tu evolución
                </p>
              </div>
            ) : (
              <>
                {/* Stats Summary */}
                {progression && (
                  <div className="stats-modal-summary">
                    <div className="stats-modal-summary-grid">
                      <div className="stats-modal-summary-item">
                        <p className="stats-modal-summary-label">Progresión total</p>
                        <p className={`stats-modal-summary-value ${progression.isPositive ? 'positive' : 'negative'}`}>
                          {progression.isPositive ? '+' : ''}
                          {progression.value}%
                        </p>
                      </div>
                      <div className="stats-modal-summary-item">
                        <p className="stats-modal-summary-label">Sesiones registradas</p>
                        <p className="stats-modal-summary-value neutral">{data.length}</p>
                      </div>
                      <div className="stats-modal-summary-item">
                        <p className="stats-modal-summary-label">
                          {isBodyweight ? 'Máx reps actual' : '1RM actual'}
                        </p>
                        <p className="stats-modal-summary-value primary">
                          {isBodyweight
                            ? data[data.length - 1].maxReps
                            : `${data[data.length - 1].oneRM} kg`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Best Set Highlight */}
                {data.length > 0 && data[data.length - 1].bestSet && (
                  isBodyweight ? (
                    data[data.length - 1].bestSet.reps > 0 && (
                      <div className="stats-modal-best-set">
                        <div className="stats-modal-best-set-header">
                          <div className="stats-modal-best-set-icon">
                            <TrendingUp size={20} />
                          </div>
                          <div className="stats-modal-best-set-content">
                            <p className="stats-modal-best-set-label">Mejor serie del último entrenamiento</p>
                            <p className="stats-modal-best-set-value">
                              {data[data.length - 1].bestSet.reps} repeticiones
                            </p>
                          </div>
                          {data[data.length - 1].bestSet.totalReps && (
                            <div className="stats-modal-best-set-content stats-modal-best-set-total">
                              <p className="stats-modal-best-set-label">Reps totales</p>
                              <p className="stats-modal-best-set-value">
                                {data[data.length - 1].bestSet.totalReps}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    data[data.length - 1].bestSet.weight > 0 &&
                    data[data.length - 1].bestSet.reps > 0 && (
                      <div className="stats-modal-best-set">
                        <div className="stats-modal-best-set-header">
                          <div className="stats-modal-best-set-icon">
                            <TrendingUp size={20} />
                          </div>
                          <div className="stats-modal-best-set-content">
                            <p className="stats-modal-best-set-label">Mejor serie del último entrenamiento</p>
                            <p className="stats-modal-best-set-value">
                              {data[data.length - 1].bestSet.weight}kg × {data[data.length - 1].bestSet.reps} reps
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}

                {/* Chart */}
                <div className="stats-modal-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                        domain={[
                          dataMin => Math.floor(dataMin * 0.9),
                          dataMax => Math.ceil(dataMax * 1.1)
                        ]}
                        label={{
                          value: isBodyweight ? 'Repeticiones' : 'Peso (kg)',
                          angle: -90,
                          position: 'insideLeft',
                          style: { fill: '#9CA3AF', fontSize: '12px' }
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: '14px' }}
                        iconType="line"
                      />
                      <Line
                        type="monotone"
                        dataKey={isBodyweight ? 'maxReps' : 'bestWeight'}
                        stroke="#06b6d4"
                        strokeWidth={3}
                        dot={{ fill: '#06b6d4', r: 5 }}
                        activeDot={{ r: 7 }}
                        name={isBodyweight ? 'Máx Repeticiones' : 'Peso mejor serie (kg)'}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Info Box */}
                <div className="stats-modal-info">
                  {isBodyweight ? (
                    <>
                      <p className="stats-modal-info-title">
                        Progresión de repeticiones
                      </p>
                      <p className="stats-modal-info-text">
                        Esta gráfica muestra tu máximo de repeticiones por sesión para este ejercicio
                        de peso corporal. El tooltip muestra las reps medias y el total de series de
                        cada sesión.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="stats-modal-info-title">
                        Evolución del peso de tu mejor serie
                      </p>
                      <p className="stats-modal-info-text">
                        Esta gráfica muestra el peso de tu mejor serie por sesión (la que tiene mayor 1RM estimado).
                        El tooltip muestra el 1RM estimado y los promedios de esa sesión.
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
};

export default ExerciseProgressionChart;
