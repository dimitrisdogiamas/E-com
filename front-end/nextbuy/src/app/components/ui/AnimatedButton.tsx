'use client';

import { Button, ButtonProps, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledAnimatedButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: theme.spacing(3),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'left 0.5s',
  },
  
  '&:hover::before': {
    left: '100%',
  },
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
  },
  
  '&:active': {
    transform: 'translateY(0)',
  },
}));

interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, 
  ...props 
}) => {
  return (
    <StyledAnimatedButton {...props}>
      {children}
    </StyledAnimatedButton>
  );
}; 