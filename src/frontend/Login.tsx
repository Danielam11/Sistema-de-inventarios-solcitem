import * as React from 'react';
import { CssVarsProvider, extendTheme, useColorScheme } from '@mui/joy/styles';
import GlobalStyles from '@mui/joy/GlobalStyles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton, { IconButtonProps } from '@mui/joy/IconButton';
import Link from '@mui/joy/Link';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { useNavigate } from 'react-router-dom';

import logo from './img/LOGO-HORIZONTAL-SOLTICEM.png';

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
  persistent: HTMLInputElement;
}
interface SignInFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

function ColorSchemeToggle(props: IconButtonProps) {
  const { onClick, ...other } = props;
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <IconButton
      aria-label="toggle light/dark mode"
      size="sm"
      variant="outlined"
      disabled={!mounted}
      onClick={(event) => {
        setMode(mode === 'light' ? 'dark' : 'light');
        onClick?.(event);
      }}
      {...other}
    >
      {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
    </IconButton>
  );
}

const customTheme = extendTheme({ colorSchemes: { dark: { palette: { mode: 'dark' } } } });

export default function JoySignInSideTemplate() {
  const navigate = useNavigate(); // Hook para manejar la navegación

  const handleSubmit = async (event: React.FormEvent<SignInFormElement>) => {
    event.preventDefault();
    const formElements = event.currentTarget.elements;
    const data = {
      email: formElements.email.value,
      password: formElements.password.value,
       persistent: false,
    };

    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log(response)

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message);
        return;
      }

      const responseData = await response.json();
      localStorage.setItem('token', responseData.token); // Guarda el token de autenticación

      alert('Inicio de sesión exitoso');
      navigate('/dashboard'); // Redirige al Dashboard después de iniciar sesión
    } catch (error) {
      console.error('Error en la autenticación:', error);
      alert('Error en el servidor, por favor intenta más tarde.');
    }
  };

  return (
    <CssVarsProvider theme={customTheme} disableTransitionOnChange>
      <CssBaseline />
      <GlobalStyles
        styles={{
          ':root': {
            '--Form-maxWidth': '800px',
            '--Transition-duration': '0.4s',
          },
        }}
      />
      <Box
        sx={(theme) => ({
          width: { xs: '100%', md: '50vw' },
          transition: 'width var(--Transition-duration)',
          transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255 255 255 / 0.2)',
          [theme.getColorSchemeSelector('dark')]: {
            backgroundColor: 'rgba(19 19 24 / 0.4)',
          },
        })}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100dvh',
            width: '100%',
            px: 2,
          }}
        >
          <Box
          component="header"
          sx={{ 
            py: 3, 
            position: 'relative', 
            display: 'flex', 
            alignItems: 'center', 
          }}
        >
          {/* Logo centrado */}
          <Box 
            sx={{ 
              position: 'absolute', 
              left: '50%', 
              top:'50%',
              transform: 'translateX(-50%)', 
            }}
          >
            <Typography level="title-lg">
              <img src={logo} alt="SOLTICEM" style={{ width: '275px', height: 'auto' }} />
            </Typography>
          </Box>
          
          {/* Toggle alineado a la derecha */}
          <Box sx={{ ml: 'auto'  }}>
            <ColorSchemeToggle />
          </Box>
        </Box>

          <Box
            component="main"
            sx={{
              my: 'auto',
              py: 2,
              pb: 5,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: 400,
              maxWidth: '100%',
              mx: 'auto',
              borderRadius: 'sm',
              '& form': {
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              },
              [`& .MuiFormLabel-asterisk`]: {
                visibility: 'hidden',
              },
            }}
          >
            <Stack sx={{ gap: 4, mb: -2 }}>
              <Stack sx={{ gap: 1 }}>
                <Typography component="h1" level="h3">
                  Bienvenido!
                </Typography>
                <Typography level="body-sm">
                  Ingresa con tus credenciales
                </Typography>
              </Stack>
            </Stack>

            <Stack sx={{ gap: 4, mt: 2 }}>
            <form onSubmit={handleSubmit}>
          <FormControl required>
            <FormLabel>Usuario</FormLabel>
            <Input type="email" name="email" slotProps={{ input: { maxLength: 40 }}} />
          </FormControl>
          <FormControl required>
            <FormLabel>Contraseña</FormLabel>
            <Input type="password" name="password" slotProps={{ input: { maxLength: 40 }}} /> {/* Cambiado de "contrasena" a "password" */}
          </FormControl>
          <Stack sx={{ gap: 2, mt: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {/* <Checkbox size="sm" label="Recordar credenciales" name="persistent" /> */}
              <Link level="title-sm" href="#replace-with-a-link">
                {/* Forgot your password? */}
              </Link>
            </Box>
            <Button type="submit" fullWidth>
              Ingresar
            </Button>
          </Stack>
        </form>

            </Stack>
          </Box>
          <Box component="footer" sx={{ py: 3 }}>
            <Typography level="body-xs" sx={{ textAlign: 'center' }}>
              © Copyright SOLTICEM {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={(theme) => ({
          height: '100%',
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          left: { xs: 0, md: '50vw' },
          transition:
            'background-image var(--Transition-duration), left var(--Transition-duration) !important',
          transitionDelay: 'calc(var(--Transition-duration) + 0.1s)',
          backgroundColor: 'background.level1',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundImage:
           'url(https://www.extrasoft.es/wp-content/uploads/2022/10/5-TECNOLOGIAS-980x560.jpg)',
          [theme.getColorSchemeSelector('dark')]: {
            backgroundImage:
            'url(https://fundacionih.es/wp-content/uploads/2024/04/tech-devices-icons-connected-digital-planet-earth-scaled.jpg)',
          },
        })}
      />
    </CssVarsProvider>
  );
}
