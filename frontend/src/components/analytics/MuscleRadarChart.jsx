import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Activity, X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  calculateMuscleStimulus,
  normalizeForRadar,
  formatStimulus,
  getTopMuscles,
  MUSCLE_COLORS
} from '../../utils/muscleStimulus';
import './MuscleRadarChart.css';

/**
 * MuscleRadarChart - Displays muscle activation distribution
 *
 * @param {Object} props
 * @param {Array} props.exercises - Array of exercises with sets data
 * @param {Object} props.exerciseDataMap - Map of exerciseId to {baseStimulus, muscleContribution}
 * @param {boolean} props.hasWeight - Whether exercises have actual weight data (default: true)
 * @param {string} props.title - Title to display in the modal
 * @param {string} props.subtitle - Subtitle to display
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {string} props.color - Primary color for the radar (default: cyan)
 */
const MuscleRadarChart = ({
  exercises = [],
  exerciseDataMap = {},
  hasWeight = true,
  title = 'Activación Muscular',
  subtitle = '',
  onClose,
  color = '#00D9FF'
}) => {
  const [chartData, setChartData] = useState([]);
  const [topMuscles, setTopMuscles] = useState([]);
  const [totalStimulus, setTotalStimulus] = useState(0);

  useEffect(() => {
    if (exercises.length === 0) return;

    const { muscleStimulus, maxStimulus } = calculateMuscleStimulus(
      exercises,
      exerciseDataMap,
      hasWeight
    );

    const radarData = normalizeForRadar(muscleStimulus, maxStimulus);
    const top = getTopMuscles(muscleStimulus, 3);
    const total = Object.values(muscleStimulus).reduce((sum, val) => sum + val, 0);

    setChartData(radarData);
    setTopMuscles(top);
    setTotalStimulus(total);
  }, [exercises, exerciseDataMap, hasWeight]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="muscle-radar-tooltip">
          <p className="muscle-radar-tooltip-label">{data.label}</p>
          <p className="muscle-radar-tooltip-value">
            {formatStimulus(data.rawValue, hasWeight)}
          </p>
          <p className="muscle-radar-tooltip-percent">{data.value}% del máx.</p>
        </div>
      );
    }
    return null;
  };

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="muscle-radar-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="muscle-radar-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="muscle-radar-header">
          <div className="muscle-radar-header-content">
            <div className="muscle-radar-icon" style={{ backgroundColor: `${color}20` }}>
              <Activity style={{ color }} />
            </div>
            <div className="muscle-radar-title-section">
              <h2 className="muscle-radar-title">{title}</h2>
              {subtitle && <p className="muscle-radar-subtitle">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="muscle-radar-close-btn">
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="muscle-radar-body">
          {exercises.length === 0 || chartData.length === 0 ? (
            <div className="muscle-radar-empty">
              <Activity className="muscle-radar-empty-icon" />
              <p className="muscle-radar-empty-title">Sin datos de activación</p>
              <p className="muscle-radar-empty-subtitle">
                Añade ejercicios para ver la distribución muscular
              </p>
            </div>
          ) : (
            <>
              {/* Top Muscles Summary */}
              <div className="muscle-radar-summary">
                <div className="muscle-radar-summary-header">
                  <Zap size={16} style={{ color }} />
                  <span>Músculos más activados</span>
                </div>
                <div className="muscle-radar-top-muscles">
                  {topMuscles.map((muscle, index) => (
                    <div key={muscle.muscle} className="muscle-radar-top-item">
                      <span
                        className="muscle-radar-top-rank"
                        style={{
                          backgroundColor: `${muscle.color}20`,
                          color: muscle.color
                        }}
                      >
                        #{index + 1}
                      </span>
                      <span className="muscle-radar-top-name">{muscle.label}</span>
                      <span className="muscle-radar-top-value">
                        {formatStimulus(muscle.value, hasWeight)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Radar Chart */}
              <div className="muscle-radar-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis
                      dataKey="label"
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      tickLine={false}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      tickCount={5}
                      axisLine={false}
                    />
                    <Radar
                      name="Activación"
                      dataKey="value"
                      stroke={color}
                      fill={color}
                      fillOpacity={0.3}
                      strokeWidth={2}
                      dot={{
                        fill: color,
                        r: 4,
                        strokeWidth: 0
                      }}
                      activeDot={{
                        fill: color,
                        r: 6,
                        stroke: '#fff',
                        strokeWidth: 2
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Total Stimulus */}
              <div className="muscle-radar-total">
                <span className="muscle-radar-total-label">Volumen total estimado</span>
                <span className="muscle-radar-total-value" style={{ color }}>
                  {formatStimulus(totalStimulus, hasWeight)}
                </span>
              </div>

            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
};

export default MuscleRadarChart;
