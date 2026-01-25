import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { theme } from '../styles/theme';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register, isLoading, error } = useAuthStore();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = isRegisterMode
      ? await register(formData.username, formData.password, formData.name)
      : await login(formData.username, formData.password);

    if (result.success) {
      navigate('/');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const containerStyles = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    background: theme.colors.background.primary
  };

  const formContainerStyles = {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xl,
    padding: theme.spacing.xl,
    background: isRegisterMode
      ? `linear-gradient(135deg, ${theme.colors.success.main}08, ${theme.colors.primary.main}08)`
      : theme.colors.background.secondary,
    borderRadius: theme.borderRadius.xl,
    border: isRegisterMode
      ? `2px solid ${theme.colors.success.main}40`
      : `1px solid ${theme.colors.border.main}`,
    boxShadow: theme.shadows.lg
  };

  const logoStyles = {
    textAlign: 'center',
    marginBottom: theme.spacing.xl
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    background: theme.colors.primary.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: theme.spacing.sm
  };

  const subtitleStyles = {
    fontSize: theme.typography.fontSize.base,
    color: isRegisterMode ? theme.colors.success.main : theme.colors.text.secondary,
    fontWeight: isRegisterMode ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal
  };

  const formStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.lg
  };

  const toggleTextStyles = {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md
  };

  const linkStyles = {
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    textDecoration: 'none'
  };

  return (
    <div style={containerStyles}>
      <motion.div
        style={formContainerStyles}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={logoStyles}>
          <h1 style={titleStyles}>GymTracker</h1>
          <p style={subtitleStyles}>
            {isRegisterMode ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={formStyles}>
          {isRegisterMode && (
            <Input
              label="Nombre completo"
              type="text"
              name="name"
              placeholder="Tu nombre"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}

          <Input
            label="Nombre de usuario"
            type="text"
            name="username"
            placeholder="usuario"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                padding: theme.spacing.md,
                background: theme.colors.error.background,
                border: `1px solid ${theme.colors.error.main}`,
                borderRadius: theme.borderRadius.md,
                color: theme.colors.error.main,
                fontSize: theme.typography.fontSize.sm
              }}
            >
              {error}
            </motion.div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isLoading}
          >
            {isRegisterMode ? 'Registrarse' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div style={toggleTextStyles}>
          {isRegisterMode ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
          <span
            style={linkStyles}
            onClick={() => setIsRegisterMode(!isRegisterMode)}
          >
            {isRegisterMode ? 'Inicia sesión' : 'Regístrate'}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
