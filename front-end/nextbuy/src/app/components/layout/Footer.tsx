import { Box, Container, Typography, Grid, Link as MuiLink } from '@mui/material';
import Link from 'next/link';

export const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper',
        py: 4,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              NextBuy
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your trusted e-commerce platform for quality products at great prices.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/products" passHref>
                <MuiLink component="span" variant="body2" sx={{ cursor: 'pointer' }}>
                  Products
                </MuiLink>
              </Link>
              <Link href="/cart" passHref>
                <MuiLink component="span" variant="body2" sx={{ cursor: 'pointer' }}>
                  Cart
                </MuiLink>
              </Link>
              <Link href="/wishlist" passHref>
                <MuiLink component="span" variant="body2" sx={{ cursor: 'pointer' }}>
                  Wishlist
                </MuiLink>
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Account
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/auth/login" passHref>
                <MuiLink component="span" variant="body2" sx={{ cursor: 'pointer' }}>
                  Login
                </MuiLink>
              </Link>
              <Link href="/auth/register" passHref>
                <MuiLink component="span" variant="body2" sx={{ cursor: 'pointer' }}>
                  Register
                </MuiLink>
              </Link>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ 
          mt: 4, 
          pt: 2, 
          borderTop: '1px solid', 
          borderColor: 'divider',
          textAlign: 'center' 
        }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} NextBuy. All rights reserved. | Built for Thesis Project
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

// have a look at the footer code